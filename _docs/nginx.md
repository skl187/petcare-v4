
DNS Records
type: A      name: api           content: your-ip
type: CNAME  name: www.api       content: api.domain.com
type: A      name: portal        content: your-ip
type: CNAME  name: www.portal    content: portal.domain.com


sudo nano /etc/nginx/sites-available/portal.bracepetcare.app
```bash
server {
    server_name portal.bracepetcare.app www.portal.bracepetcare.app;
    
    location / {
        proxy_pass http://localhost:5173;  # Your frontend dev server (adjust port if needed)
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/portal.bracepetcare.app/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/portal.bracepetcare.app/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}
```
sudo ln -s /etc/nginx/sites-available/portal.domain.com /etc/nginx/sites-enabled/portal.domain.com

sudo certbot certonly --nginx -d portal.bracepetcare.app -d www.portal.bracepetcare.app

sudo nginx -t

sudo systemctl reload nginx