const http = require("http");
const WebSocket = require("ws");
const url = require("url");

// 加载环境变量
require("dotenv").config();

// 存储当前活跃的 WebSocket 连接
let activeConnection = null;

// 获取鉴权令牌
const AUTH_TOKEN = process.env.WS_AUTH_TOKEN;

// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
  // Webhook 处理端点
  if (req.method === "POST" && req.url === "/webhook") {
    let body = [];

    req
      .on("data", (chunk) => {
        body.push(chunk);
      })
      .on("end", () => {
        body = Buffer.concat(body).toString();

        // 如果有活跃的 WebSocket 连接
        if (
          activeConnection &&
          activeConnection.readyState === WebSocket.OPEN
        ) {
          activeConnection.send(body);
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end("Webhook received and forwarded to WebSocket client");
        } else {
          res.writeHead(503, { "Content-Type": "text/plain" });
          res.end("No active WebSocket connection available");
        }
      });
  } else {
    res.writeHead(404);
    res.end();
  }
});

// 创建 WebSocket 服务器
const wss = new WebSocket.Server({
  server,
  // 添加连接验证回调
  verifyClient: (info, done) => {
    try {
      // 解析 URL 查询参数
      const parsedUrl = url.parse(info.req.url, true);
      const clientToken = parsedUrl.query.token;

      // 验证令牌
      if (clientToken === AUTH_TOKEN) {
        return done(true);
      }

      console.warn(
        `Unauthorized connection attempt from ${info.req.socket.remoteAddress}`
      );
      done(false, 401, "Unauthorized");
    } catch (err) {
      console.error("Token verification error:", err);
      done(false, 500, "Internal Server Error");
    }
  },
});

wss.on("connection", (ws, req) => {
  // 关闭现有连接（如果存在）
  if (activeConnection) {
    activeConnection.close();
  }

  // 设置新连接为活跃连接
  activeConnection = ws;
  console.log(
    `New authorized WebSocket client connected from ${req.socket.remoteAddress}`
  );

  // 连接关闭处理
  ws.on("close", () => {
    if (activeConnection === ws) {
      activeConnection = null;
      console.log("WebSocket client disconnected");
    }
  });

  // 错误处理
  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
  });
});

// 获取端口（优先使用环境变量）
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
