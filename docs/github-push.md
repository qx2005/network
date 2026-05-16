# 将代码提交并推送到 GitHub

English: How to commit local changes and push them to the remote GitHub repository.

本文说明在本仓库中把修改提交到 Git，并推送到 GitHub 的常用流程与安全注意点。

## 前置条件

- 已安装 [Git](https://git-scm.com/)。
- 拥有 GitHub 账号，并对目标仓库有 **push** 权限。
- 本仓库远程地址示例：`https://github.com/qx2005/network.git`（以 `git remote -v` 实际输出为准）。

### 首次克隆（新环境）

```bash
git clone https://github.com/qx2005/network.git
cd network
npm install
```

### 身份认证（HTTPS）

推送时 GitHub 会校验身份，任选其一：

- **Personal Access Token（PAT）**：在 GitHub → Settings → Developer settings → Personal access tokens 创建；密码处填写 PAT（不要用账号密码）。
- **SSH**：配置 SSH key 后，将远程改为 `git@github.com:qx2005/network.git`。

## 日常提交流程

### 1. 查看状态与差异

```bash
git status
git diff
```

确认仅包含预期变更；勿提交 `.env`、密钥及已被 `.gitignore` 忽略的构建产物（如 `node_modules/`、`dist/`）。

### 2. 暂存文件

```bash
# 暂存全部已跟踪变更 + 符合忽略规则外的新文件
git add -A

# 或只添加指定路径
git add apps/web/src/ apps/api/src/
```

### 3. 提交（写好说明）

```bash
git commit -m "feat: 简要说明本条提交的目的"
```

说明建议：**一句话说明「为什么改」**，必要时第二段写要点列表。

本项目常用前缀（可选）：`feat:` 新功能、`fix:` 修复、`docs:` 文档、`refactor:` 重构。

### 4. 推送到 GitHub

当前分支一般为 `main`：

```bash
git push origin main
```

若使用新分支：

```bash
git checkout -b feature/my-change
git push -u origin feature/my-change
```

之后在 GitHub 上发起 **Pull Request** 合并进 `main`。

### 5. 推送前与远程同步（多人协作时）

```bash
git fetch origin
git status
# 若落后远程，可先 rebase 或 merge（团队约定为准）
git pull origin main --rebase
git push origin main
```

## 远程仓库信息

| 项 | 说明 |
|----|------|
| 仓库地址 | [https://github.com/qx2005/network](https://github.com/qx2005/network) |
| 查看远程 | `git remote -v` |
| 修改远程（示例） | `git remote set-url origin https://github.com/qx2005/network.git` |

## 安全与规范（建议）

- **不要**在仓库中提交密码、Token、私钥；敏感配置用环境变量或本地未跟踪文件。
- **不要**对 `main` 使用 `git push --force` 覆盖历史，除非团队有明确流程且你清楚后果。
- **不要**跳过钩子强行提交（如 `--no-verify`），除非维护者要求且你了解风险。
- 大文件、生成物应依赖 `.gitignore`，避免污染历史。

## 与本仓库相关的命令速查

```bash
# 根目录：同时开发 API + Web
npm run dev

# 仅构建
npm run build

# 仅构建某个 workspace
npm run build -w api
npm run build -w web
```

## 故障排查

| 现象 | 可能原因 | 处理方向 |
|------|----------|----------|
| `Authentication failed` | HTTPS 未用 PAT / SSH 未配置 | 按上文配置 PAT 或 SSH |
| `rejected (non-fast-forward)` | 远程有新提交 | 先 `git pull` 再推送 |
| `403` / 无权限 | 非仓库协作者 | 请仓库 Owner 加权限或 Fork 后 PR |

---

文档版本：随仓库维护更新；具体分支策略以团队约定为准。
