# 🚀 Deployment Guide

## Deployment Options

### Option 1: Vercel (Recommended)

**Easiest and fastest deployment**

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts. Your game will be live in seconds!

**Or use Vercel's web interface:**
1. Go to [vercel.com](https://vercel.com)
2. Connect your GitHub repository
3. Vercel auto-detects Vite and deploys automatically

### Option 2: Netlify

1. Build the project:
```bash
npm run build
```

2. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

3. Deploy:
```bash
netlify deploy --prod --dir=dist
```

**Or use Netlify's web interface:**
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your `dist` folder
3. Done!

### Option 3: GitHub Pages

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Add to `package.json`:
```json
{
  "scripts": {
    "deploy": "vite build && gh-pages -d dist"
  }
}
```

3. Update `vite.config.js` with your repo name:
```javascript
export default defineConfig({
  base: '/vibe-angry-bird/', // Your repo name
  // ... rest of config
});
```

4. Deploy:
```bash
npm run deploy
```

### Option 4: Static Web Host

Build and upload to any static web host (AWS S3, Azure Storage, etc.):

1. Build:
```bash
npm run build
```

2. Upload the `dist` folder contents to your host

3. Configure your web server to serve `index.html` for all routes

### Option 5: Docker

1. Create `Dockerfile`:
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. Build and run:
```bash
docker build -t vibe-angry-bird .
docker run -p 80:80 vibe-angry-bird
```

## Environment Configuration

### Production Build Settings

Ensure these are set in `vite.config.js`:

```javascript
export default defineConfig({
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          physics: ['cannon-es'],
          animation: ['gsap']
        }
      }
    }
  }
});
```

### Performance Optimizations

Before deploying, consider:

1. **Compress Assets**:
```bash
npm install -D vite-plugin-compression
```

Add to `vite.config.js`:
```javascript
import viteCompression from 'vite-plugin-compression';

plugins: [
  glsl(),
  viteCompression()
]
```

2. **Analyze Bundle Size**:
```bash
npm install -D rollup-plugin-visualizer
```

3. **Enable Service Worker** (for offline play):
Create `public/sw.js` for PWA support

## Post-Deployment Checklist

- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Verify all assets load correctly
- [ ] Check console for errors
- [ ] Test physics performance
- [ ] Verify audio works (if added)
- [ ] Test all 5 levels
- [ ] Check responsive design
- [ ] Verify touch controls on mobile
- [ ] Test network tab for load times

## Domain Setup

### Custom Domain on Vercel

1. Go to your project settings
2. Add domain
3. Update DNS records as shown

### Custom Domain on Netlify

1. Domain settings → Add custom domain
2. Update DNS:
   - A record: 75.2.60.5
   - CNAME: your-site.netlify.app

## SSL/HTTPS

All recommended platforms (Vercel, Netlify, GitHub Pages) provide free SSL certificates automatically.

## Monitoring

### Analytics

Add Google Analytics by inserting in `index.html`:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR-GA-ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'YOUR-GA-ID');
</script>
```

### Error Tracking

Consider adding Sentry for error monitoring:

```bash
npm install @sentry/browser
```

## CDN Optimization

For best performance, use a CDN for static assets:

1. Upload assets to a CDN
2. Update asset URLs in code
3. Enable cache headers

## Troubleshooting Deployment

### Issue: Assets Not Loading

**Solution**: Check `base` path in `vite.config.js`

### Issue: Blank Page

**Solution**: 
- Check browser console for errors
- Verify build completed successfully
- Check if WebGL is supported

### Issue: Slow Loading

**Solution**:
- Enable compression
- Use code splitting
- Lazy load assets
- Optimize textures

### Issue: Mobile Performance

**Solution**:
- Reduce particle counts
- Lower shadow quality
- Reduce physics accuracy
- Optimize draw calls

## Backup & Versioning

### Git Tags for Releases

```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

### Rollback on Vercel

```bash
vercel rollback
```

### Rollback on Netlify

Use the Netlify dashboard to deploy a previous version.

## Security

### Content Security Policy

Add to `index.html`:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data:;">
```

### CORS Configuration

If loading external assets, configure CORS properly on your server.

## Maintenance

### Regular Updates

```bash
# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Rebuild and test
npm run build
npm run preview
```

### Monitor Performance

- Use Lighthouse for performance audits
- Check loading times
- Monitor error rates
- Track user metrics

## Cost Estimation

### Free Tier Options
- **Vercel**: 100GB bandwidth/month
- **Netlify**: 100GB bandwidth/month
- **GitHub Pages**: Unlimited for public repos

### Paid Scaling
If you exceed free tiers:
- **Vercel Pro**: $20/month
- **Netlify Pro**: $19/month
- **AWS S3 + CloudFront**: Pay as you go (~$1-5/month for small sites)

## Support

For deployment issues:
- Vercel: [vercel.com/support](https://vercel.com/support)
- Netlify: [netlify.com/support](https://netlify.com/support)
- GitHub: [docs.github.com/pages](https://docs.github.com/pages)

Happy deploying! 🚀

