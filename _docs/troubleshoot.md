## Check Nginx Status
# Check if Nginx is running
systemctl status nginx

# Or
service nginx status

# Check Nginx configuration and what ports it's listening on
nginx -T | grep listen

# Check active Nginx processes
ps aux | grep nginx

# Check which ports Nginx is using
ss -tulpn | grep nginx
# or
netstat -tulpn | grep nginx

2. Check PM2 Processes
# List all PM2 processes
pm2 list
# or
pm2 status

# Show detailed information
pm2 show all

# Check logs of running processes
pm2 logs

# Check if PM2 is running any processes
pm2 describe <app_name_or_id>

3. Check Docker Containers
# List running containers
docker ps

# List all containers (running + stopped)
docker ps -a

# Check specific container status
docker inspect yourapp_postgres

# View container logs
docker logs yourapp_postgres

# Check if container is running
docker container inspect -f '{{.State.Running}}' yourapp_postgres

4. Check What's Listening on Ports
# Check what's running on specific ports (3000, 5173, 80, 443, 5432)
ss -tulpn | grep -E ':(80|443|3000|5173|5432)'

# Alternative with netstat
netstat -tulpn | grep -E ':(80|443|3000|5173|5432)'

# More detailed with lsof (install if needed: apt install lsof)
lsof -i :80
lsof -i :3000
lsof -i :5173






# ---------------------
backend/.env
DATABASE_URL=postgresql://postgres:postgres@db:5432/petcare

docker compose down
docker compose up
# Option 2: Make Vite run on port 3001 instead
In your frontend/vite.config.js:
export default {
  server: {
    port: 3001,
    host: '0.0.0.0'
  }
}

docker image prune --filter "dangling=true"

# Blocked request. This host ("portal.domain.app") is not allowed.
# To allow this host, add "portal.domain.app" to `server.allowedHosts` in vite.config.js.
Your frontend needs to allow portal.domain.app as a host. Update your frontend/vite.config.js:

export default {
  server: {
    port: 5173,
    host: '0.0.0.0',
    allowedHosts: ['portal.domain.app', 'www.portal.domain.app'] or 'all'
  }
}

docker compose restart frontend

# backend CORS config:
In your backend code (probably in server.js, app.js, or similar), add:

const cors = require('cors');

app.use(cors({
  origin: ['https://portal.domain.app', 'http://localhost:3001'],
  credentials: true
}));
or
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));
or

# in frontend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
VITE_API_BASE_URL=https://api.bracepetcare.app
# ---------------------
server {
    server_name api.domain.app www.api.domain.app;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/api.domain.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.domain.app/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

sudo certbot certonly --nginx -d api.domain.app -d www.api.domain.app

# Restart frontend with new .env
docker compose restart frontend backend

# Reload Nginx
sudo nginx -t
sudo systemctl reload nginx

# frontend/vite.config.js
export default {
  server: {
    port: 5173,
    host: '0.0.0.0',
    allowedHosts: ['portal.domain.app', 'www.portal.domain.app'],
    hmr: {
      host: 'portal.domain.app',
      port: 443,
      protocol: 'wss'
    }
  }
}
OR
export default {
  server: {
    port: 5173,
    host: '0.0.0.0',
    allowedHosts: ['portal.domain.app', 'www.portal.domain.app', 'localhost'],
    hmr: process.env.NODE_ENV === 'production' ? {
      host: 'portal.domain.app',
      port: 443,
      protocol: 'wss'
    } : undefined
  }
}
# Also update your Nginx config for portal.domain.app to handle WebSocket
location / {
    proxy_pass http://localhost:5173;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

docker compose restart frontend
sudo nginx -t
sudo systemctl reload nginx

167.88.36.72

backup-sql

# backup from local
docker exec postgresql pg_dump -U dbadmin bracedb26 > backup.sql
docker exec postgresql pg_dump -U dbadmin -Fc bracedb26 > _db/backup.dump

# worked
docker exec -i v3-db-1 psql -U postgres -d petcare < _db/backup.sql