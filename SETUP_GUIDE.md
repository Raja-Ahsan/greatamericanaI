# GreatAmerican.Ai - Complete Setup Guide

This guide will help you get the AI Agent Marketplace up and running on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.0 or higher)
  - Download from: https://nodejs.org/
  - Verify installation: `node --version`
  
- **npm** (comes with Node.js) or **yarn**
  - Verify npm: `npm --version`
  - Or install yarn: `npm install -g yarn`

- **Git** (optional, for version control)
  - Download from: https://git-scm.com/

## Quick Start

### 1. Install Dependencies

Open your terminal in the project directory and run:

```bash
npm install
```

This will install all required dependencies including:
- React 18
- TypeScript
- Vite
- React Router
- Zustand (state management)
- Tailwind CSS
- Lucide Icons

### 2. Start Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173`

You should see output like:
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 3. Open in Browser

Navigate to `http://localhost:5173` in your web browser.

## Available Scripts

- **`npm run dev`** - Start development server with hot reload
- **`npm run build`** - Build for production (outputs to `dist/`)
- **`npm run preview`** - Preview production build locally
- **`npm run lint`** - Run ESLint to check code quality

## Project Structure Overview

```
greatamerican-ai/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Header.tsx      # Navigation header with auth
│   │   ├── Footer.tsx      # Site footer
│   │   ├── AgentCard.tsx   # AI agent card component
│   │   ├── ProtectedRoute.tsx  # Auth guard
│   │   ├── LoadingSpinner.tsx
│   │   ├── EmptyState.tsx
│   │   └── NotificationToast.tsx
│   │
│   ├── pages/              # Page components (routes)
│   │   ├── Home.tsx        # Landing page
│   │   ├── Login.tsx       # Login page
│   │   ├── Register.tsx    # Registration page
│   │   ├── Marketplace.tsx # Browse agents
│   │   ├── AgentDetail.tsx # Agent details
│   │   ├── Cart.tsx        # Shopping cart
│   │   ├── Checkout.tsx    # Checkout flow
│   │   ├── SellAgent.tsx   # List new agent
│   │   ├── Dashboard.tsx   # Seller dashboard
│   │   └── Profile.tsx     # User profile
│   │
│   ├── services/           # Business logic
│   │   ├── authService.ts  # Authentication service
│   │   └── userDataService.ts  # User data management
│   │
│   ├── store/              # State management
│   │   └── useStore.ts     # Zustand store
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   └── useLocalStorage.ts
│   │
│   ├── utils/              # Utility functions
│   │   ├── constants.ts
│   │   └── helpers.ts
│   │
│   ├── types/              # TypeScript definitions
│   │   └── index.ts
│   │
│   ├── data/               # Mock data
│   │   └── mockData.ts
│   │
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
│
├── public/                 # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite config
├── tailwind.config.js      # Tailwind CSS config
└── postcss.config.js       # PostCSS config
```

## Authentication System

### How It Works

The app uses **localStorage** for data persistence (suitable for demo/development):

1. **Registration**: Users create accounts with name, email, password
2. **Login**: Authenticate with email/password
3. **Session**: User data stored in localStorage
4. **Protected Routes**: Cart, checkout, dashboard require authentication
5. **Data Isolation**: Each user has separate cart, purchases, and listings

### Demo Account

You can login with:
```
Email: demo@greatamerican.ai
Password: demo123
```

Or create your own account!

### Data Storage Keys

All data is stored in browser's localStorage:
- `greatamerican_users` - All registered users
- `greatamerican_current_user` - Current session
- `cart_{userId}` - User's shopping cart
- `purchases_{userId}` - Purchase history
- `listings_{userId}` - Agent listings
- `sales_{userId}` - Sales data

## Testing User Flows

### As a Buyer

1. **Browse Marketplace**
   - Visit `/marketplace`
   - Filter by category and price
   - Sort agents by various criteria

2. **View Agent Details**
   - Click on any agent card
   - View full specifications
   - Check seller information

3. **Add to Cart** (requires login)
   - Click "Add to Cart"
   - Login if not authenticated
   - Manage quantities in cart

4. **Checkout**
   - Review cart items
   - Fill checkout form
   - Complete purchase
   - View in purchase history

### As a Seller

1. **List an Agent**
   - Login first
   - Navigate to `/sell`
   - Fill in agent details
   - Submit for review

2. **View Dashboard**
   - See sales statistics
   - Track revenue
   - View active listings
   - Monitor performance

### Testing Multiple Users

1. Register user 1: `user1@test.com`
2. Add items to cart
3. Logout
4. Register user 2: `user2@test.com`
5. Verify separate cart
6. Each user has isolated data

## Building for Production

### Create Production Build

```bash
npm run build
```

This creates optimized files in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Deploy

The `dist/` folder can be deployed to:
- **Vercel**: `vercel deploy`
- **Netlify**: Drag and drop `dist/` folder
- **GitHub Pages**: Upload to gh-pages branch
- **Any static hosting**: Upload `dist/` contents

## Troubleshooting

### Port Already in Use

If port 5173 is busy:
```bash
npm run dev -- --port 3000
```

### Clear Browser Data

If experiencing issues with localStorage:
1. Open DevTools (F12)
2. Go to Application tab
3. Clear localStorage
4. Refresh page

### Node Modules Issues

If you encounter dependency issues:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

If build fails:
1. Check Node.js version: `node --version` (should be 18+)
2. Clear cache: `npm cache clean --force`
3. Reinstall: `rm -rf node_modules && npm install`

## Environment Variables (Optional)

Create a `.env` file in the root directory:

```env
VITE_APP_NAME=GreatAmerican.Ai
VITE_ENABLE_DEMO_MODE=true
```

Access in code:
```typescript
const appName = import.meta.env.VITE_APP_NAME;
```

## Next Steps

### Add Backend API

1. Set up Node.js/Express backend
2. Replace localStorage with API calls
3. Implement JWT authentication
4. Add database (PostgreSQL, MongoDB)

### Add Real Payments

1. Integrate Stripe or PayPal
2. Handle payment webhooks
3. Generate invoices
4. Manage subscriptions

### Add Features

- [ ] Email verification
- [ ] Password reset
- [ ] Two-factor authentication
- [ ] Real-time notifications
- [ ] Agent reviews and ratings
- [ ] Search functionality
- [ ] Wishlist feature
- [ ] Admin dashboard

## Getting Help

- Check the README.md for features overview
- Review component files for implementation details
- Check browser console for errors
- Review Network tab for API calls (future)

## Development Tips

1. **Hot Reload**: Changes auto-refresh in browser
2. **TypeScript**: Enjoy full type safety
3. **Tailwind**: Use utility classes for styling
4. **Components**: Keep components small and reusable
5. **State**: Use Zustand for global state
6. **Hooks**: Create custom hooks for reusable logic

## Production Considerations

⚠️ **Security Notes for Production:**

- Hash passwords (use bcrypt)
- Use HTTPS only
- Implement rate limiting
- Add CSRF protection
- Use secure session management (JWT)
- Validate all inputs server-side
- Use environment variables for secrets
- Implement proper error handling
- Add logging and monitoring

This app is great for learning and prototyping. For production, integrate with a proper backend!

---

Happy coding! 🚀
