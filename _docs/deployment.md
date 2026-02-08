rsync -avz --exclude-from='rsyncignore.txt' ./ admskl@bracevps:/home/admskl/v3/
ssh admskl@bracevps

Setup Instructions:

- Copy all files to your project structure
- Create .env file from .env.example
- Run npm install
- Run SQL schema file: psql -U user -d pet_care -f sql/schema.sql
- Run seed file: psql -U user -d pet_care -f sql/seed.sql
- Start server: npm run dev


### Phase 1: VPS Initial Setup & Prerequisites

## Step 1: Server Preparation
# Connect to your VPS
ssh root@your-vps-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git vim nano rsync

# Create deployment user (recommended for security)
sudo adduser deploy
sudo usermod -aG sudo deploy
su - deploy

## Step 2: Install Docker & Docker Compose
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker-compose --version

# Phase 2: PostgreSQL & pgAdmin Deployment
## Step 3: Create Docker Compose Configuration
# Create project directory
mkdir -p ~/app/database
cd ~/app/database

# Create docker-compose.yml
nano docker-compose.yml

## Step 4: Create Environment File
nano .env
# PostgreSQL Configuration
POSTGRES_USER=admin
POSTGRES_PASSWORD=your_strong_password_here
POSTGRES_DB=app_db

# pgAdmin Configuration
PGADMIN_EMAIL=admin@yourdomain.com
PGADMIN_PASSWORD=your_pgadmin_password_here

## Step 5: Optional Database Initialization
nano init.sql
-- Create additional users if needed
CREATE USER app_user WITH PASSWORD 'app_user_password';
GRANT ALL PRIVILEGES ON DATABASE app_db TO app_user;

-- Create schema if needed
CREATE SCHEMA IF NOT EXISTS app_schema;
GRANT ALL ON SCHEMA app_schema TO app_user;

## Step 6: Start Database Services
# Start containers in detached mode
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Access pgAdmin at: http://your-vps-ip:5050
# Login with credentials from .env file


Phase 3: Application Deployment
Step 7: Prepare Local Environment
# In your local project directory
# Create deployment configuration files

# .env.production (for Node.js backend)
nano .env.production
# Database Configuration
DB_HOST=your-vps-ip
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=your_strong_password_here
DB_NAME=app_db

# Application Configuration
NODE_ENV=production
PORT=3000
FRONTEND_URL=http://your-domain.com

# JWT and Security
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

Step 8: Build React Frontend

# In your React/Vite project directory
npm run build

# This creates a 'dist' folder with optimized production files

# Create deployment script locally
nano deploy.sh
```bash
#!/bin/bash

# Configuration
REMOTE_USER="deploy"
REMOTE_HOST="your-vps-ip"
REMOTE_DIR="/home/deploy/app"
LOCAL_DIR="./"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting deployment...${NC}"

# Sync files to server
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.env' \
  --exclude 'dist' \
  --exclude '*.log' \
  --exclude '.DS_Store' \
  $LOCAL_DIR \
  ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/

echo -e "${GREEN}Files synced successfully!${NC}"
echo -e "${YELLOW}SSH into server to complete deployment:${NC}"
echo "ssh ${REMOTE_USER}@${REMOTE_HOST}"
echo "cd ${REMOTE_DIR}"
echo "npm install"
echo "npm run build"
echo "pm2 start ecosystem.config.js"
```

chmod +x deploy.sh

Phase 4: Server-Side Application Setup
Step 10: Install Node.js & PM2 on VPS
```bash
# On VPS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Verify installation
node --version
npm --version
pm2 --version
```

Step 11: Create PM2 Ecosystem Configuration
cd ~/app
nano ecosystem.config.js
```bash
module.exports = {
  apps: [
    {
      name: 'backend-api',
      script: './server.js', // or your main entry file
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      time: true
    },
    {
      name: 'frontend',
      script: './node_modules/serve/bin/serve.js',
      args: '-s dist -l 5000',
      instances: 1,
      autorestart: true,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```

Step 12: Deploy Application
```bash
# Make deployment directory
mkdir -p ~/app
cd ~/app

# Create logs directory
mkdir -p logs

# Run deployment from local machine
./deploy.sh

# SSH into server
ssh deploy@your-vps-ip
cd ~/app

# Install dependencies
npm install --production

# Build React application
npm run build

# Start application with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 process list
pm2 save

# Setup PM2 startup
pm2 startup
# Follow the instructions to run the generated command

# Monitor applications
pm2 status
pm2 logs
```

Phase 5: Nginx Configuration
Step 13: Install & Configure Nginx
```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/your-app.conf
```
```nginx
upstream backend_api {
    server 127.0.0.1:3000;
}

upstream frontend_app {
    server 127.0.0.1:5000;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    client_max_body_size 10M;

    # SSL Configuration (will be added later with Let's Encrypt)
    
    # Frontend
    location / {
        proxy_pass http://frontend_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support (if needed)
    location /ws/ {
        proxy_pass http://backend_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}

# pgAdmin access (optional, can be secured separately)
server {
    listen 5050;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:5050;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Phase 6: SSL Certificate with Let's Encrypt
Step 15: Install Certbot & Get SSL Certificate

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is set up automatically
# Test renewal
sudo certbot renew --dry-run
```
Phase 7: Monitoring & Maintenance
Step 16: Setup Monitoring
```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs backend-api --lines 100
pm2 logs frontend --lines 100

# Database monitoring
docker stats

# System monitoring
htop
```

Step 17: Backup Strategy
# Create backup script
nano ~/backup.sh

```bash
#!/bin/bash

# Backup configuration
BACKUP_DIR="/home/deploy/backups"
DATE=$(date +%Y%m%d_%H%M%S)
POSTGRES_CONTAINER="postgres_db"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup PostgreSQL database
docker exec $POSTGRES_CONTAINER pg_dump -U admin app_db > $BACKUP_DIR/db_backup_$DATE.sql

# Backup application files
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz /home/deploy/app

# Backup Docker volumes
docker run --rm -v postgres_data:/volume -v $BACKUP_DIR:/backup alpine \
  tar czf /backup/docker_volumes_$DATE.tar.gz -C /volume ./

# Remove backups older than 30 days
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $DATE"
```

chmod +x ~/backup.sh

# Add to crontab for daily backups
crontab -e

# Daily backup at 2 AM
0 2 * * * /home/deploy/backup.sh


Quick Reference Commands
Deployment Workflow:
```bash
# Local deployment
./deploy.sh

# On server after deployment
cd ~/app
npm install --production
npm run build
pm2 restart all
```

Database Management:

```bash
# Access PostgreSQL
docker exec -it postgres_db psql -U admin -d app_db

# Access pgAdmin
# http://your-vps-ip:5050

# View database logs
docker-compose logs -f postgres
```

Application Management:


```bash
# PM2 commands
pm2 status          # View all processes
pm2 logs            # View logs
pm2 restart all     # Restart all apps
pm2 stop all        # Stop all apps
pm2 start all       # Start all apps

# Nginx commands
sudo nginx -t       # Test configuration
sudo systemctl reload nginx  # Reload without downtime
sudo systemctl restart nginx # Full restart
```

