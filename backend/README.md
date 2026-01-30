# BuildMyResume Backend API

Production-grade backend API for BuildMyResume with Razorpay payment integration, analytics tracking, and admin dashboard.

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Razorpay test account

### Installation

1. **Install dependencies**:
```bash
cd backend
npm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env
# Edit .env with your database URL and Razorpay keys
```

3. **Set up PostgreSQL database**:
```bash
# Create database
createdb buildmyresume

# Or using psql:
psql -U postgres
CREATE DATABASE buildmyresume;
\q
```

4. **Run database migrations**:
```bash
npm run db:migrate
```

5. **Seed initial data**:
```bash
npm run db:seed
```

6. **Start development server**:
```bash
npm run dev
```

Server will start on `http://localhost:3001`

## API Endpoints

### Public Endpoints

#### GET /api/templates
Fetch all active templates with pricing
- **Response**: `{ templates: Template[] }`

#### GET /api/templates/access/:templateId
Check if session has access to template
- **Query**: `?sessionId=xxx`
- **Response**: `{ hasAccess: boolean, reason: string, price?: number }`

#### POST /api/orders/create
Create Razorpay order for template purchase
- **Body**: `{ templateId: string, sessionId: string }`
- **Response**: `{ orderId: string, razorpayKeyId: string, amount: number, currency: string, templateName: string }`

#### POST /api/orders/verify
Verify Razorpay payment signature
- **Body**: `{ razorpay_payment_id: string, razorpay_order_id: string, razorpay_signature: string, sessionId: string }`
- **Response**: `{ success: boolean, templateId?: string, message: string }`

#### POST /api/analytics/track
Track analytics event
- **Body**: `{ eventType: string, sessionId: string, templateId?: string, targetRole?: string, metadata?: object }`
- **Response**: `{ success: boolean }`

### Admin Endpoints

All admin endpoints require `X-Admin-Password` header

#### GET /api/admin/templates
Get all templates (including inactive)
- **Headers**: `X-Admin-Password: your_admin_password`
- **Response**: `{ templates: Template[] }`

#### PATCH /api/admin/templates/:templateId
Update template metadata
- **Headers**: `X-Admin-Password: your_admin_password`
- **Body**: `{ price?: number, is_active?: boolean, badge?: string, ... }`
- **Response**: `{ success: boolean, message: string }`

#### GET /api/admin/analytics/conversion-funnel
Get conversion funnel data
- **Headers**: `X-Admin-Password: your_admin_password`
- **Query**: `?startDate=2026-01-01&endDate=2026-01-31` (optional)
- **Response**: `{ funnel: object, conversionRate: number }`

#### GET /api/admin/analytics/role-demand
Get role demand ranking
- **Headers**: `X-Admin-Password: your_admin_password`
- **Response**: `{ roles: RoleDemand[] }`

#### GET /api/admin/analytics/template-performance
Get per-template performance metrics
- **Headers**: `X-Admin-Password: your_admin_password`
- **Response**: `{ templates: TemplatePerformance[] }`

## Security Features

- **Backend-verified payments**: All payment verification uses HMAC signature
- **Session-based access control**: Template access tied to verified payments
- **Privacy-safe analytics**: No PII stored, only anonymous session IDs
- **SQL injection protection**: Parameterized queries throughout
- **CORS protection**: Configured for specific frontend origin

## Database Schema

### Tables
- **templates**: Template metadata and pricing
- **orders**: Payment orders with Razorpay details
- **analytics_events**: Event tracking for funnel analysis
- **role_demand**: Role search tracking for intelligence
- **admin_users**: Admin authentication (future)

See `src/db/migrate.ts` for complete schema.

## Development

### Run in watch mode
```bash
npm run dev
```

### Build for production
```bash
npm run build
npm start
```

### Database commands
```bash
npm run db:migrate  # Run migrations
npm run db:seed     # Seed initial data
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://localhost:5432/buildmyresume` |
| `RAZORPAY_KEY_ID` | Razorpay public key (test mode) | `rzp_test_S0YeE4EXs3EsVZ` |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key (test mode) | `f7QMi6VnaRF3WuPWJjcDdgPs` |
| `ADMIN_PASSWORD` | Admin dashboard password | `admin123change` |
| `SESSION_SECRET` | Cookie signing secret | `random_string` |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` or `production` |
| `FRONTEND_URL` | Frontend origin for CORS | `http://localhost:5173` |

## Testing Payment Flow

1. Start backend: `npm run dev`
2. Use Razorpay test mode keys
3. Test with these test card numbers:
   - **Success**: 4111 1111 1111 1111
   - **Failure**: 4000 0000 0000 0002
4. Use any future expiry date and CVV

## Production Checklist

- [ ] Replace Razorpay test keys with live keys
- [ ] Change `ADMIN_PASSWORD` to strong password
- [ ] Set `NODE_ENV=production`
- [ ] Enable database backups
- [ ] Set up monitoring (e.g., PM2, DataDog)
- [ ] Configure SSL/TLS for database connection
- [ ] Set up log aggregation
- [ ] Enable rate limiting
- [ ] Review CORS settings

## License

Private - BuildMyResume
