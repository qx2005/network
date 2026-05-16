# Docker 运行说明

## 启动

在项目根目录：

```bash
docker compose up --build
```

浏览器打开：**http://localhost:7777/**（前端 + 同域 `/api` 反代，无需本机装 Node 跑双进程）。

API 也可直连调试：**http://localhost:3000/api**

## 停止并清理容器 / 网络

```bash
docker compose down
```

若还要删掉构建缓存镜像（更彻底）：

```bash
docker compose down --rmi local
```

## 端口冲突

- `7777`：改 `docker-compose.yml` 里 `web.ports` 左侧，例如 `"9080:80"`。
- `3000`：改 `api.ports` 左侧，并同步把 `docker/nginx.conf` 里 `proxy_pass` 改为对应主机端口（若只改映射不改服务名，容器内仍为 `api:3000`，一般只改 compose 映射即可）。

## 开发模式

日常改代码仍可用本机：`npm run dev`。Docker 适合「干净复现」与演示环境。
