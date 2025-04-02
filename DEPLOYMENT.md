# Vignan University Alumni Network Deployment Guide

This document provides comprehensive instructions for setting up, configuring, and deploying the Vignan University Alumni Network platform.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Architecture Overview](#architecture-overview)
3. [Setup Instructions](#setup-instructions)
4. [Configuration](#configuration)
5. [Deployment](#deployment)
6. [Database Migrations](#database-migrations)
7. [Maintenance](#maintenance)
8. [Troubleshooting](#troubleshooting)

## System Requirements

### Development Environment
- Node.js (version 18.x or higher)
- NPM (version 9.x or higher)
- PostgreSQL (version 14.x or higher)

### Production Environment
- Application Server: Node.js runtime environment
- Database Server: PostgreSQL instance
- Storage: File storage for uploaded images and documents
- Memory: Minimum 2GB RAM recommended
- CPU: 1 vCPU minimum, 2+ vCPU recommended
- Disk Space: At least 10GB for application and database

## Architecture Overview

The Vignan University Alumni Network is built as a full-stack JavaScript application with the following architecture:

```
                 ┌────────────────┐
                 │  Client Browser│
                 └────────┬───────┘
                          │
                          ▼
           ┌─────────────────────────────┐
           │          Express.js         │
           │       (API Endpoints)       │
           └────────────┬────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────┐
        │             React App             │
        │  (Client-side rendering with SSR) │
        └────────────────┬──────────────────┘
                         │
                         ▼
     ┌─────────────────────────────────────────┐
     │ Drizzle ORM / PostgreSQL Database Layer │
     └─────────────────────────────────────────┘
```

### Key Components:

1. **Frontend**: React application with TailwindCSS for styling
2. **State Management**: TanStack Query for server state, React Context for global state
3. **API Layer**: Express.js RESTful API endpoints
4. **Database Access**: Drizzle ORM with PostgreSQL
5. **Authentication**: Session-based authentication with passport.js

## Setup Instructions

### 1. Clone the Repository

```bash
git clone [repository-url]
cd vignan-alumni-network
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/vignan_alumni

# Application
PORT=5000
NODE_ENV=development

# Session
SESSION_SECRET=your_strong_secret_key
```

### 4. Database Setup

Create a PostgreSQL database:

```bash
createdb vignan_alumni
```

Push the schema to the database:

```bash
npm run db:push
```

### 5. Start the Development Server

```bash
npm run dev
```

## Configuration

### Database Configuration

The database schema is defined in `shared/schema.ts`. When schema changes are made, run:

```bash
npm run db:push
```

### Authentication Configuration

Admin credentials for initial setup:
- Username: `admin`
- Password: `admin123`

## Deployment

### Render.com Deployment

1. Create a new Web Service in Render
2. Connect your GitHub repository
3. Configure the service with the following settings:

**Build Configuration:**
- Build Command: `npm install && npm run build`
- Start Command: `node dist/server.js`

**Environment Variables:**
- Add all the variables from your `.env` file

**Database Setup:**
- Create a PostgreSQL instance in Render
- Connect your service to this database instance

### Custom Server Deployment

1. Clone the repository on your server
2. Install dependencies:
```bash
npm install --production
```
3. Build the application:
```bash
npm run build
```
4. Set up a process manager (PM2 recommended):
```bash
npm install -g pm2
pm2 start dist/server.js --name "vignan-alumni"
```
5. Configure a reverse proxy (Nginx recommended):

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Database Migrations

The application uses Drizzle ORM for database operations. Schema changes are handled through the following process:

1. Make changes to the schema in `shared/schema.ts`
2. Run migration command:
```bash
npm run db:push
```

**Important:** Always back up your production database before running migrations.

## Maintenance

### Regular Maintenance Tasks

1. **Database Backup**:
   Configure automatic backups for your PostgreSQL database

2. **System Updates**:
   Regularly update dependencies to patch security vulnerabilities
   ```bash
   npm update
   ```

3. **Log Monitoring**:
   Set up log rotation and monitoring
   ```bash
   pm2 logs vignan-alumni
   ```

4. **Performance Monitoring**:
   Monitor CPU, memory, and disk usage of your server

## Troubleshooting

### Common Issues and Solutions

1. **Connection Errors**:
   - Verify DATABASE_URL is correct
   - Check network connectivity between application and database
   - Ensure PostgreSQL service is running

2. **Authentication Issues**:
   - Verify SESSION_SECRET is properly set
   - Check that cookies are being properly set and stored
   - Ensure HTTPS is enabled in production to prevent cookie vulnerabilities

3. **File Upload Problems**:
   - Check file size limits in Express configuration
   - Verify upload directory has proper permissions
   - Make sure proper Content-Type headers are being set

4. **Database Migration Failures**:
   - Take backup before migration
   - Check for incompatible schema changes
   - Examine migration logs for specific errors

---

For additional support, contact the development team or create an issue in the repository.

> Developed And Maintained By Krishna Kant Kumar And Team