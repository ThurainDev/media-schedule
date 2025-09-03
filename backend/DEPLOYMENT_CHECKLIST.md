# 🚀 Quick Deployment Checklist

## ✅ Pre-Deployment
- [ ] Digital Ocean droplet created (Ubuntu 22.04+)
- [ ] SSH access configured
- [ ] Domain pointed to droplet IP (optional)
- [ ] MongoDB connection string ready

## 🛠️ Server Setup
- [ ] Node.js 18+ installed
- [ ] PM2 installed globally
- [ ] Nginx installed (optional)
- [ ] Firewall configured (SSH, 80, 443)

## 📁 Application Deployment
- [ ] Code uploaded to droplet
- [ ] `.env` file created with production values
- [ ] Dependencies installed (`npm install --production`)
- [ ] `deploy.sh` script made executable
- [ ] Deployment script run successfully

## 🔧 Configuration
- [ ] Environment variables set correctly
- [ ] CORS origins configured for your domain
- [ ] JWT secret changed from default
- [ ] MongoDB connection tested

## 🌐 Domain & SSL (Optional)
- [ ] Domain A record pointing to droplet
- [ ] Nginx configuration updated
- [ ] SSL certificate installed
- [ ] HTTPS redirect working

## 📊 Verification
- [ ] Application starts without errors
- [ ] Health check endpoint responding (`/health`)
- [ ] API endpoints working
- [ ] PM2 process running
- [ ] PM2 startup configured

## 🔒 Security
- [ ] Environment file permissions set (600)
- [ ] Strong JWT secret configured
- [ ] Rate limiting working
- [ ] Security headers enabled

## 📈 Monitoring
- [ ] Logs directory created
- [ ] PM2 monitoring working
- [ ] Health checks configured
- [ ] Backup strategy planned

---

## 🚨 Quick Commands

```bash
# Check status
pm2 list
pm2 logs ministry-schedule-backend

# Restart
pm2 restart ministry-schedule-backend

# Stop
pm2 stop ministry-schedule-backend

# Health check
curl http://localhost:4000/health
```

## 📞 Emergency Contacts
- Check logs: `pm2 logs ministry-schedule-backend`
- Restart app: `pm2 restart ministry-schedule-backend`
- View status: `pm2 monit`
- Check system: `htop`, `df -h`, `free -h`
