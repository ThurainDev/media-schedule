# 🌐 Nginx Deployment Guide for Ministry Schedule

This guide covers setting up nginx as a reverse proxy for your Ministry Schedule application on Digital Ocean.

## 📋 What This Configuration Does

- **Port 80**: Listens for HTTP requests
- **`/api/*`**: Routes to your backend server (port 4000)
- **`/`**: Routes to your frontend React app (port 5173)
- **Security**: Includes rate limiting, CORS headers, and security headers
- **Performance**: Gzip compression and static asset optimization

## 🚀 Quick Deployment Steps

### 1. Install Nginx on Your Droplet

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install nginx
sudo apt install nginx -y

# Check nginx status
sudo systemctl status nginx
```

### 2. Upload Configuration Files

Upload these files to your droplet:
- `nginx-default.conf` → Your nginx configuration
- `setup-nginx.sh` → Automated setup script

### 3. Run the Setup Script

```bash
# Make script executable
chmod +x setup-nginx.sh

# Run as root
sudo ./setup-nginx.sh
```

## 🔧 Manual Setup (Alternative)

If you prefer to set up manually:

### 1. Backup Default Configuration

```bash
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup
```

### 2. Replace Default Configuration

```bash
sudo cp nginx-default.conf /etc/nginx/sites-available/default
```

### 3. Test Configuration

```bash
sudo nginx -t
```

### 4. Restart Nginx

```bash
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 🌍 Domain Configuration (Optional)

### 1. Point Domain to Droplet

Add an A record in your domain registrar:
```
Type: A
Name: @
Value: YOUR_DROPLET_IP
TTL: 3600
```

### 2. Update Nginx Configuration

Edit `/etc/nginx/sites-available/default`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    # ... rest of configuration
}
```

### 3. Reload Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 SSL/HTTPS Setup (Recommended)

### 1. Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Get SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 3. Auto-renewal

```bash
sudo certbot renew --dry-run
```

## 📊 Testing Your Setup

### 1. Test Nginx

```bash
# Check nginx status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Check listening ports
sudo ss -tlnp | grep :80
```

### 2. Test Endpoints

```bash
# Test nginx health page
curl http://your-ip-address/health.html

# Test backend API (should return 502 if backend not running)
curl http://your-ip-address/api/

# Test frontend (should return 502 if frontend not running)
curl http://your-ip-address/
```

## 🚨 Troubleshooting

### Common Issues

1. **502 Bad Gateway**
   - Backend/frontend not running
   - Check if services are running on correct ports
   - Check firewall settings

2. **Permission Denied**
   - Check file permissions
   - Ensure nginx can read configuration files

3. **Port Already in Use**
   ```bash
   sudo lsof -i :80
   sudo kill -9 <PID>
   ```

4. **Configuration Errors**
   ```bash
   sudo nginx -t
   sudo tail -f /var/log/nginx/error.log
   ```

### Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log

# Nginx status
sudo systemctl status nginx
```

## 🔄 Updating Configuration

### 1. Edit Configuration

```bash
sudo nano /etc/nginx/sites-available/default
```

### 2. Test and Reload

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Restart if Needed

```bash
sudo systemctl restart nginx
```

## 📈 Performance Optimization

### 1. Enable Gzip (Already configured)

```bash
# Check if gzip is working
curl -H "Accept-Encoding: gzip" -I http://your-domain.com/
```

### 2. Static Asset Caching

Static assets are automatically cached for 1 year with immutable headers.

### 3. Rate Limiting

- API endpoints: 10 requests/second with burst of 20
- Login endpoints: 5 requests/minute

## 🔍 Monitoring

### 1. Check Nginx Status

```bash
sudo systemctl status nginx
sudo nginx -t
```

### 2. Monitor Logs

```bash
# Real-time access logs
sudo tail -f /var/log/nginx/access.log

# Real-time error logs
sudo tail -f /var/log/nginx/error.log
```

### 3. Check Resource Usage

```bash
# Check nginx processes
ps aux | grep nginx

# Check memory usage
free -h

# Check disk usage
df -h
```

## 📋 Complete Deployment Checklist

- [ ] Nginx installed and running
- [ ] Configuration file uploaded and installed
- [ ] Configuration tested (`nginx -t`)
- [ ] Nginx restarted and enabled
- [ ] Firewall configured (ports 80, 443)
- [ ] Backend running on port 4000
- [ ] Frontend running on port 5173
- [ ] All endpoints responding correctly
- [ ] Domain configured (optional)
- [ ] SSL certificate installed (optional)

## 🆘 Emergency Commands

```bash
# Stop nginx
sudo systemctl stop nginx

# Start nginx
sudo systemctl start nginx

# Restart nginx
sudo systemctl restart nginx

# Reload configuration
sudo systemctl reload nginx

# Check nginx status
sudo systemctl status nginx

# View nginx logs
sudo journalctl -u nginx
```

---

**Your nginx reverse proxy is now ready to serve your Ministry Schedule application! 🎉**
