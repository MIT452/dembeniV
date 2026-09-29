# Vercel Deployment Guide

## Prerequisites
- Node.js 18+ installed
- npm package manager
- Vercel CLI (optional)
- GitHub repository with this code

## Local Development Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Set environment variables:**
   - `.env.development` is already configured for local development (API: http://localhost:5000)
   - `.env.production` is configured for production (API: https://dembeni-api.onrender.com)

3. **Run development server:**
   ```bash
   npm run dev
   ```
   The app will run at `http://localhost:5173`

4. **Build for production:**
   ```bash
   npm run build
   ```
   Output is in the `dist/` folder

## Deploying to Vercel

### Option 1: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Import Project"
4. Select your repository
5. Select "frontend" as the root directory
6. Add environment variable:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://dembeni-api.onrender.com`
7. Click "Deploy"

### Option 2: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. From the frontend directory, run:
   ```bash
   vercel --prod
   ```

3. Set the environment variable when prompted:
   - `VITE_API_URL=https://dembeni-api.onrender.com`

## Project Configuration

### Vercel Configuration (`vercel.json`)
- Routes all requests to `index.html` for React Router to handle
- Enables client-side routing with clean URLs (no # in URLs)

### Vite Configuration (`vite.config.js`)
- Base path set to `/` for Vercel compatibility
- Includes dev server proxy for local API testing
- React plugin enabled for JSX support

### Package.json Changes
- Removed `gh-pages` and GitHub Pages-related scripts
- Removed `homepage` field
- Kept essential build scripts: `dev`, `build`, `preview`, `test`

## Key Changes from GitHub Pages to Vercel

### 1. Routing
- **Before:** Used `HashRouter` (URLs with #)
- **After:** Now uses `BrowserRouter` (clean URLs)
- Vercel's `vercel.json` handles SPA routing

### 2. Base Path
- **Before:** `/dembeni/` (for GitHub Pages subfolder)
- **After:** `/` (root path)

### 3. API Integration
- **Before:** GitHub Pages static hosting only
- **After:** Environment variables configured for Vercel

### 4. Build Output
- **Location:** `dist/` folder (Vite default)
- **Upload to Pages:** Uses Vercel's built-in deployment

## Environment Variables

### Development (`.env.development`)
```
VITE_API_URL=http://localhost:5000
```

### Production (`.env.production`)
```
VITE_API_URL=https://dembeni-api.onrender.com
```

### Local Override (`.env.local`)
```
VITE_API_URL=https://dembeni-api.onrender.com
```

## Troubleshooting

### 404 Errors on Navigation
- Vercel's `vercel.json` rewrites all routes to `index.html`
- React Router handles the routing client-side
- This is already configured ✓

### API Connection Issues
- Check `VITE_API_URL` environment variable is set correctly
- Verify backend API is running on `https://dembeni-api.onrender.com`
- Check CORS configuration on backend

### Build Failures
- Ensure Node.js 18+ is available
- Run `npm install` to install all dependencies
- Check that `package-lock.json` exists

### Slow Builds
- Vercel caches npm dependencies automatically
- First deploy may take longer
- Subsequent deploys should be faster

## Monitoring

1. Visit Vercel Dashboard to:
   - Monitor deployment status
   - View build logs
   - Check analytics
   - Manage environment variables

2. Automatic deployments:
   - Push to main branch → automatic deployment
   - Preview deployments for pull requests
   - Rollback to previous deployments if needed

## Next Steps

1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel Dashboard
3. Push code to main branch
4. Vercel will automatically build and deploy
5. Your site will be live at `[your-project].vercel.app`

## Support

For more details, see:
- [Vercel Documentation](https://vercel.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [React Router Documentation](https://reactrouter.com)
