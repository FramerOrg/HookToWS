// 导入依赖
const http = require("http");
const WebSocket = require("ws");
const url = require("url");

// 读取env配置
require("dotenv").config();

// 存储活跃的WebSocket连接
const activeConnections = new Map();

// 读取WebSocket认证令牌
const AUTH_TOKEN = process.env.WS_AUTH_TOKEN;

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  // 处理Webhook请求
  if (req.method === "POST" && req.url.startsWith("/webhook/")) {
    const path = req.url.split("/")[2]; // 自定义WebHook路径
    let body = [];

    req
      .on("data", (chunk) => {
        body.push(chunk);
      })
      .on("end", () => {
        body = Buffer.concat(body).toString();

        // 如果未创建该WebHook路径
        if (!path) {
          res.writeHead(400, { "Content-Type": "text/plain" });
          return res.end("Missing path in webhook URL");
        }

        // 获取该WebHook路径对应的WebSocket连接
        const ws = activeConnections.get(path);
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(body);
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end("Webhook received and forwarded to WebSocket client");
        } else {
          res.writeHead(503, { "Content-Type": "text/plain" });
          res.end("No active WebSocket connection for this path");
        }
      });
  } else {
    res.writeHead(404);
    res.end();
  }
});

const wss = new WebSocket.Server({
  server,
  verifyClient: (info, done) => {
    try {
      const parsedUrl = url.parse(info.req.url, true);
      const query = parsedUrl.query;
      const clientToken = query.token;
      const path = query.path;

      // 验证token和path都存在
      if (!clientToken || !path) {
        console.warn(
          `Missing parameters from ${info.req.socket.remoteAddress}`
        );
        return done(false, 400, "Token and path are required");
      }

      // 验证WebSocket认证令牌
      if (clientToken === AUTH_TOKEN) {
        return done(true);
      }

      // 如果认证失败
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
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.query.path;

  // 验证path参数存在
  if (!path) {
    console.error("Connection attempt without path parameter");
    return ws.close(4000, "Path parameter missing");
  }

  // 关闭该WebHook路径的现有WebSocket连接
  const existingConnection = activeConnections.get(path);
  if (existingConnection) {
    existingConnection.close(1000, "Replaced by new connection");
  }

  // 存储新WebSocket连接
  activeConnections.set(path, ws);
  console.log(
    `New client connected for path: ${path} (${req.socket.remoteAddress})`
  );

  ws.on("close", (code, reason) => {
    // 只有当当前WebSocket连接是活跃连接时才移除
    if (activeConnections.get(path) === ws) {
      activeConnections.delete(path);
      console.log(
        `Connection closed for path: ${path} (${code}: ${
          reason || "No reason"
        })`
      );
    }
  });

  // 处理WebSocket错误
  ws.on("error", (err) => {
    console.error(`WebSocket error on path ${path}:`, err);
    if (activeConnections.get(path) === ws) {
      activeConnections.delete(path);
    }
  });
});

// 启动HTTP服务器
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
