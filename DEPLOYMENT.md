# CourseFlow Production Deployment Guide

This guide covers deploying CourseFlow to production with all the implemented production features.

## 📋 Pre-deployment Checklist

### Environment Setup
- [ ] Copy `.env.example` to `.env.production`
- [ ] Configure all required environment variables
- [ ] Set up Supabase production database
- [ ] Configure domain and SSL certificates

### Security
- [ ] Review and update security headers in `next.config.js`
- [ ] Enable HTTPS in production
- [ ] Configure rate limiting settings
- [ ] Set up monitoring and alerting

### Performance
- [ ] Run `npm run build:analyze` to check bundle sizes
- [ ] Optimize images and assets
- [ ] Configure CDN if needed
- [ ] Set up database indexes

## 🚀 Deployment Methods

### Method 1: Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```

2. **Environment Variables**
   - Add all production environment variables in Vercel dashboard
   - Configure build settings if needed

3. **Domain Configuration**
   - Set up custom domain
   - Configure SSL certificates (automatic)

### Method 2: Docker Deployment

1. **Build Docker Image**
   ```bash
   docker build -t courseflow .
   ```

2. **Run with Docker Compose**
   ```bash
   # Copy environment files
   cp .env.example .env.production
   
   # Start services
   docker-compose up -d
   ```

3. **Health Check**
   ```bash
   curl -f http://localhost:3000/api/health
   ```

### Method 3: Self-hosted with PM2

1. **Install PM2**
   ```bash
   npm install -g pm2
   ```

2. **Create PM2 Configuration**
   ```javascript
   // ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'courseflow',
       script: 'npm',
       args: 'start',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       },
       instances: 'max',
       exec_mode: 'cluster',
       max_memory_restart: '1G',
       error_file: './logs/err.log',
       out_file: './logs/out.log',
       log_file: './logs/combined.log',
       time: true
     }]
   }
   ```

3. **Deploy**
   ```bash
   # Build application
   npm run build
   
   # Start with PM2
   pm2 start ecosystem.config.js --env production
   
   # Save PM2 configuration
   pm2 save && pm2 startup
   ```

## 🔧 Production Configuration

### Environment Variables

```bash
# Production Environment (.env.production)
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Performance Settings
NEXT_TELEMETRY_DISABLED=1
FORCE_HTTPS=true
SECURE_COOKIES=true

# Rate Limiting
RATE_LIMIT_REQUESTS=60
RATE_LIMIT_WINDOW_MS=900000

# Logging
LOG_LEVEL=info
```

### Database Setup

1. **Run Migrations**
   ```bash
   npm run db:migrate
   ```

2. **Backup Database**
   ```bash
   npm run db:backup
   ```

### SSL/TLS Configuration

For self-hosted deployments, configure SSL certificates:

```nginx
# nginx.conf example
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://localhost:3000;
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

## 📊 Monitoring & Maintenance

### Health Checks

The application includes several monitoring endpoints:

- `/api/health` - Overall application health
- `/api/ready` - Readiness probe for Kubernetes
- `/api/metrics` - Application metrics (admin only)

### Automated Monitoring

```bash
# Create monitoring script
#!/bin/bash
# monitor.sh
while true; do
    if ! curl -f http://localhost:3000/api/health; then
        echo "Health check failed at $(date)"
        # Add alerting logic here
    fi
    sleep 30
done
```

### Database Backups

Set up automated backups:

```bash
# Add to crontab
0 2 * * * cd /path/to/courseflow && npm run db:backup
```

### Log Management

Configure log rotation:

```bash
# logrotate configuration
/path/to/courseflow/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    notifempty
    copytruncate
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables
   - Verify dependencies are installed
   - Review TypeScript errors

2. **Database Connection Issues**
   - Verify Supabase credentials
   - Check network connectivity
   - Review firewall settings

3. **Performance Issues**
   - Check memory usage via `/api/metrics`
   - Review database query performance
   - Monitor response times

### Emergency Procedures

1. **Rollback Deployment**
   ```bash
   # Docker
   docker-compose down && docker-compose up -d
   
   # PM2
   pm2 restart courseflow
   
   # Vercel
   vercel rollback
   ```

2. **Database Rollback**
   ```bash
   npm run db:rollback 1
   ```

## 📈 Scaling

### Horizontal Scaling

1. **Load Balancer Configuration**
   - Configure sticky sessions if needed
   - Set up health checks
   - Monitor connection pools

2. **Database Scaling**
   - Consider read replicas
   - Implement connection pooling
   - Monitor query performance

### Vertical Scaling

- Monitor resource usage via `/api/metrics`
- Scale based on memory and CPU usage
- Consider Node.js cluster mode

## 🔒 Security Best Practices

1. **Regular Updates**
   - Keep dependencies updated
   - Monitor security advisories
   - Run `npm audit` regularly

2. **Access Control**
   - Restrict admin endpoints
   - Use strong authentication
   - Implement proper CORS policies

3. **Monitoring**
   - Set up intrusion detection
   - Monitor unusual patterns
   - Log security events

## 📞 Support

For deployment issues:
1. Check logs in `/api/health` endpoint
2. Review application logs
3. Contact support team with error details

---

**Last Updated:** $(date)
**Version:** 1.0.0