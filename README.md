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

## Docker

```shell
docker pull runoneall/hook-to-ws
docker run -d --name hook-to-ws -p 3000:3000 -e WS_AUTH_TOKEN=your_secure_token_here -e PORT=3000 runoneall/hook-to-ws
```
