# Deployment Guide for MangaShelf Client

## Prerequisites
- Vercel account
- Server already deployed (you have: https://mangashelfserver-ib4aadcbb-suhail-abdis-projects.vercel.app)

## Step 1: Update Server CORS (Important!)

Before deploying, make sure your server allows requests from your Vercel frontend domain.

Update `server/server.js` CORS configuration to include your Vercel frontend URL:

```javascript
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://your-frontend-domain.vercel.app" // Add your Vercel frontend URL here
    ],
  })
);
```

Or allow all origins for now (less secure but easier for testing):
```javascript
app.use(cors());
```

Then redeploy your server.

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Go to Vercel Dashboard**:
   - Visit https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository
   - Select the `client` folder as the root directory

3. **Configure Environment Variables**:
   - In Vercel project settings, go to "Environment Variables"
   - Add:
     ```
     NEXT_PUBLIC_API_URL=https://mangashelfserver-ib4aadcbb-suhail-abdis-projects.vercel.app
     ```
   - Make sure it's available for Production, Preview, and Development

4. **Configure Build Settings**:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `client`
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

5. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Navigate to client directory**:
   ```bash
   cd client
   ```

4. **Deploy**:
   ```bash
   vercel
   ```
   - Follow the prompts
   - When asked for environment variables, add:
     ```
     NEXT_PUBLIC_API_URL=https://mangashelfserver-ib4aadcbb-suhail-abdis-projects.vercel.app
     ```

5. **Deploy to production**:
   ```bash
   vercel --prod
   ```

## Step 3: Update Server CORS with Production URL

After deployment, update your server's CORS to include your actual Vercel frontend URL:

```javascript
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://your-actual-frontend-url.vercel.app"
    ],
  })
);
```

## Step 4: Verify Deployment

1. Visit your Vercel deployment URL
2. Test the following:
   - User registration/login
   - Manga search
   - Creating reviews
   - Uploading profile pictures
   - All features should work with the production server

## Troubleshooting

### CORS Errors
- Make sure server CORS includes your Vercel frontend URL
- Check browser console for specific CORS error messages

### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel environment variables
- Check that your server is accessible at the deployed URL
- Test server endpoint directly: `https://mangashelfserver-ib4aadcbb-suhail-abdis-projects.vercel.app/`

### Build Errors
- Make sure all dependencies are in `package.json`
- Check build logs in Vercel dashboard
- Ensure TypeScript compiles without errors

## Environment Variables Reference

- `NEXT_PUBLIC_API_URL`: Your backend server URL (required)

