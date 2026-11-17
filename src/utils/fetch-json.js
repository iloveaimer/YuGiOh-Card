// 超时范围覆盖响应头与响应体，避免服务端只发 headers 后挂起 body 时加载态常驻。
// 相同 URL 与参数的在途请求合并为一个，避免连点或语言切换发出重复网络请求。
export const FETCH_TIMEOUT = 8000;

const fetchInFlight = new Map();

export const fetchJsonWithTimeout = async (url, options = {}, timeout = FETCH_TIMEOUT) => {
  const key = `${url}|${JSON.stringify(options)}`;
  if (fetchInFlight.has(key)) return fetchInFlight.get(key);
  const task = (async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const resp = await fetch(url, { ...options, signal: controller.signal });
      return await resp.json();
    } finally {
      clearTimeout(timer);
    }
  })();
  fetchInFlight.set(key, task);
  try {
    return await task;
  } finally {
    fetchInFlight.delete(key);
  }
};
