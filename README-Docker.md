# 🐳 chTime Docker Deployment Guide

This guide explains how to deploy chTime using Docker and Docker Compose.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (v20.10 or later)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0 or later)

## Quick Start

### Option 1: Using Pre-built Image (Recommended)

```bash
# Download the production docker-compose file
curl -o docker-compose.yml https://raw.githubusercontent.com/your-username/chtime/main/docker-compose.prod.yml

# Start the application
docker-compose up -d

# Check status
docker-compose ps
```

### Option 2: Build from Source

```bash
# Clone the repository
git clone https://github.com/your-username/chtime.git
cd chtime

# Build and start the application
docker-compose up -d --build

# Check logs
docker-compose logs -f chtime
```

## Access the Application

Once running, chTime will be available at:
- **Local**: http://localhost:3000
- **Network**: http://YOUR_SERVER_IP:3000

## Configuration

### Environment Variables

You can customize the deployment by setting environment variables:

```bash
# Create a .env file
cat > .env << EOF
# Application settings
NODE_ENV=production
PORT=3000

# Disable telemetry
NEXT_TELEMETRY_DISABLED=1
EOF
```

### Custom Port

To run on a different port, modify the docker-compose.yml:

```yaml
services:
  chtime:
    ports:
      - "8080:3000"  # Run on port 8080 instead
```

## Data Persistence

chTime uses browser-based IndexedDB for data storage. Data is stored locally in each user's browser, so:

- ✅ No server-side database required
- ✅ Privacy-focused (data stays on user's device)
- ⚠️ Users need to backup their own data
- ⚠️ Data is tied to specific browser/device

## Production Deployment

### Using Docker Hub

1. **Build and push your image:**

```bash
# Build the image
docker build -t your-username/chtime:latest .

# Push to Docker Hub
docker push your-username/chtime:latest
```

2. **Deploy on your server:**

```bash
# On your production server
wget https://raw.githubusercontent.com/your-username/chtime/main/docker-compose.prod.yml -O docker-compose.yml

# Edit the image name
sed -i 's/your-username/ACTUAL-USERNAME/g' docker-compose.yml

# Start the application
docker-compose up -d
```

### Using GitHub Container Registry

```bash
# Build and tag for GitHub
docker build -t ghcr.io/your-username/chtime:latest .

# Push to GitHub Container Registry
docker push ghcr.io/your-username/chtime:latest
```

## Reverse Proxy Setup (Optional)

### Nginx Configuration

Create `nginx/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream chtime {
        server chtime:3000;
    }

    server {
        listen 80;
        server_name your-domain.com;

        location / {
            proxy_pass http://chtime;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

Uncomment the nginx service in docker-compose.yml and run:

```bash
docker-compose up -d nginx
```

## Management Commands

### Start/Stop Services

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart chTime
docker-compose restart chtime
```

### View Logs

```bash
# View all logs
docker-compose logs

# Follow chTime logs
docker-compose logs -f chtime

# View last 100 lines
docker-compose logs --tail=100 chtime
```

### Update Application

```bash
# Pull latest image
docker-compose pull

# Restart with new image
docker-compose up -d
```

### Health Checks

```bash
# Check container health
docker-compose ps

# Check application health
curl http://localhost:3000/

# Container stats
docker stats chtime-app
```

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Check what's using port 3000
   lsof -i :3000
   
   # Use different port in docker-compose.yml
   ports:
     - "3001:3000"
   ```

2. **Container won't start:**
   ```bash
   # Check logs
   docker-compose logs chtime
   
   # Rebuild if needed
   docker-compose build --no-cache chtime
   ```

3. **Out of disk space:**
   ```bash
   # Clean up Docker
   docker system prune -a
   
   # Remove old images
   docker image prune -a
   ```

### Performance Optimization

1. **Resource limits:**
   ```yaml
   services:
     chtime:
       deploy:
         resources:
           limits:
             cpus: '1.0'
             memory: 512M
           reservations:
             cpus: '0.5'
             memory: 256M
   ```

2. **Enable compression:**
   ```yaml
   environment:
     - COMPRESS=true
   ```

## Security Considerations

1. **Don't expose to internet without reverse proxy**
2. **Use HTTPS in production**
3. **Keep Docker images updated**
4. **Run with non-root user (already configured)**

## Backup Strategy

Since chTime uses browser-based storage:

1. **User Education**: Inform users about browser data export
2. **Regular Reminders**: Implement export reminders in the UI
3. **Cloud Sync**: Consider adding optional cloud backup features

## Support

For issues with:
- **chTime Application**: Create an issue on GitHub
- **Docker Deployment**: Check this README or Docker documentation
- **Server Setup**: Consult your hosting provider's documentation

## License

This Docker configuration is part of the chTime project and follows the same license. 