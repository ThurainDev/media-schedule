#!/bin/bash

# Quick Fix Script for Nginx Configuration Issue
# Run this script on your Digital Ocean droplet to fix the nginx error

set -e  # Exit on any error

echo "🔧 Fixing nginx configuration issue..."

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

# Stop nginx if it's running
print_status "Stopping nginx..."
systemctl stop nginx 2>/dev/null || true

# Backup current configuration
print_status "Backing up current configuration..."
if [ -f /etc/nginx/conf.d/default ]; then
    cp /etc/nginx/conf.d/default /etc/nginx/conf.d/default.backup.$(date +%Y%m%d_%H%M%S)
fi

# Install simple working configuration
print_status "Installing simple working configuration..."
cp nginx-simple.conf /etc/nginx/conf.d/default

# Test nginx configuration
print_status "Testing nginx configuration..."
if nginx -t; then
    print_status "✅ Nginx configuration is valid"
else
    print_error "❌ Nginx configuration test failed"
    print_status "Restoring backup configuration..."
    cp /etc/nginx/conf.d/default.backup.* /etc/nginx/conf.d/default 2>/dev/null || true
    exit 1
fi

# Start nginx
print_status "Starting nginx..."
systemctl start nginx

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

# Show nginx status
print_status "Nginx Status:"
systemctl status nginx --no-pager -l

print_status "✅ Nginx fixed and running successfully!"
print_status ""
print_status "📋 Your configuration now:"
print_status "   - /api/* → Backend (port 4000)"
print_status "   - / → Frontend (port 5173)"
print_status "   - /health → Health check"
print_status ""
print_status "🌐 Test your endpoints:"
print_status "   - Frontend: http://your-ip-address/"
print_status "   - Backend: http://your-ip-address/api/"
print_status "   - Health: http://your-ip-address/health"
print_status ""
print_status "🔧 To add rate limiting later, you can:"
print_status "   1. Edit /etc/nginx/nginx.conf"
print_status "   2. Add rate limiting zones to the http block"
print_status "   3. Restart nginx"
