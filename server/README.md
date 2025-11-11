# PennyWise Backend API

Finance management backend built with Node.js, Express, TypeScript, Prisma, and PostgreSQL.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```
   
### 2. Set Up Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed default categories
npm run prisma:seed
```

### 3. Start Development Server

```bash
npm run dev
```

## 📁 Project Structure

```
server/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seeding
├── src/
│   ├── index.ts           # Express app entry point
│   ├── middleware/        # Express middleware
│   │   ├── auth.ts        # JWT authentication
│   │   ├── errorHandler.ts # Error handling
│   │   └── validate.ts    # Request validation
│   ├── routes/            # API routes
│   │   ├── auth.ts        # Authentication routes
│   │   ├── transactions.ts
│   │   ├── budget.ts
│   │   ├── goals.ts
│   │   ├── analytics.ts
│   │   └── profile.ts
│   ├── utils/             # Utilities
│   │   ├── db.ts          # Prisma client
│   │   ├── jwt.ts         # JWT utilities
│   │   ├── password.ts    # Password hashing
│   │   └── logger.ts      # Logging
│   └── validations/       # Zod validation schemas
└── package.json
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Transactions
- `GET /api/transactions` - Get all transactions (with filters)
- `GET /api/transactions/:id` - Get single transaction
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Budget
- `GET /api/budget` - Get budgets
- `GET /api/budget/:id` - Get single budget
- `POST /api/budget` - Create budget
- `PUT /api/budget/:id` - Update budget
- `DELETE /api/budget/:id` - Delete budget

### Goals
- `GET /api/goals` - Get all goals
- `GET /api/goals/:id` - Get single goal
- `POST /api/goals` - Create goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

### Analytics
- `GET /api/analytics/monthly-summary` - Get monthly financial summary
- `GET /api/analytics/spending-trends` - Get spending trends over time
- `GET /api/analytics/category-spending` - Get spending by category

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `POST /api/profile/change-password` - Change password

## Authentication

All routes except `/api/auth/*` require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:seed` - Seed database with default data
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## Environment Variables

See `env.example` for all required environment variables with detailed setup instructions.

## Security Notes

- Never commit `.env` file to git
- Use strong, randomly generated JWT secrets
- In production, use HTTPS
- Consider rate limiting for production
- Validate all user inputs (already implemented with Zod)

## Planned Features

### Blockchain Integration
The following blockchain features are planned for future development:

- **Wallet Connection** - Connect Ethereum wallets using RainbowKit
- **Multi-Chain Support** - Track assets across multiple blockchain networks using Wagmi
- **Portfolio Tracking** - Real-time cryptocurrency and NFT portfolio monitoring
- **Token Balance Display** - View ERC-20, ERC-721, and ERC-1155 token balances
- **Transaction History** - Import and categorize blockchain transactions
- **Price Analytics** - Historical price charts and portfolio performance metrics
- **Blockchain-Based Goals** - Set savings goals tied to crypto holdings
- **Create Crypto Exchange** - Like uniswap

**Planned Tech Stack:**
- [Wagmi](https://wagmi.sh/) - React Hooks for Ethereum
- [RainbowKit](https://www.rainbowkit.com/) - Wallet connection UI
- [Viem](https://viem.sh/) - TypeScript interface for Ethereum
- [Nodies](https://nodies.app/) - Blockchain API provider

## Troubleshooting

**Database connection errors:**
- Verify `DATABASE_URL` is correct
- Check if your PostgreSQL instance is running
- Verify network/firewall settings

**JWT errors:**
- Ensure `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are set
- Tokens expire after 15 minutes (configurable via `JWT_ACCESS_EXPIRES_IN`)

**Prisma errors:**
- Run `npm run prisma:generate` after schema changes
- Run `npm run prisma:migrate` to apply migrations
