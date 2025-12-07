# Microservices-Final-Project
12/6/25
Tyge Plater

This is the Final Project repository for the CSC5201 Microservices Final Project

## F1 Service
This is the first sports service within the application, more could be added in the future, but for now this is the main starting service for serving sports content like Event Calendars, News, Standings, etc. 

## Stats Service
This is the main statistics service for the whole application.  Kafka will be utilized to send data from the Sports Services back to the Stats Service, which will be recieved and logged to a database.  

This will allow logs to be stored, and displayed on a simple frontend that visualizes the database data.  

# Local Development with Docker

This guide will help you run the entire microservices application locally using Docker Compose.

## Prerequisites

1. **Docker Desktop**
   - Install [Docker Desktop](https://www.docker.com/products/docker-desktop) for your operating system
   - Ensure Docker is running before proceeding

2. **Docker Compose**
   - Docker Compose is included with Docker Desktop
   - Verify installation: `docker compose version`

## Quick Start

1. **Start all services:**
   ```bash
   docker compose up -d
   ```

2. **Stop and remove volumes (clears database data):**
   ```bash
   docker compose down -v
   ```

## Services and Ports

Once started, the following services will be available:

| Service | Frontend URL | API URL | Description |
|---------|-------------|---------|-------------|
| **F1 Service** | http://localhost:3000 | http://localhost:8000 | F1 sports content service |
| **Stats Service** | http://localhost:3001/stats-service | http://localhost:8001 | Statistics and logging service |
| **Kafka** | - | localhost:9092 | Message broker |
| **PostgreSQL** | - | localhost:5432 | Stats database |

### API Documentation

- **F1 Service API Docs:** http://localhost:8000/docs
- **Stats Service API Docs:** http://localhost:8001/docs

## Environment Variables

The `docker-compose.yml` file includes pre-configured environment variables for local development:

### F1 Service
- `KAFKA_SERVER_ENDPOINT=kafka:9092` - Local Kafka broker

### Stats Service
- `KAFKA_SERVER_ENDPOINT=kafka:9092` - Local Kafka broker
- `DATABASE_URL=postgresql://statsuser:statspass@postgres-stats:5432/statsdb` - PostgreSQL connection
- `ADMIN_USERNAME=admin` - Default admin username
- `ADMIN_PASSWORD=admin123` - Default admin password (change in production!)
- `JWT_SECRET_KEY=your-secret-key-change-in-production` - JWT signing key
- `JWT_ALGORITHM=HS256` - JWT algorithm
- `JWT_EXPIRATION_HOURS=24` - Token expiration time


# DigitalOcean App Platform Deployment Guide

## Prerequisites

1. **DigitalOcean Account**
   - Sign up at [digitalocean.com](https://digitalocean.com)
   - Add payment method (required for App Platform)

2. **GitHub Repository**
   - Push your code to GitHub
   - Note your repository path: `username/repository-name`

3. **Confluent Cloud Account** (for Kafka)
   - Sign up at [confluent.cloud](https://confluent.cloud) (free tier available)

## Step 1: Set Up Confluent Cloud Kafka

1. Go to [confluent.cloud](https://confluent.cloud) and sign up/login
2. Create a new **Environment** like 'dev'
3. Create a **Cluster**:
   - Choose **Basic** plan (free tier)
4. Create a **Topic**:
   - Topic name: `api-usage`
5. Get **Bootstrap Servers**:
   - Go to Cluster → **Settings** → **Bootstrap servers**
   - Copy the endpoint (e.g., `pkc-XXXXX.us-east-2.aws.confluent.cloud:9092`)
6. Create **API Keys**:
   - Go to **API Keys** → **Create key**
   - Save the API key and secret they are needed for env variables

## Step 2: Set Up PostgreSQL Database

1. Log into DigitalOcean dashboard
2. Go to **Databases** → **Create Database**
3. Choose:
   - **PostgreSQL** version 15
   - **Basic** plan 
   - **Region**: Choose same region as your App Platform app
   - **Database name**: `stats_db` 
4. **Save connection details**:
   - Host
   - Port (usually 25060)
   - Database name
   - Username
   - Password
   - Connection string: `postgresql://user:password@host:port/database`

## Step 3: Update app.yaml

1. Open `deployment/digitalocean/app.yaml`
2. Replace `YOUR_GITHUB_USERNAME/YOUR_REPO_NAME` with the actual GitHub repository path
3. Update the `region` if needed

## Step 4: Prepare Environment Variables

Env variables needed for each service:

### F1 Service:
- `KAFKA_SERVER_ENDPOINT` - Confluent Cloud bootstrap servers
- `KAFKA_API_KEY` - Confluent Cloud API key
- `KAFKA_API_SECRET` - Confluent Cloud API secret

### Stats Service:
- `DATABASE_URL` - PostgreSQL connection string (setup by attaching a database in the DigitalOcean UI)
- `KAFKA_SERVER_ENDPOINT` - Confluent Cloud bootstrap servers
- `KAFKA_API_KEY` - Confluent Cloud API key
- `KAFKA_API_SECRET` - Confluent Cloud API secret
- `ADMIN_USERNAME` - Admin username (e.g., "admin")
- `ADMIN_PASSWORD` - Admin password (choose a strong password)
- `JWT_SECRET_KEY` - JWT signing key (generate a random string)
- `JWT_ALGORITHM` - "HS256" (already set)
- `JWT_EXPIRATION_HOURS` - "24" (already set)

## Step 5: Deploy to DigitalOcean

1. Log into DigitalOcean dashboard
2. Go to **Apps** → **Create App**
3. Choose **GitHub** as source
4. Select your repository
5. Select the 2 locations `/f1-service` and `/stats-service`
6. Review the configuration:
   - Verify both services are detected
   - Check Dockerfile paths are correct
7. **Setup HTTP Settings**
   - **F1 Service**
   - In HTTP Request Routes, set the route path to '/'
   - In Ports, set the Public HTTP Port value to 80
   - **Stats Service**
   - In HTTP Request Routes, set the route path to '/stats-service'
   - In Ports, set the Public HTTP Port value to 8080
   - **Both**
   - Ensure Preserve Path Prefix is OFF
8. **Add Environment Variables/Secrets**:
   - Click on each service
   - Add all environment variables from Step 4
   - Mark sensitive values as **SECRET** (password, keys, etc.)
9. **Link Database** (if using DigitalOcean Managed DB):
   - Click on `stats-service`
   - Under **Databases**, click **Link Database**
   - Select your PostgreSQL database
   - This will automatically set `DATABASE_URL`
10. Click **Create Resources**