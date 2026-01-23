# GreatAmerican.Ai - Web Portal Backend

Laravel backend that serves both the React frontend and API for the GreatAmerican.Ai marketplace platform with role-based access control.

## Features

- **Role-Based Access Control**: Three roles - Admin, Vendor, Customer
- **Authentication**: Laravel Sanctum for API token authentication
- **Agent Management**: CRUD operations for AI agents
- **Shopping Cart**: User-specific cart management
- **Purchase System**: Purchase history and order management
- **Dashboard**: Vendor dashboard with sales statistics

## Roles

1. **Admin**: Full access to all resources, can manage agents and users
2. **Vendor**: Can create, update, and manage their own agents, view dashboard
3. **Customer**: Can browse agents, add to cart, make purchases

## Installation

1. Install dependencies:
```bash
composer install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
php artisan key:generate
```

3. Configure database in `.env`:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3307
DB_DATABASE=greatamericanaI
DB_USERNAME=root
DB_PASSWORD=
```

4. Run migrations:
```bash
php artisan migrate
```

5. Seed database with default users:
```bash
php artisan db:seed
```

## Default Users

After seeding, you can login with:

- **Admin**: `admin@greatamerican.ai` / `admin123`
- **Vendor**: `vendor@greatamerican.ai` / `vendor123`
- **Customer**: `demo@greatamerican.ai` / `demo123`

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout (requires auth)
- `GET /api/me` - Get current user (requires auth)
- `PUT /api/profile` - Update profile (requires auth)

### Agents (Public)
- `GET /api/agents` - List all agents (with filters)
- `GET /api/agents/{id}` - Get agent details

### Agents (Vendor/Admin)
- `POST /api/agents` - Create new agent
- `PUT /api/agents/{id}` - Update agent
- `DELETE /api/agents/{id}` - Delete agent
- `GET /api/my-listings` - Get my listings

### Cart (Customer)
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add to cart
- `PUT /api/cart/{id}` - Update cart item
- `DELETE /api/cart/{id}` - Remove from cart
- `DELETE /api/cart` - Clear cart

### Purchases (Customer)
- `GET /api/purchases` - Get purchase history
- `POST /api/purchases` - Complete purchase

### Dashboard (Vendor/Admin)
- `GET /api/dashboard` - Get dashboard statistics

## API Usage

### Authentication Flow

1. Register or Login to get a token:
```bash
POST /api/login
{
  "email": "demo@greatamerican.ai",
  "password": "demo123"
}

Response:
{
  "success": true,
  "user": {...},
  "token": "1|..."
}
```

2. Use token in Authorization header:
```
Authorization: Bearer {token}
```

### Example Requests

**Get Agents:**
```bash
GET /api/agents?category=Customer Service&sort_by=popular
```

**Add to Cart:**
```bash
POST /api/cart
Authorization: Bearer {token}
{
  "agent_id": 1,
  "quantity": 2
}
```

**Complete Purchase:**
```bash
POST /api/purchases
Authorization: Bearer {token}
```

## CORS Configuration

The API is configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Alternative frontend)
- `http://127.0.0.1:5173`

Update `SANCTUM_STATEFUL_DOMAINS` in `.env` for production.

## Running the Server

```bash
php artisan serve
```

The web portal will be available at `http://localhost:8000`
- **Web Portal**: `http://localhost:8000` (serves React app)
- **API Endpoints**: `http://localhost:8000/api/*`

## Serving the React Frontend

1. Build the React app: `npm run build` (from project root)
2. Copy `dist/*` contents to `backend/public/`
3. Laravel will serve the React app for all non-API routes

See `SETUP.md` for detailed instructions.

## Database Structure

- **users**: User accounts with roles
- **agents**: AI agent listings
- **cart_items**: Shopping cart items
- **purchases**: Purchase history

## Middleware

- `auth:sanctum` - Requires authentication
- `role:admin,vendor` - Requires specific role(s)

## License

MIT License
