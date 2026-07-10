# 🔐 Token 设置指南

## 1. 编辑 .env 文件

打开文件（用你熟悉的编辑器）：

```bash
nano .env
# 或
vim .env
# 或
code .env
```

找到这一行：

```
GITHUB_TOKEN=PASTE_YOUR_GITHUB_TOKEN_HERE
```

把 `PASTE_YOUR_GITHUB_TOKEN_HERE` 替换成你的真实 token。

**示例**（这是假的！）：
```
GITHUB_TOKEN=github_pat_11AAAAAAA0BBBBBBBB1CCCCCCCC2DDDDDDDD3EEEEEEEE
```

**不要**用引号包裹 token。**不要**在前面加 `=`。直接粘贴即可。

保存并退出。

## 2. 验证 .env 正确

```bash
source scripts/load-env.sh VERIFY
```

应该看到：

```
Checking .env variables...

  ✅ GITHUB_TOKEN = gith...xxxx (length: 93)
  ⚠️  VERCEL_TOKEN is not set or still has placeholder
  ⚠️  VERCEL_PROJECT_ID is not set or still has placeholder
  ⚠️  VERCEL_ORG_ID is not set or still has placeholder

❌ 4 variable(s) need to be set in .env
```

**关键**：
- `GITHUB_TOKEN` 应该显示 `✅` 并且长度看起来对（GitHub PAT 大约 90+ 字符）
- **只显示前 4 + 后 4 字符**，不会泄露完整 token
- `VERCEL_*` 显示 `⚠️` 是正常的（Vercel 凭证第一次部署后才需要）

## 3. 确认 token 不会泄露

```bash
# 检查 .env 没有被 git 跟踪
git status .env
# 应该输出: nothing to commit (or .env is ignored)

# 检查 .gitignore 正确
grep "^\.env" .gitignore
# 应该输出: .env*
```

## 4. 之后我怎么用 token

我（assistant）会**永远不会直接读 .env 的内容**。我会：

```bash
# 在我跑的 shell 命令里 source 这个脚本
source scripts/load-env.sh
# 然后用 $GITHUB_TOKEN 引用变量
git push https://x-access-token:$GITHUB_TOKEN@github.com/... main
```

**关键安全点**：
- token 永远只在 shell 进程内存里
- 不会进任何工具调用的可见参数
- 不会进 git commit
- 不会进日志

## 5. 如果 token 误泄露

立即去 https://github.com/settings/personal-access-tokens 删除，然后：
1. `cp .env.example .env`（重置）
2. 重新生成 token
3. 按上面步骤填

---

**需要我帮你做？** 任何时候说"完成"或"OK"，我会自动跑 `source scripts/load-env.sh VERIFY` 确认 token 填好。
