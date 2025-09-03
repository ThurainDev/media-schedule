#!/bin/bash

# Deployment script for Ministry Schedule Backend
# Run this script on your Digital Ocean droplet

set -e  # Exit on any error

echo "🚀 Starting deployment of Ministry Schedule Backend..."

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
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_status "Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "npm version: $(npm -v)"

# Check if PM2 is installed globally
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 is not installed. Installing PM2 globally..."
    npm install -g pm2
    print_status "PM2 installed successfully"
else
    print_status "PM2 version: $(pm2 -v)"
fi

# Create logs directory if it doesn't exist
if [ ! -d "./logs" ]; then
    mkdir -p ./logs
    print_status "Created logs directory"
fi

# Install dependencies
print_status "Installing dependencies..."
npm install --production

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Please create one based on env.production.template"
    print_status "Copying template: cp env.production.template .env"
    cp env.production.template .env
    print_warning "Please edit .env file with your production values before starting the server"
fi

# Set proper permissions
chmod 600 .env
print_status "Set proper permissions for .env file"

# Stop existing PM2 process if running
if pm2 list | grep -q "ministry-schedule-backend"; then
    print_status "Stopping existing PM2 process..."
    pm2 stop ministry-schedule-backend
    pm2 delete ministry-schedule-backend
fi

# Start the application with PM2
print_status "Starting application with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
print_status "PM2 configuration saved"

# Setup PM2 to start on boot
pm2 startup
print_status "PM2 startup script generated"

# Show PM2 status
print_status "PM2 Status:"
pm2 list

# Show application logs
print_status "Application logs (last 20 lines):"
pm2 logs ministry-schedule-backend --lines 20

print_status "✅ Deployment completed successfully!"
print_status "Your application is now running with PM2"
print_status "Use 'pm2 logs ministry-schedule-backend' to view logs"
print_status "Use 'pm2 restart ministry-schedule-backend' to restart"
print_status "Use 'pm2 stop ministry-schedule-backend' to stop"
