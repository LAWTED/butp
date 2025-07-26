# 🚀 CAS认证部署完成检查清单

## ✅ 已完成的步骤

### 1. 代码迁移和构建修复 ✓
- ✅ 更新了4个文件的旧认证系统引用
- ✅ 修复了所有TypeScript编译错误
- ✅ 清理了ESLint警告
- ✅ 构建成功完成 (`npm run build`)

### 2. 代理服务器部署 ✓
- ✅ 在`10.3.58.3:8080`成功部署代理服务器
- ✅ PM2进程管理正常运行
- ✅ 健康检查端点工作正常

### 3. 本地CAS功能验证 ✓
- ✅ Mock CAS登录页面 (`/api/mock/cas/login`) 返回200
- ✅ 用户API端点 (`/api/auth/user`) 正确返回401
- ✅ 所有CAS API端点已构建并部署

## 🔄 接下来需要完成的步骤

### 步骤4: 本地Mock CAS完整测试

**操作方法**：
1. 打开浏览器访问：`http://localhost:3000/profile`
2. 应该自动重定向到Mock CAS登录页面
3. 使用测试账号登录（如：学号`2021211001`，密码`test123`）
4. 验证能否成功返回并显示用户信息

**预期结果**：
- ✅ 自动跳转到Mock CAS登录页面
- ✅ 能够使用测试账号登录
- ✅ 登录后显示用户信息（姓名：张三，学号：2021211001）
- ✅ 侧边栏正确显示用户信息
- ✅ 可以正常访问其他受保护页面

### 步骤5: 配置生产环境

**在butp.tech服务器上执行**：

```bash
# 1. 进入项目目录
cd /path/to/your/nextjs/project

# 2. 创建生产环境配置
cat > .env.local << 'EOF'
NEXT_PUBLIC_SITE_URL=https://butp.tech
SESSION_SECRET_KEY=你的超安全32位以上密钥
NODE_ENV=production
EOF

# 3. 生成安全密钥
openssl rand -base64 32
# 将生成的密钥替换到SESSION_SECRET_KEY

# 4. 安装依赖并构建
npm install
npm run build

# 5. 启动应用
pm2 start npm --name "butp-app" -- start
pm2 save
```

### 步骤6: 测试生产环境CAS认证

**测试流程**：

1. **访问受保护页面**：
   ```
   https://butp.tech/profile
   ```

2. **验证CAS登录流程**：
   - 应该重定向到：`https://auth.bupt.edu.cn/authserver/login?service=http://10.3.58.3:8080/api/auth/cas/callback`
   - 使用真实北邮账号登录
   - CAS回调到：`http://10.3.58.3:8080/api/auth/cas/callback?ticket=xxx`
   - 代理转发到：`https://butp.tech/api/auth/cas/verify?ticket=xxx`
   - 最终返回：`https://butp.tech/profile`

3. **验证用户信息**：
   - 侧边栏显示真实姓名和学号
   - 可以访问所有受保护页面
   - 登出功能正常工作

## 🔍 测试和验证命令

### 本地测试
```bash
# 检查Mock CAS登录页面
curl http://localhost:3000/api/mock/cas/login?service=http://localhost:3000/api/auth/cas/callback

# 检查用户API（应该返回401）
curl http://localhost:3000/api/auth/user
```

### 生产环境测试
```bash
# 测试代理服务器健康状态
curl http://10.3.58.3:8080/health

# 测试应用健康状态
curl https://butp.tech/api/auth/user

# 测试代理回调功能
curl -I "http://10.3.58.3:8080/api/auth/cas/callback?ticket=test"
```

## 🎯 完整认证流程图

### 本地开发环境 (Mock CAS)
```
用户访问 localhost:3000/profile
    ↓
重定向到 localhost:3000/api/mock/cas/login
    ↓
用户选择测试账号登录
    ↓
回调到 localhost:3000/api/auth/cas/callback?ticket=mock-xxx
    ↓
验证mock ticket，创建会话
    ↓
重定向到 localhost:3000/profile，显示用户信息
```

### 生产环境 (真实CAS)
```
用户访问 butp.tech/profile
    ↓
重定向到 auth.bupt.edu.cn/authserver/login?service=10.3.58.3:8080/api/auth/cas/callback
    ↓
用户输入北邮账号密码
    ↓
CAS回调到 10.3.58.3:8080/api/auth/cas/callback?ticket=ST-xxx
    ↓
代理转发到 butp.tech/api/auth/cas/verify?ticket=ST-xxx
    ↓
验证真实ticket，获取用户信息，创建会话
    ↓
重定向到 butp.tech/profile，显示真实用户信息
```

## 🎉 部署完成标志

当以下所有项目都通过时，CAS认证功能部署完成：

### 本地开发环境
- [ ] 访问`localhost:3000/profile`能跳转到Mock CAS
- [ ] 能使用测试账号成功登录
- [ ] 登录后正确显示mock用户信息
- [ ] 侧边栏用户信息显示正确
- [ ] 登出功能正常工作

### 生产环境
- [ ] 代理服务器在`10.3.58.3:8080`正常运行
- [ ] 应用已部署到`https://butp.tech`
- [ ] 访问`butp.tech/profile`能跳转到真实CAS
- [ ] 能使用真实北邮账号登录
- [ ] 登录后正确显示真实用户信息
- [ ] 所有受保护页面正常访问
- [ ] 会话管理功能正常

## 🚨 常见问题排查

### 问题1: Mock CAS登录失败
- 检查`NODE_ENV=development`是否设置
- 确认开发服务器在`localhost:3000`运行

### 问题2: 生产环境CAS登录失败
- 确认`NODE_ENV=production`已设置
- 检查代理服务器状态：`./cas-proxy-ctl.sh status`
- 查看代理服务器日志：`./cas-proxy-ctl.sh logs`

### 问题3: 会话无法创建
- 确认`SESSION_SECRET_KEY`长度≥32字符
- 检查HTTPS证书是否有效
- 验证cookie设置是否正确

### 问题4: 用户信息显示异常
- 确认所有代码迁移已完成
- 检查浏览器控制台JavaScript错误
- 验证`/api/auth/user`端点返回数据

## 📞 需要帮助时的检查项目

1. **代理服务器日志**: `./cas-proxy-ctl.sh logs`
2. **Next.js应用日志**: `pm2 logs butp-app`
3. **浏览器开发者工具**: Network标签查看请求
4. **CAS服务器可访问性**: `https://auth.bupt.edu.cn/authserver`
5. **环境变量配置**: 检查`.env.local`文件内容 