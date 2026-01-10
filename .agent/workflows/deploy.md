---
description: Deploy code changes to Orange Pi via Docker images on GitHub Container Registry
---

# /deploy - Deploy to Orange Pi

This workflow documents how to deploy code changes from your development machine to the Orange Pi production server.

## Architecture

```
[Dev Machine] → git push → [GitHub] → docker pull → [Orange Pi]
                    ↓
            Build Docker Image
                    ↓
            Push to ghcr.io
```

## Quick Deploy (Most Common)

### Step 1: Commit & Push Code
// turbo
```bash
cd /home/pi/projects/solar_monitor
git add -A
git commit -m "fix: description of changes"
git push
```

### Step 2: Rebuild Frontend (if frontend changed)
// turbo
```bash
cd /home/pi/projects/solar_monitor/solar-dashboard
npm run build
```

### Step 3: Build & Push Docker Image
```bash
cd /home/pi/projects/solar_monitor

# Login to GitHub Container Registry (first time only)
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# Build frontend image
docker build -t ghcr.io/cophamevs/solar_monitor/frontend:latest ./solar-dashboard

# Build backend image (if backend changed)
docker build -t ghcr.io/cophamevs/solar_monitor/backend:latest ./solar-backend

# Push images
docker push ghcr.io/cophamevs/solar_monitor/frontend:latest
docker push ghcr.io/cophamevs/solar_monitor/backend:latest
```

### Step 4: Deploy on Orange Pi
SSH into Orange Pi and run:
```bash
cd ~/solar_monitor
docker compose pull
docker compose up -d
docker logs -f solar_frontend  # Check logs
```

---

## When to Rebuild?

| Change Type | Frontend Rebuild? | Backend Rebuild? |
|-------------|-------------------|------------------|
| Frontend code (React/TS) | ✅ Yes - `npm run build` + docker | ❌ No |
| Frontend CSS/styles | ✅ Yes | ❌ No |
| Backend code (Node.js) | ❌ No | ✅ Yes |
| Backend dependencies | ❌ No | ✅ Yes |
| nginx.conf | ✅ Yes (docker only) | ❌ No |
| Environment variables | ❌ No - just restart | ❌ No - just restart |

---

## Tips

1. **Frontend changes are most common** - Only rebuild frontend image
2. **Use GitHub Actions** for auto-build on push (setup in `.github/workflows/`)
3. **Check logs on Orange Pi** if something doesn't work:
   ```bash
   docker logs solar_frontend
   docker logs solar_backend
   ```

---

## Troubleshooting

### Port already in use
```bash
sudo systemctl stop postgresql  # If local PG running
docker compose down
docker compose up -d
```

### Container not updating
```bash
docker compose pull --no-cache
docker compose up -d --force-recreate
```

### Check what's running
```bash
docker compose ps
docker stats
```
