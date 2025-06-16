#!/bin/sh

# 创建或清空 .env 文件
: >.env

# 将所有环境变量写入 .env 文件（排除特定变量）
env | while read -r line; do
    # 跳过不需要的变量
    case "$line" in
    HOME=* | PATH=* | PWD=* | SHLVL=* | _=* | TERM=* | HOSTNAME=* | LANG=* | LC_*=* | DOCKER_*=*)
        continue
        ;;
    *)
        echo "$line" >>.env
        ;;
    esac
done

# 执行 Docker CMD
exec "$@"
