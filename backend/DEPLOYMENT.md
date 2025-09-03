# 🚀 Digital Ocean Droplet Deployment Guide

This guide will help you deploy your Ministry Schedule Backend to a Digital Ocean droplet.

## 📋 Prerequisites

- Digital Ocean account
- A droplet with Ubuntu 22.04 LTS or newer
- Domain name (optional but recommended)
- SSH access to your droplet

## 🏗️ Droplet Setup

### 1. Create a Droplet

1. Log into Digital Ocean
2. Click "Create" → "Droplets"
3. Choose Ubuntu 22.04 LTS
4. Select your preferred plan (Basic $6/month minimum recommended)
5. Choose a datacenter region close to your users
6. Add your SSH key or create a password
7. Click "Create Droplet"

### 2. Initial Server Setup

```bash
# SSH into your droplet
ssh root@your-droplet-ip

# Create a new user (recommended)
adduser deploy
usermod -aG sudo deploy

# Switch to the new user
su - deploy
```

### 3. Install Required Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx (optional, for reverse proxy)
sudo apt install nginx -y

# Install Docker (optional, for containerized deployment)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Certbot for SSL (optional)
sudo apt install certbot python3-certbot-nginx -y
```

## 📁 Application Deployment

### Option 1: Direct Deployment (Recommended for beginners)

```bash
# Clone your repository or upload files
git clone https://github.com/yourusername/ministry-schedule.git
cd ministry-schedule/backend

# Install dependencies
npm install --production

# Create environment file
cp env.production.template .env
nano .env  # Edit with your production values

# Make deployment script executable
chmod +x deploy.sh

# Run deployment script
./deploy.sh
```

### Option 2: Docker Deployment

```bash
# Navigate to backend directory
cd ministry-schedule/backend

# Create environment file
cp env.production.template .env
nano .env  # Edit with your production values

# Build and run with Docker Compose
docker-compose up -d

# Check status
docker-compose ps
```

### Option 3: Manual PM2 Deployment

```bash
# Navigate to backend directory
cd ministry-schedule/backend

# Install dependencies
npm install --production

# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

## 🔧 Environment Configuration

Edit your `.env` file with production values:

```bash
# Production Environment Variables
NODE_ENV=production
PORT=4000

# MongoDB Connection (use your production MongoDB)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT Configuration (generate a strong secret)
JWT_SECRET=your-super-secure-jwt-secret-key-here

# CORS Configuration (your domain)
FRONTEND_URL=https://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Security
SESSION_SECRET=your-super-secure-session-secret-key-here
```

## 🌐 Domain & SSL Setup (Optional)

### 1. Point Domain to Droplet

1. Go to your domain registrar
2. Add an A record pointing to your droplet's IP address
3. Wait for DNS propagation (can take up to 48 hours)

### 2. Configure Nginx

```bash
# Edit Nginx configuration
sudo nano /etc/nginx/sites-available/yourdomain.com

# Add your domain configuration
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable the site
sudo ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. Install SSL Certificate

```bash
# Install SSL certificate with Let's Encrypt
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## 📊 Monitoring & Maintenance

### PM2 Commands

```bash
# View all processes
pm2 list

# View logs
pm2 logs ministry-schedule-backend

# Restart application
pm2 restart ministry-schedule-backend

# Stop application
pm2 stop ministry-schedule-backend

# Delete application
pm2 delete ministry-schedule-backend

# Monitor resources
pm2 monit
```

### Docker Commands (if using Docker)

```bash
# View containers
docker ps

# View logs
docker logs ministry-schedule-backend

# Restart container
docker restart ministry-schedule-backend

# Update application
docker-compose down
git pull
docker-compose up -d --build
```

## 🔒 Security Considerations

1. **Firewall Setup**
   ```bash
   sudo ufw allow ssh
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```

2. **Regular Updates**
   ```bash
   sudo apt update && sudo apt upgrade -y
   npm update -g pm2
   ```

3. **Backup Strategy**
   - Regular database backups
   - Application code backups
   - Environment configuration backups

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   sudo lsof -i :4000
   sudo kill -9 <PID>
   ```

2. **PM2 not starting on boot**
   ```bash
   pm2 startup
   pm2 save
   ```

3. **Permission denied**
   ```bash
   sudo chown -R $USER:$USER /path/to/app
   chmod +x deploy.sh
   ```

4. **MongoDB connection issues**
   - Check network connectivity
   - Verify connection string
   - Check firewall rules

### Logs Location

- **PM2 logs**: `~/.pm2/logs/`
- **Application logs**: `./logs/`
- **Nginx logs**: `/var/log/nginx/`
- **System logs**: `/var/log/syslog`

## 📈 Performance Optimization

1. **Enable compression** (already configured)
2. **Use CDN** for static assets
3. **Database indexing** for better query performance
4. **Load balancing** for high traffic (multiple droplets)

## 🔄 Deployment Updates

### Automated Deployment

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install --production

# Restart application
pm2 restart ministry-schedule-backend
```

### Zero-Downtime Deployment

```bash
# Start new instance
pm2 start ecosystem.config.js --env production --name ministry-schedule-backend-new

# Wait for health check
curl http://localhost:4001/health

# Switch traffic (if using load balancer)
# Stop old instance
pm2 stop ministry-schedule-backend
pm2 delete ministry-schedule-backend

# Rename new instance
pm2 restart ministry-schedule-backend-new --name ministry-schedule-backend
```

## 📞 Support

If you encounter issues:

1. Check the logs: `pm2 logs ministry-schedule-backend`
2. Verify environment variables
3. Check network connectivity
4. Review this deployment guide
5. Check Digital Ocean documentation

---

**Happy Deploying! 🎉**
