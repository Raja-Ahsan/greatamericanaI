# GreatAmerican.Ai - Web Portal Setup Guide

This Laravel backend serves both the API and the React frontend as a unified web portal.

## Setup Instructions

### 1. Build the React Frontend

From the project root directory:
```bash
cd ..
npm run build
```

This creates a `dist` folder with the React build.

### 2. Copy React Build to Laravel Public Directory

Copy the contents of the `dist` folder to `backend/public`:

**Windows:**
```bash
xcopy /E /I /Y ..\dist\* public\
```

**Linux/Mac:**
```bash
cp -r ../dist/* public/
```

Or manually copy:
- Copy `dist/index.html` → `backend/public/index.html`
- Copy `dist/assets/` → `backend/public/assets/`
- Copy `dist/logo.png` → `backend/public/logo.png` (if exists)

### 3. Configure Database

Make sure your `.env` file has the correct database settings:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3307
DB_DATABASE=greatamericanaI
DB_USERNAME=root
DB_PASSWORD=
```

### 4. Run Migrations and Seeders

```bash
php artisan migrate
php artisan db:seed
```

### 5. Update React API Base URL

In your React app, update the API base URL to point to Laravel:

Create or update `src/utils/api.ts`:
```typescript
export const API_BASE_URL = window.location.origin + '/api';
```

Or if running separately:
```typescript
export const API_BASE_URL = 'http://localhost:8000/api';
```

### 6. Start Laravel Server

```bash
php artisan serve
```

The web portal will be available at: `http://localhost:8000`

## How It Works

- **Web Routes** (`/`): Serve the React app (SPA)
- **API Routes** (`/api/*`): Handle API requests from React app
- All routes except `/api/*` serve the React app for client-side routing

## Access Points

- **Web Portal**: `http://localhost:8000`
- **API Endpoints**: `http://localhost:8000/api/*`

## Default Users

- **Admin**: `admin@greatamerican.ai` / `admin123`
- **Vendor**: `vendor@greatamerican.ai` / `vendor123`
- **Customer**: `demo@greatamerican.ai` / `demo123`

## Development Workflow

1. **Frontend Development**: Run `npm run dev` in the root directory
2. **Backend Development**: Run `php artisan serve` in backend directory
3. **Production Build**: Build React app and copy to `backend/public`

## Notes

- The React app makes API calls to `/api/*` endpoints
- Laravel handles authentication via Sanctum tokens
- All non-API routes serve the React SPA for client-side routing
