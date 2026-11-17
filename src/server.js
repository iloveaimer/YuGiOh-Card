import http from 'http';
import path from 'path';
import { YugiohCard } from 'yugioh-card';
import skia from 'skia-canvas';
import yugiohDemo from '@/assets/demo/yugioh-demo';

const PORT = 3000;
const RENDER_TIMEOUT = 10000;

// 卡片实例持有画布与字体注册，创建成本高；进程内复用一份，按请求串行导出，
// 避免并发导出同一张画布。
const card = new YugiohCard({
  data: yugiohDemo,
  resourcePath: path.resolve('./src/assets/yugioh-card'),
  skia,
});

let renderQueue = Promise.resolve();

const withTimeout = (promise, ms) => {
  let timer = null;
  const timeout = new Promise((resolve, reject) => {
    timer = setTimeout(() => reject(new Error(`渲染超时（${ms}ms）`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
};

const renderCard = () => {
  const task = renderQueue.then(() => card.leafer.export('png', {
    screenshot: true,
  }));
  // 队列只用于串行化，前一次失败不能阻断后续请求
  renderQueue = task.catch(() => {});
  return withTimeout(task, RENDER_TIMEOUT);
};

const requestHandler = (req, res) => {
  renderCard().then(result => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(`<img src="${result.data}" />`);
    res.end();
  }).catch(err => {
    // export 的 Promise 拒绝必须兜住：否则请求悬挂、客户端一直等不到响应
    console.error('[server] 卡片渲染失败:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('card render failed');
  });
};

const startServer = () => {
  const server = http.createServer(requestHandler);
  // 端口占用等异常必须显式监听，否则未捕获的 error 事件会直接终止进程
  server.on('error', err => {
    console.error('[server] 服务异常:', err);
  });
  server.listen(PORT, () => {
    console.log(`server is running at http://localhost:${PORT}`);
  });
  return server;
};

const previousServer = global.__server__;
if (previousServer) {
  // close 是异步的，必须等旧实例释放端口后再监听；closeAllConnections 避免 keep-alive 连接拖住 close
  previousServer.close(() => {
    global.__server__ = startServer();
  });
  previousServer.closeAllConnections?.();
} else {
  global.__server__ = startServer();
}
