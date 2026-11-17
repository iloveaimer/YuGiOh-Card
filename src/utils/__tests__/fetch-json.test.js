import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchJsonWithTimeout } from '../fetch-json.js';

const withFetch = async (mock, run) => {
  const original = globalThis.fetch;
  globalThis.fetch = mock;
  try {
    return await run();
  } finally {
    globalThis.fetch = original;
  }
};

test('相同地址的在途请求合并为一次', () => {
  let calls = 0;
  return withFetch(async () => {
    calls += 1;
    await new Promise(resolve => setTimeout(resolve, 20));
    return { json: async () => ({ ok: true }) };
  }, async () => {
    const [a, b] = await Promise.all([
      fetchJsonWithTimeout('https://example.test/card/1'),
      fetchJsonWithTimeout('https://example.test/card/1'),
    ]);
    assert.equal(calls, 1);
    assert.deepEqual(a, { ok: true });
    assert.deepEqual(b, { ok: true });
  });
});

test('请求完成后同地址可再次发起', () => {
  let calls = 0;
  return withFetch(async () => {
    calls += 1;
    return { json: async () => ({ n: calls }) };
  }, async () => {
    await fetchJsonWithTimeout('https://example.test/card/2');
    const second = await fetchJsonWithTimeout('https://example.test/card/2');
    assert.deepEqual(second, { n: 2 });
    assert.equal(calls, 2);
  });
});

test('响应体挂起时超时中断', () => {
  return withFetch(async (_url, options) => ({
    json: () => new Promise((_resolve, reject) => {
      options.signal.addEventListener('abort', () => reject(new Error('aborted')));
    }),
  }), async () => {
    await assert.rejects(
      () => fetchJsonWithTimeout('https://example.test/slow', {}, 30),
      /aborted/,
    );
  });
});
