# GreatAmerican.Ai - AI Agent Marketplace

A modern, full-featured marketplace platform for buying and selling AI agents, built with React, TypeScript, and Vite. Features complete user authentication and separation of user data.

## 🔐 Authentication Features

### User Registration & Login
- **Secure Registration**: Create account with name, email, and password
- **Login System**: Email/password authentication
- **Session Management**: Persistent login sessions using localStorage
- **Protected Routes**: Restricted access to authenticated-only pages
- **User Profiles**: Customizable user information

### User Data Separation
Every user has completely isolated data:
- **Individual Shopping Carts**: Each user's cart is stored separately
- **Purchase History**: Track all purchases per user
- **Agent Listings**: Users can list and manage their own AI agents
- **Sales Tracking**: Sellers can view their sales data and revenue
- **Personal Dashboard**: User-specific statistics and analytics

### Demo Credentials
```
Email: demo@greatamerican.ai
Password: demo123
```

Or create your own account!

## Features

### 🛍️ Marketplace
- Browse and discover AI agents across multiple categories
- Advanced filtering by category and price range
- Multiple sorting options (popular, newest, price, rating)
- Detailed agent information pages with full specifications

### 🛒 Shopping Experience
- **User-specific shopping cart** with quantity management
- Secure checkout process (requires authentication)
- Order summary and payment processing
- Purchase history tracking
- 30-day money-back guarantee

### 💼 Seller Features
- Easy agent listing with comprehensive form
- Upload agent details, capabilities, and media
- **Personal dashboard** to track sales and performance
- Revenue tracking and analytics (85% commission)
- View buyer information for your agents

### 👤 User Management
- User registration and login
- Protected routes for authenticated users
- User profiles with customizable information
- **Separate purchase history** for each user
- **Individual seller dashboards** with personal data

### 🎨 Design
- Modern, responsive UI built with Tailwind CSS
- Gradient accents and smooth animations
- Mobile-first approach
- Intuitive navigation

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **LocalStorage** - Data persistence (user auth, carts, purchases, listings)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx       # Header with auth status
│   ├── Footer.tsx
│   ├── AgentCard.tsx
│   └── ProtectedRoute.tsx  # Route protection
├── pages/              # Page components
│   ├── Home.tsx
│   ├── Login.tsx        # Login page
│   ├── Register.tsx     # Registration page
│   ├── Marketplace.tsx
│   ├── AgentDetail.tsx
│   ├── Cart.tsx         # Protected route
│   ├── Checkout.tsx     # Protected route
│   ├── SellAgent.tsx    # Protected route
│   ├── Dashboard.tsx    # Protected route
│   └── Profile.tsx      # Protected route
├── services/           # Business logic
│   ├── authService.ts   # Authentication
│   └── userDataService.ts  # User data management
├── store/              # State management
│   └── useStore.ts      # Zustand store with auth
├── types/              # TypeScript types
│   └── index.ts
├── data/               # Mock data
│   └── mockData.ts
├── App.tsx             # Main app with auth check
├── main.tsx            # App entry point
└── index.css           # Global styles
```

## Authentication System

### How It Works

1. **Registration**: New users create an account with name, email, and password
2. **Login**: Users authenticate with email/password
3. **Session**: User data stored in localStorage for persistent sessions
4. **Protected Routes**: Certain pages require authentication (cart, checkout, dashboard, etc.)
5. **Auto-redirect**: Unauthenticated users redirected to login with return URL

### Data Storage

All user data is stored in localStorage with user-specific keys:
- `greatamerican_users` - All registered users
- `greatamerican_current_user` - Current session
- `cart_{userId}` - Individual user carts
- `purchases_{userId}` - User purchase history
- `listings_{userId}` - User's agent listings
- `sales_{userId}` - Seller's sales data

### Security Note

This is a demo application using localStorage for simplicity. In production:
- Use a backend API with proper database
- Implement JWT tokens or session cookies
- Hash passwords with bcrypt
- Use HTTPS
- Implement rate limiting
- Add CSRF protection

## User Features

### For Buyers
- Browse marketplace without login
- Must login to add items to cart
- Personal shopping cart
- Checkout and purchase tracking
- View purchase history
- Manage profile

### For Sellers
- Must login to list agents
- Personal dashboard with sales stats
- Track revenue (85% commission)
- View buyer information
- Manage listings

## Categories
- Customer Service
- Content Creation
- Data Analysis
- Automation
- Research
- Sales
- Marketing
- Development

## Future Enhancements

- Backend API integration
- Real payment processing (Stripe, PayPal)
- Email verification
- Password reset functionality
- OAuth (Google, GitHub)
- Two-factor authentication
- Agent reviews and ratings system
- Advanced search functionality
- AI agent API testing playground
- Real-time notifications
- Messaging system between buyers and sellers
- Agent versioning and updates
- Subscription-based agents

## License

MIT License - feel free to use this project for your own purposes.

## Support

For support, email support@greatamerican.ai or open an issue in the repository.
