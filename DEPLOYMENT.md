# AWS EC2 Deployment Guide

This guide covers deploying and updating the Mezo PaaS platform on AWS EC2 instances.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      AWS Infrastructure                      │
├─────────────────┬─────────────────┬─────────────────────────┤
│   EC2: Backend  │   EC2: Worker   │      EC2: Proxy         │
│   (NestJS API)  │   (Docker Jobs) │   (Reverse Proxy)       │
│   Port: 8000    │   Port: 3001    │   Port: 80/443          │
└────────┬────────┴────────┬────────┴────────────┬────────────┘
         │                 │                      │
         └─────────────────┼──────────────────────┘
                           │
                    ┌──────┴──────┐
                    │    Redis    │
                    │  (Queue)    │
                    └─────────────┘
```

## Prerequisites

- AWS EC2 access with `.pem` key files
- Git installed on all EC2 instances
- Node.js (v20+) installed on all instances
- PM2 process manager installed globally
- Docker installed on Worker instance

## EC2 Instance Information

| Service | .pem File Location | Default Port |
|---------|-------------------|--------------|
| Backend | `backend/mezo-keypair.pem` | 8000 |
| Worker | `worker/mezo-keypair.pem` | 3001 |
| Proxy | `proxy/mezo-keypair.pem` | 80/443 |

> **Note:** Get your EC2 Public DNS from AWS Console → EC2 → Instances

---

## Quick Update (Using Deploy Script)

The easiest way to update is using the deployment script:

```bash
# Update all services
./scripts/deploy.sh all

# Update specific service
./scripts/deploy.sh backend
./scripts/deploy.sh worker
./scripts/deploy.sh proxy
```

---

## Manual Deployment Steps

### Step 1: Connect to EC2 Instance

```bash
# Fix permissions if needed (first time only)
chmod 400 backend/mezo-keypair.pem
chmod 400 worker/mezo-keypair.pem
chmod 400 proxy/mezo-keypair.pem

# SSH into the instance
ssh -i "<service>/mezo-keypair.pem" ubuntu@<EC2_PUBLIC_DNS>
```

### Step 2: Navigate to Project Directory

```bash
cd ~/mezo-deploy/<service>
# or wherever your project is located
```

### Step 3: Pull Latest Changes

```bash
git pull origin master
```

### Step 4: Install Dependencies

```bash
npm install
# or
pnpm install
```

### Step 5: Update Environment Variables (if needed)

```bash
nano .env
# or
vim .env
```

### Step 6: Run Database Migrations (Backend only)

```bash
npx prisma migrate deploy
npx prisma generate
```

### Step 7: Restart the Service

```bash
pm2 restart all
```

### Step 8: Verify Deployment

```bash
pm2 list
pm2 logs --lines 50
```

---

## Service-Specific Instructions

### Backend Deployment

```bash
# 1. SSH into backend server
ssh -i "backend/mezo-keypair.pem" ubuntu@<BACKEND_HOST>

# 2. Update code
cd ~/mezo-deploy/backend
git pull origin master
npm install

# 3. Run migrations (if schema changed)
npx prisma migrate deploy
npx prisma generate

# 4. Restart
pm2 restart backend

# 5. Verify
pm2 logs backend --lines 100
```

### Worker Deployment

```bash
# 1. SSH into worker server
ssh -i "worker/mezo-keypair.pem" ubuntu@<WORKER_HOST>

# 2. Update code
cd ~/mezo-deploy/worker
git pull origin master
npm install

# 3. Restart
pm2 restart worker

# 4. Verify
pm2 logs worker --lines 100
```

### Proxy Deployment

```bash
# 1. SSH into proxy server
ssh -i "proxy/mezo-keypair.pem" ubuntu@<PROXY_HOST>

# 2. Update code
cd ~/mezo-deploy/proxy
git pull origin master
npm install

# 3. Restart
pm2 restart proxy

# 4. Verify
pm2 logs proxy --lines 100
```

---

## PM2 Commands Reference

| Command | Description |
|---------|-------------|
| `pm2 list` | Show all running processes |
| `pm2 restart all` | Restart all processes |
| `pm2 restart <name>` | Restart specific process |
| `pm2 stop <name>` | Stop a process |
| `pm2 start <name>` | Start a process |
| `pm2 logs` | View all logs |
| `pm2 logs <name>` | View specific process logs |
| `pm2 logs --lines 100` | View last 100 lines |
| `pm2 monit` | Real-time monitoring dashboard |
| `pm2 save` | Save current process list |
| `pm2 startup` | Generate startup script |

---

## Environment Variables

### Backend (.env)

Key variables to check/update:

```env
NODE_ENV=production
PORT=8000
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
CONTRACT_ADDRESS=0x...
CONTRACT_ADDRESS_V2=0x...
JWT_SECRET=...
```

### Worker (.env)

```env
NODE_ENV=production
REDIS_URL=redis://...
WORKER_SECRET=...
AWS_ACCESS_KEY=...
AWS_SECRET_KEY=...
AWS_S3_BUCKET_NAME=...
```

### Proxy (.env)

```env
NODE_ENV=production
REDIS_URL=redis://...
```

---

## Troubleshooting

### SSH Connection Issues

```bash
# Permission denied - fix .pem permissions
chmod 400 mezo-keypair.pem

# Connection refused - check security group
# AWS Console → EC2 → Security Groups → Inbound Rules
# Ensure port 22 (SSH) is open for your IP
```

### PM2 Not Found

```bash
npm install -g pm2
```

### Service Won't Start

```bash
# Check logs for errors
pm2 logs <service> --lines 200

# Check if port is in use
sudo lsof -i :<PORT>

# Kill process on port
sudo kill -9 <PID>
```

### Database Connection Issues

```bash
# Test database connection
psql -h <DB_HOST> -U postgres -d <DB_NAME>

# Check if RDS security group allows EC2
```

### Redis Connection Issues

```bash
# Test Redis connection
redis-cli -h <REDIS_HOST> ping
```

### Out of Memory

```bash
# Check memory usage
free -m
htop

# Clear PM2 logs
pm2 flush

# Restart with memory limit
pm2 restart <name> --max-memory-restart 500M
```

### Disk Space Full

```bash
# Check disk usage
df -h

# Find large files
du -sh /* | sort -h

# Clear old logs
sudo journalctl --vacuum-time=7d
pm2 flush
```

---

## Rollback Procedure

If a deployment fails:

```bash
# 1. Check the previous commit
git log --oneline -5

# 2. Revert to previous commit
git checkout <PREVIOUS_COMMIT_HASH>

# 3. Reinstall dependencies
npm install

# 4. Restart service
pm2 restart all
```

---

## Security Checklist

- [ ] `.pem` files have 400 permissions
- [ ] `.pem` files are NOT committed to git
- [ ] `.env` files are NOT committed to git
- [ ] Security groups restrict SSH to known IPs
- [ ] Production secrets are different from development
- [ ] Database passwords are strong and unique

---

## Useful AWS Commands

```bash
# Check instance metadata
curl http://169.254.169.254/latest/meta-data/

# Get public IP
curl http://169.254.169.254/latest/meta-data/public-ipv4

# Check available memory
cat /proc/meminfo | grep MemAvailable
```

---

## Contact & Support

For issues with deployment, check:
1. PM2 logs: `pm2 logs`
2. System logs: `sudo journalctl -u <service> -f`
3. AWS CloudWatch (if configured)
