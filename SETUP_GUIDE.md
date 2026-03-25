# Project Setup & Environment Guide

## Prerequisites

Before setting up UDMS Frontend, ensure you have the following installed:

- **Node.js**: v14.0.0 or higher ([Download](https://nodejs.org))
- **npm**: v6.0.0 or higher (comes with Node.js)
- **Git**: v2.0.0 or higher ([Download](https://git-scm.com))
- **Code Editor**: VS Code, WebStorm, or your preferred IDE

### Verify Installation

```bash
node --version    # Should show v14.0.0+
npm --version     # Should show v6.0.0+
git --version     # Should show v2.0.0+
```

---

## Installation Steps

### 1. Clone Repository

```bash
cd path/to/your/workspace
git clone https://github.com/shehab097/react-udms-frontend.git
cd udmp
```

### 2. Install Dependencies

```bash
npm install
```

This will install all packages listed in `package.json`:

- React 19.2.4
- React Router DOM 6.30.3
- Vite 8.0.0
- Tailwind CSS 3.4.19
- Lucide React 1.7.0
- ESLint 9.39.4
- And other dev dependencies

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
# .env
VITE_API_URL=http://localhost:5000
VITE_API_TIMEOUT=30000
```

**Common Environment Variables:**

- `VITE_API_URL` - Backend API base URL
- `VITE_API_TIMEOUT` - Request timeout in milliseconds
- `VITE_APP_ENV` - Environment (development, production)

### 4. Start Development Server

```bash
npm run dev
```

Server will start at: `http://localhost:5173`

---

## Project Configuration Files

### vite.config.js

Vite build configuration:

- React plugin for JSX support
- Development server settings
- Build output configuration

### tailwind.config.js

Tailwind CSS configuration:

- Custom theme colors
- Spacing scales
- Plugin extensions

### postcss.config.js

PostCSS configuration:

- Tailwind CSS plugin
- Autoprefixer for vendor prefixes

### eslint.config.js

ESLint configuration:

- Code quality rules
- React plugin settings
- Recommended rules

---

## Development Workflow

### 1. Daily Startup

```bash
# Navigate to project
cd udmp

# Start development server
npm run dev

# In another terminal, optionally run linter in watch mode
npm run lint
```

### 2. Make Changes

- Edit files in `src/` directory
- Changes auto-refresh in browser (HMR)
- Check console for errors

### 3. Commit Changes

```bash
git add .
git commit -m "Description of changes"
git push origin branch-name
```

---

## Available Commands

### Development

```bash
npm run dev
```

- Starts Vite dev server
- Enables HMR for live reloading
- Runs on http://localhost:5173

### Production Build

```bash
npm run build
```

- Creates optimized production build
- Output in `dist/` directory
- Minifies and optimizes assets

### Preview Build

```bash
npm run preview
```

- Serves production build locally
- Use to test production build before deployment
- Access at http://localhost:4173

### Linting

```bash
npm run lint
```

- Checks code quality
- Shows linting errors and warnings
- Use `npm run lint -- --fix` to auto-fix issues

---

## Folder Structure Explained

```
udmp/
├── public/              # Static assets served as-is
│   └── (favicon, images, etc.)
├── src/
│   ├── assets/         # Import-time assets (images, fonts)
│   ├── components/     # Reusable UI components
│   │   └── *.jsx       # Component files
│   ├── pages/          # Page/route components
│   │   ├── *.jsx       # Page files
│   │   ├── profile/    # Edit pages
│   │   └── profileView/ # View pages
│   ├── routes/         # Route definitions
│   │   └── AppRoutes.jsx
│   ├── services/       # API and utility services
│   │   ├── api.js      # API request handler
│   │   ├── authService.js
│   │   └── tokenService.js
│   ├── layouts/        # Layout components
│   ├── App.jsx         # Root component
│   ├── App.css         # App styles
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── .env                # Environment variables
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind configuration
├── postcss.config.js   # PostCSS configuration
├── eslint.config.js    # ESLint configuration
└── index.html          # HTML template
```

---

## Troubleshooting Setup

### Issue: `npm install` fails

**Solution:**

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: Port 5173 already in use

**Solution on Windows:**

```bash
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

**Solution on Mac/Linux:**

```bash
lsof -i :5173
kill -9 <PID>
```

### Issue: Vite dev server won't start

**Solution:**

```bash
# Check Node version
node --version

# Try clearing cache and restarting
npm cache clean --force
npm run dev
```

### Issue: Module not found errors

**Solution:**

```bash
# Ensure all dependencies are installed
npm install

# Restart dev server
npm run dev
```

### Issue: Tailwind CSS classes not working

**Solution:**

```bash
# Rebuild Tailwind (stop dev server and restart)
# Development server > Press q to stop
npm run dev

# Check template paths in tailwind.config.js
```

---

## Git Workflow

### Initial Setup

```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### Create Feature Branch

```bash
git checkout -b feature/your-feature
```

### Commit Changes

```bash
git add .
git commit -m "Add: Description of feature"
```

### Push Changes

```bash
git push origin feature/your-feature
```

### Create Pull Request

1. Go to GitHub repository
2. Click "New Pull Request"
3. Select your branch
4. Add description
5. Submit PR

---

## IDE Setup

### VS Code Recommendations

**Install Extensions:**

- ES7+ React/Redux/React-Native snippets
- ESLint
- Prettier - Code formatter
- Tailwind CSS IntelliSense
- Thunder Client (for API testing)

**Settings (`.vscode/settings.json`):**

```json
{
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "[javascript]": {
        "editor.formatOnSave": true,
        "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "tailwindCSS.classAttributes": ["class", "className"]
}
```

### WebStorm Recommendations

- Built-in support for React, Vite, and Tailwind
- Excellent refactoring capabilities
- Integrated terminal

---

## Browser Developer Tools

### DevTools Tips

1. **Open DevTools:** F12 or Ctrl+Shift+I
2. **Console Tab:** Check for errors and warnings
3. **Network Tab:** Monitor API requests
    - Click on request to see headers and response
    - Check for 401 (Unauthorized) errors
4. **Elements/Inspector:** Debug CSS and DOM
5. **Application Tab:** Check localStorage/sessionStorage for tokens

### Debugging

```javascript
// Add debugger statement in code
debugger; // Execution pauses here when DevTools open

// Or use console methods
console.log("Variable:", variable);
console.error("Error:", error);
console.table(arrayOfObjects);
```

---

## Performance Tips

1. **Use React DevTools Extension** to profile components
2. **Check bundle size:** `npm run build` then analyze `dist/`
3. **Lazy load routes:**
    ```javascript
    const Dashboard = lazy(() => import("./pages/Dashboard"));
    ```
4. **Monitor API requests** in Network tab
5. **Optimize images** before committing

---

## Deployment Preparation

### Before Deployment

```bash
# 1. Run linter
npm run lint

# 2. Build project
npm run build

# 3. Test production build
npm run preview

# 4. Check build size
ls -lh dist/
```

### Environment for Production

Create `.env.production`:

```
VITE_API_URL=https://api.yourdomain.com
VITE_APP_ENV=production
```

### Deployment Options

- **Vercel:** Automatic deployment from Git
- **Netlify:** Connect GitHub repo for auto-build
- **GitHub Pages:** Static hosting for free
- **Traditional Hosting:** Upload `dist/` folder via FTP/SCP

---

## Support Resources

- [Node.js Documentation](https://nodejs.org/docs)
- [npm Documentation](https://docs.npmjs.com)
- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [Git Documentation](https://git-scm.com/doc)

---

**Last Updated:** March 2026
**Version:** 1.0
