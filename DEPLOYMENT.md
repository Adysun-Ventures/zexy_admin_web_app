# Deployment Guide - Zexy Admin Dashboard

## Prerequisites

- Node.js 18+ installed
- Git repository access
- Deployment platform account (Vercel, Netlify, or custom server)

## Environment Variables

Before deploying, ensure you have the following environment variable configured:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.zexy.live
```

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications.

#### Steps:

1. **Install Vercel CLI** (optional):
```bash
npm install -g vercel
```

2. **Deploy via CLI**:
```bash
vercel
```

3. **Or deploy via GitHub**:
   - Push your code to GitHub
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables
   - Click "Deploy"

4. **Configure Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add `NEXT_PUBLIC_API_BASE_URL` with value `https://api.zexy.live`
   - Redeploy if needed

#### Vercel Configuration

The project is already configured for Vercel deployment. No additional configuration needed.

### Option 2: Netlify

#### Steps:

1. **Install Netlify CLI**:
```bash
npm install -g netlify-cli
```

2. **Build the project**:
```bash
npm run build
```

3. **Deploy**:
```bash
netlify deploy --prod
```

4. **Or deploy via GitHub**:
   - Push your code to GitHub
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`
   - Add environment variables
   - Click "Deploy site"

### Option 3: Docker

#### Dockerfile

Create a `Dockerfile` in the project root:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Build and Run:

```bash
# Build the Docker image
docker build -t zexy-admin-dashboard .

# Run the container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=https://api.zexy.live \
  zexy-admin-dashboard
```

### Option 4: Custom Server (VPS/Cloud)

#### Requirements:
- Ubuntu 20.04+ or similar Linux distribution
- Node.js 18+ installed
- Nginx (for reverse proxy)
- PM2 (for process management)

#### Steps:

1. **Clone the repository**:
```bash
git clone <repository-url>
cd zexy_admin_shadcn
```

2. **Install dependencies**:
```bash
npm install
```

3. **Create environment file**:
```bash
echo "NEXT_PUBLIC_API_BASE_URL=https://api.zexy.live" > .env.local
```

4. **Build the application**:
```bash
npm run build
```

5. **Install PM2**:
```bash
npm install -g pm2
```

6. **Start the application**:
```bash
pm2 start npm --name "zexy-admin" -- start
pm2 save
pm2 startup
```

7. **Configure Nginx** (optional, for reverse proxy):

Create `/etc/nginx/sites-available/zexy-admin`:

```nginx
server {
    listen 80;
    server_name admin.zexy.live;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/zexy-admin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

8. **Set up SSL with Let's Encrypt** (optional):
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d admin.zexy.live
```

## Post-Deployment Checklist

- [ ] Verify environment variables are set correctly
- [ ] Test login functionality with OTP
- [ ] Test campaign creation
- [ ] Test campaign listing
- [ ] Test campaign details view
- [ ] Verify theme switching works
- [ ] Test on mobile devices
- [ ] Check browser console for errors
- [ ] Verify API calls are working
- [ ] Test logout functionality
- [ ] Check protected routes redirect correctly

## Monitoring

### Vercel
- Built-in analytics and monitoring
- Real-time logs in dashboard
- Performance insights

### Custom Server
- Use PM2 for process monitoring:
```bash
pm2 monit
pm2 logs zexy-admin
```

- Set up log rotation:
```bash
pm2 install pm2-logrotate
```

## Troubleshooting

### Build Fails

**Issue:** TypeScript errors during build

**Solution:**
```bash
npm run build
# Check the error output and fix TypeScript issues
```

### API Connection Issues

**Issue:** Cannot connect to API

**Solution:**
1. Verify `NEXT_PUBLIC_API_BASE_URL` is set correctly
2. Check API is accessible from deployment server
3. Verify CORS settings on API server

### Authentication Not Working

**Issue:** Login fails or redirects incorrectly

**Solution:**
1. Check browser console for errors
2. Verify API endpoints are correct
3. Check localStorage is enabled in browser
4. Verify API returns correct token format

### Theme Not Persisting

**Issue:** Theme resets on page reload

**Solution:**
1. Check localStorage is enabled
2. Verify `next-themes` is configured correctly
3. Check browser console for errors

## Performance Optimization

### Vercel
- Automatic edge caching
- Image optimization
- Automatic code splitting

### Custom Server
1. **Enable Gzip compression** in Nginx:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

2. **Set up caching headers**:
```nginx
location /_next/static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

3. **Use CDN** for static assets (optional)

## Backup and Recovery

### Database Backups
- Not applicable (stateless application)
- Auth tokens stored in localStorage (client-side)

### Code Backups
- Use Git for version control
- Regular commits to remote repository
- Tag releases for easy rollback

### Rollback Procedure

#### Vercel:
1. Go to Deployments
2. Find previous working deployment
3. Click "Promote to Production"

#### Custom Server:
```bash
git checkout <previous-commit>
npm install
npm run build
pm2 restart zexy-admin
```

## Security Considerations

1. **HTTPS Only**: Always use HTTPS in production
2. **Environment Variables**: Never commit `.env.local` to Git
3. **API Security**: Ensure API has proper authentication
4. **CORS**: Configure API CORS to allow only your domain
5. **Rate Limiting**: Consider adding rate limiting on API
6. **Security Headers**: Add security headers in Nginx/Vercel

### Recommended Security Headers:

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

## Support

For deployment issues:
- Check Next.js deployment documentation
- Review platform-specific guides (Vercel, Netlify, etc.)
- Contact support@zexy.live

---

**Last Updated:** May 3, 2026
