#基于node:20-alpine镜像构建
FROM node:20-alpine

#设置工作目录
WORKDIR /usr/src/app

#复制代码文件
COPY . .

#安装依赖
RUN npm install

#开放3000端口
EXPOSE 3000

#创建entrypoint
RUN chmod +x ./docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh"]

#启动命令
CMD ["node", "app.js"]
