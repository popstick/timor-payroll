# Timor Payroll - Deployment Guide

## Server Details

- **Host**: 65.109.173.122 (Hetzner)
- **Domain**: https://payroll.naroman.tl
- **SSH Access**: `ssh -i ~/.ssh/id_hetzner root@65.109.173.122`
- **App Directory**: `/var/www/payroll.naroman.tl`

## Git Repository

- **Remote**: https://github.com/popstick/timor-payroll.git
- **Branch**: main

## Tech Stack

- Next.js 16.1.1
- Node.js (via PM2)
- Nginx (reverse proxy)
- Supabase (database)

## Auto-Deployment

The app automatically deploys when you push to the `main` branch on GitHub.

### How it works:

1. Push to GitHub → triggers webhook
2. Webhook (`https://payroll.naroman.tl/webhook/deploy`) receives POST
3. `deploy.sh` runs: git pull, npm install, npm run build, pm2 restart
4. App is live within ~30 seconds

### Webhook Configuration

GitHub webhook should be configured with:
- **URL**: `https://payroll.naroman.tl/webhook/deploy`
- **Content type**: `application/json`
- **Secret**: `payroll-webhook-secret-2024`
- **Events**: Just the push event

## Manual Deployment

If auto-deploy fails, SSH to server and run:

```bash
ssh -i ~/.ssh/id_hetzner root@65.109.173.122
cd /var/www/payroll.naroman.tl
./deploy.sh
```

Or step by step:

```bash
cd /var/www/payroll.naroman.tl
git pull origin main
npm install
npm run build
pm2 restart payroll
```

## PM2 Process Management

```bash
# View running processes
pm2 list

# View app logs
pm2 logs payroll

# View webhook logs
pm2 logs payroll-webhook

# Restart app
pm2 restart payroll

# Restart webhook
pm2 restart payroll-webhook
```

## Logs

- **Deploy log**: `/var/log/payroll-deploy.log`
- **App logs**: `pm2 logs payroll`
- **Webhook logs**: `pm2 logs payroll-webhook`

## Environment Variables

The `.env.local` file on the server contains:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

To update environment variables:

```bash
ssh -i ~/.ssh/id_hetzner root@65.109.173.122
nano /var/www/payroll.naroman.tl/.env.local
pm2 restart payroll
```

## Nginx Configuration

Located at: `/etc/nginx/sites-enabled/payroll.naroman.tl`

```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name payroll.naroman.tl;

    ssl_certificate /etc/letsencrypt/live/naroman.tl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/naroman.tl/privkey.pem;

    location /webhook/deploy {
        proxy_pass http://localhost:9001/deploy;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Hub-Signature-256 $http_x_hub_signature_256;
    }

    location / {
        proxy_pass http://localhost:3001;
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
```

## Troubleshooting

### App not responding

```bash
pm2 restart payroll
pm2 logs payroll --lines 50
```

### Webhook not triggering

1. Check webhook logs: `pm2 logs payroll-webhook`
2. Verify GitHub webhook settings and recent deliveries
3. Test manually: push a commit and watch logs

### Build failing

```bash
cd /var/www/payroll.naroman.tl
npm run build
# Check for errors
```

### Reset to clean state

```bash
cd /var/www/payroll.naroman.tl
git fetch origin
git reset --hard origin/main
npm install
npm run build
pm2 restart payroll
```

## Ports

- **3001**: Next.js app (proxied via nginx)
- **9001**: Webhook server (internal)
- **80/443**: Nginx (public)
