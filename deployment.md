# for git and rsync
# git push -u origin feature/260217
# rsync -avz --exclude-from='.gitignore' ./ admskl@bracevps:/home/admskl/v4
```bash
# local server
rsync -avz --exclude-from='.gitignore' ./ admskl@bracevps:/home/admskl/db
docker exec postgresql pg_dump -U dbadmin -d bracedb26 > full_backup.sql
# remote server
docker exec v4-db-1 pg_dump -U postgres -d petcare > full_backup.sql
docker compose up -d
-- created db_default network
docker exec -i postgres_db psql -U postgres -d petcare < full_backup.sql

# 🧱 STEP 1 — Create docker network
```bash
docker network create prod_network
```
# database/.env
```yml
POSTGRES_USER=postgres
POSTGRES_PASSWORD=StrongPass123
POSTGRES_DB=mydb
```
# database/docker-compose.yml
```yml
version: "3.9"

services:
  postgres:
    image: postgres:15
    container_name: postgres_db
    restart: unless-stopped
    env_file:
      - .env
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - prod_network
    ports:
      - "5432:5432"

volumes:
  postgres_data:

networks:
  prod_network:
    external: true
```
# Start DB Once
```bash
cd database
docker compose up -d
```

# backend/.env
```yml
NODE_ENV=production
PORT=3000

DB_HOST=postgres_db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=StrongPass123
DB_NAME=mydb

DATABASE_URL=postgresql://postgres:StrongPass123@postgres_db:5432/mydb
```
# app/docker-compose.yml
```yml
version: "3.9"

services:
  backend:
    build: ./backend
    container_name: backend_app
    restart: unless-stopped
    env_file:
      - ./backend/.env
    ports:
      - "3000:3000"
    networks:
      - prod_network

  frontend:
    build: ./frontend
    container_name: frontend_app
    restart: unless-stopped
    ports:
      - "3001:80"
    networks:
      - prod_network

networks:
  prod_network:
    external: true
```

```markdown
Important: DB HOST
Since both in docker:
DB_HOST=postgres_db

Use container name.
NOT localhost
NOT 127.0.0.1
```
# Test DB connection
```bash
docker exec -it backend_app sh
# ping db
ping postgres_db
```

# Deployment flow

```bash
cd app
git pull
docker network create prod_network
docker compose up -d --build
```
# ❌ NEVER RUN THESE
docker compose down -v
docker volume prune
docker system prune -a --volumes

# 🔐 Ultra-safe DB (recommended)
```yml
# DB NEVER touched even by mistake:
# Change DB volume to host path:

volumes:
  - /opt/postgres-data:/var/lib/postgresql/data

# even if docker deleted → data safe.
```

# server/backup.sh
```bash
#!/bin/bash

DATE=$(date +%F-%H-%M)
BACKUP_DIR=/root/server/backups

docker exec postgres_prod pg_dump -U produser proddb > $BACKUP_DIR/db-$DATE.sql

find $BACKUP_DIR -type f -mtime +7 -delete

# make it executable:
chmod +x backup.sh
```

# ⏰ Auto backup daily
```bash
crontab -e
0 2 * * * /root/server/backup.sh
```


# Export from local
docker pg_dump -h localhost -U dbadmin -d bracedb26 -F c -f backup.dump

# Import to remote
docker pg_restore -h postgres_db -U postgres -d petcare backup.dump

# Dev compose
docker compose -f docker-compose.dev.yml up -d
# Prod deploy
docker compose -f docker-compose.prod.yml up -d --build



rsync -avz ./frontend/dist admskl@bracevps:/home/admskl/v4/frontend


# to check page slowness
curl -o /dev/null -s -w "%{time_total}\n" https://portal.domain.app
1.737014
# Check NGINX Time Breakdown
curl -w "@-" -o /dev/null -s https://portal.bracepetcare.app <<'EOF'
DNS: %{time_namelookup}
Connect: %{time_connect}
SSL: %{time_appconnect}
TTFB: %{time_starttransfer}
Total: %{time_total}
EOF
# o/p
DNS:      0.01s   ✅ fast
Connect:  0.77s   ❌ slow
SSL:      1.08s   ❌ VERY slow
TTFB:     1.38s
Total:    1.38s

# solution
FIX 1 — Disable IPv6 Listening (FASTEST WIN)
  listen 0.0.0.0:443 ssl http2;
  listen 0.0.0.0:80;
FIX 2 — Enable SSL Session Reuse
  Add inside http{} block (/etc/nginx/nginx.conf):
  ssl_session_cache shared:SSL:50m;
  ssl_session_timeout 1d;
  ssl_session_tickets on;
  ssl_buffer_size 4k;
FIX 3 — Enable TLS Optimization
  Also add:
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_prefer_server_ciphers off;
FIX 4 — Enable Keepalive
  Inside server block:
  keepalive_timeout 65;
  keepalive_requests 1000;
FIX 5 — Check Cloud Provider Firewall (VERY COMMON)
  If using:
  AWS, Azure, DigitalOcean, Contabo, Hostinger VPS
  Security inspection may slow TLS.
  Test from server itself:
  curl -k https://localhost


project/
│
├── docker-compose.prod.yml
│
├── nginx/
│   └── nginx.conf
│
├── frontend/
├── backend/
└── db/


docker exec postgresql pg_dump -U dbadmin -d bracedb26 --schema-only > schema.sql
# Backup Prod
docker exec postgres_db pg_dump -U postgres -d petcare > prod_backup.sql
# Apply Schema
docker exec -i postgres_db psql -U postgres -d petcare < schema.sql


docker exec postgresql pg_dump -U dbadmin -d bracedb26 > local_full.sql
scp local_full.sql admskl@bracevps:/home/admskl/db
scp admskl@bracevps:/home/admskl/db/prod_backup.sql .
docker exec postgres_db pg_dump 
-U postgres \
-d petcare \
--data-only \
> seed_data.sql

docker exec -t postgres_db pg_dump -U postgres --data-only petcare > seed_data.sql

dtop
docker exec -it postgres_db psql -U postgres
DROP DATABASE petcare;
CREATE DATABASE petcare;
\DROP DATABASE mydb;
CREATE DATABASE mydb;
\q

docker exec -i postgres_db psql -U postgres -d petcare < .local_full.sql



docker exec -i postgres_db psql -U postgres -d petcare < .local_full.sql
Failed to load resource: net::ERR_BLOCKED_BY_CLIENT
localhost:3000/api/vet-services:1  Failed to load resource: net::ERR_BLOCKED_BY_CLIENT
localhost:3000/api/payments/all:1  Failed to load resource: net::ERR_BLOCKED_BY_CLIENT
localhost:3000/api/payments/all:1  Failed to load resource: net::ERR_BLOCKED_BY_CLIENT