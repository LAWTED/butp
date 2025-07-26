# Ubuntu用户版CAS代理服务部署指南

## 🎯 适用环境

- **系统**: Ubuntu/Debian
- **权限**: 普通用户（无需root权限）
- **用户**: bupt
- **端口**: 8080

## 🚀 一键部署

### 1. 下载并运行部署脚本

```bash
# 确保以bupt用户身份运行
whoami  # 应该显示: bupt

# 运行部署脚本
bash deploy-cas-proxy.sh
```

### 2. 部署过程

脚本将自动完成以下步骤：

1. ✅ 检测系统环境（Ubuntu）
2. ✅ 验证用户身份（bupt）
3. ✅ 安装Node.js（通过nvm）
4. ✅ 创建项目目录（~/cas-proxy）
5. ✅ 初始化Node.js项目
6. ✅ 创建代理服务器代码
7. ✅ 安装PM2进程管理器
8. ✅ 配置并启动服务
9. ✅ 创建管理脚本

### 3. 部署完成

部署成功后会显示：

```
╔══════════════════════════════════════════════════════════════╗
║                     部署完成                                ║
╠══════════════════════════════════════════════════════════════╣
║  服务名称: cas-proxy                                         ║
║  服务地址: http://10.3.58.3:8080                            ║
║  回调地址: http://10.3.58.3:8080/api/auth/cas/callback      ║
║  目标域名: https://butp.tech                                 ║
║  项目目录: /home/bupt/cas-proxy                              ║
║  运行用户: bupt                                              ║
║  进程管理: PM2                                               ║
╚══════════════════════════════════════════════════════════════╝
```

## 🔧 服务管理

### 使用便捷脚本（推荐）

```bash
# 查看服务状态
./cas-proxy-ctl.sh status

# 重启服务
./cas-proxy-ctl.sh restart

# 查看日志
./cas-proxy-ctl.sh logs

# 健康检查
./cas-proxy-ctl.sh health

# 停止服务
./cas-proxy-ctl.sh stop

# 启动服务
./cas-proxy-ctl.sh start
```

### 使用PM2命令

```bash
# 查看所有PM2进程
pm2 list

# 查看服务状态
pm2 status cas-proxy

# 重启服务
pm2 restart cas-proxy

# 查看日志
pm2 logs cas-proxy

# 停止服务
pm2 stop cas-proxy

# 启动服务
pm2 start cas-proxy

# 删除服务
pm2 delete cas-proxy

# 实时监控
pm2 monit
```

## 📁 目录结构

```
/home/bupt/
├── cas-proxy/                    # 主项目目录
│   ├── server.js                 # 代理服务器代码
│   ├── package.json              # Node.js项目配置
│   ├── ecosystem.config.js       # PM2配置文件
│   ├── cas-proxy-ctl.sh          # 管理脚本
│   ├── logs/                     # 日志目录
│   │   ├── combined.log          # 综合日志
│   │   ├── out.log               # 输出日志
│   │   └── error.log             # 错误日志
│   └── node_modules/             # 依赖包
└── cas-proxy-ctl.sh              # 管理脚本快捷链接
```

## 🔍 测试验证

### 1. 健康检查

```bash
curl http://10.3.58.3:8080/health
```

期望返回：
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "CAS Proxy Server",
  "version": "1.0.0"
}
```

### 2. 回调测试

```bash
curl -I "http://10.3.58.3:8080/api/auth/cas/callback?ticket=test"
```

期望返回302重定向到butp.tech。

### 3. 根路径信息

```bash
curl http://10.3.58.3:8080/
```

会返回服务基本信息。

## 🛠️ 故障排除

### 问题1: Node.js安装失败

**解决方案**:
```bash
# 手动安装nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

# 重新加载shell
source ~/.bashrc

# 安装Node.js
nvm install --lts
nvm use --lts
```

### 问题2: 端口被占用

**解决方案**:
```bash
# 查看端口占用
netstat -tulpn | grep :8080

# 停止占用进程
kill -9 <PID>
```

### 问题3: PM2启动失败

**解决方案**:
```bash
# 检查PM2状态
pm2 list

# 清除PM2进程
pm2 kill

# 重新启动
pm2 start ~/cas-proxy/ecosystem.config.js
```

### 问题4: 权限问题

**解决方案**:
```bash
# 检查文件权限
ls -la ~/cas-proxy/

# 修复权限
chmod +x ~/cas-proxy/server.js
chmod +x ~/cas-proxy/cas-proxy-ctl.sh
```

## 🔥 防火墙配置

**注意**: 普通用户无法配置防火墙，需要系统管理员协助：

```bash
# 请系统管理员执行
sudo ufw allow 8080/tcp

# 或使用iptables
sudo iptables -A INPUT -p tcp --dport 8080 -j ACCEPT
```

## 📊 监控和维护

### 查看系统资源

```bash
# 查看内存使用
free -h

# 查看磁盘使用
df -h

# 查看CPU使用
top
```

### 查看服务日志

```bash
# 实时查看日志
tail -f ~/cas-proxy/logs/combined.log

# 查看最近100行日志
tail -n 100 ~/cas-proxy/logs/combined.log

# 搜索错误日志
grep "ERROR" ~/cas-proxy/logs/error.log
```

### 开机自启设置

```bash
# 生成启动脚本（需要管理员权限执行生成的命令）
pm2 startup

# 保存当前进程列表
pm2 save
```

## 🎉 部署成功

完成以上步骤后，CAS代理服务已成功部署并运行在 `http://10.3.58.3:8080`！

可以配合您的Next.js应用 (`butp.tech`) 使用了。 