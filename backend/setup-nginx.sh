#!/bin/bash

# Nginx Setup Script for Ministry Schedule Project
# Run this script on your Digital Ocean droplet after installing nginx

set -e  # Exit on any error

echo "🔧 Setting up Nginx configuration for Ministry Schedule Project..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root (use sudo)"
   exit 1
fi

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    print_error "Nginx is not installed. Please install nginx first:"
    echo "sudo apt update && sudo apt install nginx -y"
    exit 1
fi

print_status "Nginx version: $(nginx -v 2>&1)"

# Backup existing default configuration
if [ -f /etc/nginx/sites-available/default ]; then
    print_status "Backing up existing default configuration..."
    cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup.$(date +%Y%m%d_%H%M%S)
fi

# Copy our custom configuration
print_status "Installing custom nginx configuration..."
cp nginx-default.conf /etc/nginx/sites-available/default

# Test nginx configuration
print_status "Testing nginx configuration..."
if nginx -t; then
    print_status "Nginx configuration is valid"
else
    print_error "Nginx configuration test failed"
    exit 1
fi

# Remove default nginx welcome page
if [ -f /var/www/html/index.nginx-debian.html ]; then
    print_status "Removing default nginx welcome page..."
    rm /var/www/html/index.nginx-debian.html
fi

# Create a simple health check page
print_status "Creating health check page..."
cat > /var/www/html/health.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Server Health</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .status { padding: 20px; border-radius: 5px; margin: 10px 0; }
        .ok { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
    </style>
</head>
<body>
    <h1>Server Health Status</h1>
    <div class="status ok">
        <strong>✅ Nginx Server:</strong> Running
    </div>
    <div class="status ok">
        <strong>🌐 Port 80:</strong> Active
    </div>
    <p>This page confirms that nginx is working correctly.</p>
    <p>Your Ministry Schedule application should be accessible at:</p>
    <ul>
        <li><strong>Frontend:</strong> http://your-domain.com/</li>
        <li><strong>Backend API:</strong> http://your-domain.com/api/</li>
        <li><strong>Health Check:</strong> http://your-domain.com/health</li>
    </ul>
</body>
</html>
EOF

# Set proper permissions
chown www-data:www-data /var/www/html/health.html
chmod 644 /var/www/html/health.html

# Restart nginx
print_status "Restarting nginx..."
systemctl restart nginx

# Check nginx status
if systemctl is-active --quiet nginx; then
    print_status "✅ Nginx is running successfully"
else
    print_error "❌ Nginx failed to start"
    systemctl status nginx
    exit 1
fi

# Enable nginx to start on boot
print_status "Enabling nginx to start on boot..."
systemctl enable nginx

# Configure firewall (if ufw is available)
if command -v ufw &> /dev/null; then
    print_status "Configuring firewall..."
    ufw allow 'Nginx Full'
    print_status "Firewall configured for nginx"
else
    print_warning "ufw not found. Please configure your firewall manually to allow ports 80 and 443"
fi

# Show nginx status
print_status "Nginx Status:"
systemctl status nginx --no-pager -l

# Show listening ports
print_status "Listening ports:"
ss -tlnp | grep :80

print_status "✅ Nginx setup completed successfully!"
print_status ""
print_status "📋 Next steps:"
print_status "1. Make sure your backend is running on port 4000"
print_status "2. Make sure your frontend is running on port 5173"
print_status "3. Test your endpoints:"
print_status "   - Frontend: http://your-ip-address/"
print_status "   - Backend: http://your-ip-address/api/"
print_status "   - Health: http://your-ip-address/health"
print_status ""
print_status "🔧 Useful nginx commands:"
print_status "   - Check status: systemctl status nginx"
print_status "   - Restart: systemctl restart nginx"
print_status "   - Reload config: systemctl reload nginx"
print_status "   - View logs: tail -f /var/log/nginx/access.log"
print_status "   - View error logs: tail -f /var/log/nginx/error.log"
