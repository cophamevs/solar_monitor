# Deploying to Orange Pi (1GB RAM)

This guide covers how to deploy the Solar Monitor to an Orange Pi R1 Plus (or similar SBC with 1GB RAM).

## Prerequisites

- Orange Pi R1 Plus LTS (or any ARM64 SBC)
- Ubuntu / Armbian installed
- Docker & Docker Compose installed
- **CRITICAL**: A Swap file (see below)

## 1. Setup Swap File (Mandatory)

Devices with 1GB RAM **will crash** without swap space when running the full stack (TimescaleDB, Backend, Frontend, MQTT). We recommend creating a 1GB swap file.

Run these commands on your Orange Pi:

```bash
# Check existing swap
sudo swapon --show

# Create 1GB swap file
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make it permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify
sudo swapon --show
```

## 2. Install Docker

If not already installed:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Log out and log back in
```

## 3. Deploy the Application

Since we use GitHub Container Registry (ghcr.io), you don't need to build on the device. Just pull the pre-built images.

1.  **Clone the Repository (or copy docker-compose.yml)**
    ```bash
    git clone <YOUR_REPO_URL> solar_monitor
    cd solar_monitor
    ```

2.  **Configure Environment**
    Copy `.env.example` (or `.env.production`) to `.env` and set your secure passwords.
    ```bash
    cp .env.production .env
    nano .env
    ```

3.  **Start the Stack**
    ```bash
    docker compose up -d
    ```

4.  **Verify Status**
    ```bash
    docker compose ps
    docker stats
    ```

## 4. Updates

To update to the latest version after pushing code to GitHub:

```bash
git pull
docker compose pull
docker compose up -d
```
