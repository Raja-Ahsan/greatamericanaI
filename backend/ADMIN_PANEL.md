# Admin Panel API Documentation

The admin panel is accessible via API endpoints for admin users only.

## Admin Dashboard

**GET** `/api/admin/dashboard`

Returns statistics and recent data:
- Total users, agents, purchases
- Revenue statistics
- Recent users, agents, and purchases

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_users": 100,
      "total_agents": 50,
      "active_agents": 45,
      "pending_agents": 5,
      "total_purchases": 200,
      "total_revenue": 50000.00,
      "total_vendors": 20,
      "total_customers": 80
    },
    "recent_users": [...],
    "recent_agents": [...],
    "recent_purchases": [...]
  }
}
```

## User Management

### List Users
**GET** `/api/admin/users?role=vendor&search=john`

Query Parameters:
- `role`: Filter by role (admin, vendor, customer)
- `search`: Search by name or email
- `page`: Page number for pagination

### Create User
**POST** `/api/admin/users`

Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "vendor",
  "verified": true
}
```

### Get User
**GET** `/api/admin/users/{id}`

### Update User
**PUT** `/api/admin/users/{id}`

Body:
```json
{
  "name": "John Doe Updated",
  "email": "john@example.com",
  "role": "vendor",
  "verified": true
}
```

### Delete User
**DELETE** `/api/admin/users/{id}`

## Agent Management

### List Agents
**GET** `/api/admin/agents?status=pending&category=Customer Service`

Query Parameters:
- `status`: Filter by status (active, pending, inactive)
- `category`: Filter by category
- `search`: Search by name or description
- `page`: Page number for pagination

### Update Agent Status
**PATCH** `/api/admin/agents/{id}/status`

Body:
```json
{
  "status": "active"
}
```

### Delete Agent
**DELETE** `/api/admin/agents/{id}`

## Authentication

All admin endpoints require:
1. Authentication token (Bearer token)
2. Admin role

**Headers:**
```
Authorization: Bearer {token}
```

## Access

Login as admin:
- Email: `admin@greatamerican.ai`
- Password: `admin123`

Then use the token in API requests.
