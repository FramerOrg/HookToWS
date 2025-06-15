# HookToWS

Convert Webhook To Websocket

## Install

```shell
git clone https://github.com/FramerOrg/HookToWS.git
mv HookToWS/* . && rm -rf HookToWS  # optional
npm install
echo 'WS_AUTH_TOKEN=your_secure_token_here' >> '.env'
echo 'PORT=8080' >> '.env'
node app.js
```

## Usage

1. Connect to WebSocket

```plaintext
ws://<your_domain>:<port>/?token=<your_token>&path=<your_path>
```

2. Use WebHook

```plaintext
http://<your_domain>:<port>/webhook/<your_path>
```

## Demo

人民云灵车搭建，屏蔽国外入站

> 地址：150.138.78.253:10047

1. 连接 WebSocket

```plaintext
ws://150.138.78.253:10047/?token=auth1234&path=<your_path>
```

2. 使用 WebHook

```plaintext
http://150.138.78.253:10047/webhook/<your_path>
```
