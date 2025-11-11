# 🎓 PennyWise Backend - Complete Learning Guide

## Table of Contents
1. [What is This App?](#what-is-this-app)
2. [Architecture Overview](#architecture-overview)
3. [How Authentication Works](#how-authentication-works)
4. [API Request Flow](#api-request-flow)
5. [Database Models Explained](#database-models-explained)
6. [Key Backend Concepts](#key-backend-concepts)
7. [File Structure Explained](#file-structure-explained)
8. [Common Patterns](#common-patterns)

---

## What is This App?

**PennyWise** is a personal finance management application that helps users:
- Track income and expenses
- Set monthly budgets by category
- Create savings goals
- View financial analytics and insights

**Tech Stack:**
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: JWT tokens
- **Validation**: Zod schemas

---

## Architecture Overview

### Client-Server Communication

```
Frontend (Next.js)          Backend (Express)          Database (PostgreSQL)
     │                            │                           │
     │  HTTP Request              │                           │
     │  (GET /api/transactions)   │                           │
     ├────────────────────────────>│                           │
     │                            │                           │
     │                            │  SQL Query               │
     │                            ├──────────────────────────>│
     │                            │                           │
     │                            │  Data Results             │
     │                            │<──────────────────────────┤
     │                            │                           │
     │  JSON Response             │                           │
     │  ({ transactions: [...] }) │                           │
     │<───────────────────────────┤                           │
```

### Request Flow Example

1. **User clicks "View Transactions"** in frontend
2. **Frontend sends HTTP request**: `GET /api/transactions` with JWT token
3. **Backend receives request** in `routes/transactions.ts`
4. **Authentication middleware** checks JWT token
5. **Validation middleware** checks query parameters
6. **Route handler** queries database using Prisma
7. **Database returns** transaction data
8. **Backend sends JSON response** to frontend
9. **Frontend displays** transactions in UI

---

## How Authentication Works

### Step-by-Step Authentication Flow

#### 1. User Registration

```
User fills form → Frontend sends POST /api/auth/register
                                ↓
Backend receives: { email, password, name }
                                ↓
Backend hashes password (bcrypt) → Never store plain passwords!
                                ↓
Backend creates user in database
                                ↓
Backend generates JWT tokens (access + refresh)
                                ↓
Backend sends: { user: {...}, tokens: { accessToken, refreshToken } }
                                ↓
Frontend stores tokens in localStorage/memory
```

#### 2. User Login

```
User enters email/password → Frontend sends POST /api/auth/login
                                ↓
Backend finds user by email
                                ↓
Backend compares password hash with input
                                ↓
If password correct → Generate tokens
                                ↓
Backend sends tokens to frontend
```

#### 3. Making Authenticated Requests

```
Frontend makes API request → Adds header: "Authorization: Bearer <accessToken>"
                                ↓
Backend authenticate middleware checks token
                                ↓
If valid → Extract userId from token → Add to req.user
                                ↓
Route handler can access req.user.userId
                                ↓
Query only user's data (filter by userId)
```

#### 4. Token Refresh (When Access Token Expires)

```
Access token expires (15 min) → Frontend sends POST /api/auth/refresh
                                ↓
Backend verifies refresh token
                                ↓
Backend generates NEW access + refresh tokens
                                ↓
Frontend updates stored tokens
                                ↓
User continues using app (no re-login needed!)
```

### Why Two Tokens?

- **Access Token** (15 min): Short-lived, used for every API request
  - If stolen, only valid for 15 minutes
  - Reduces risk if compromised

- **Refresh Token** (7 days): Long-lived, only used to get new access tokens
  - Stored securely
  - Allows "remember me" functionality

---

## API Request Flow

### Complete Flow: Creating a Transaction

```
1. USER ACTION
   User clicks "Add Expense" → Enters: $50, Food, "Groceries"

2. FRONTEND
   Frontend validates form → Sends POST /api/transactions
   Headers: {
     "Authorization": "Bearer <accessToken>",
     "Content-Type": "application/json"
   }
   Body: {
     "amount": 50,
     "categoryId": "uuid-of-food-category",
     "type": "EXPENSE",
     "description": "Groceries"
   }

3. BACKEND MIDDLEWARE
   ├─ CORS middleware: Checks if origin allowed
   ├─ JSON parser: Converts JSON to JavaScript object
   ├─ authenticate middleware: Verifies JWT token
   │  └─ Extracts userId → Adds to req.user
   └─ validate middleware: Checks data against Zod schema
      └─ Validates: amount > 0, categoryId is UUID, type is INCOME/EXPENSE

4. ROUTE HANDLER (routes/transactions.ts)
   ├─ Gets userId from req.user
   ├─ Verifies category exists in database
   ├─ Checks category type matches transaction type
   └─ Creates transaction: prisma.transaction.create({...})

5. DATABASE
   PostgreSQL executes INSERT statement
   Returns created transaction record

6. RESPONSE
   Backend sends: {
     "success": true,
     "data": {
       "id": "uuid",
       "amount": 50,
       "category": { "name": "Food", ... },
       ...
     }
   }

7. FRONTEND
   Updates UI with new transaction
```

---

## Database Models Explained

### User Model
```typescript
User {
  id: UUID              // Unique identifier
  email: string         // Login email (unique)
  passwordHash: string  // Hashed password (never plain text!)
  name: string?         // Optional display name
  createdAt: DateTime   // Account creation date
  updatedAt: DateTime   // Last update date
  
  // Relations (other data this user owns):
  transactions: Transaction[]
  budgets: Budget[]
  goals: Goal[]
}
```

**Key Concept**: One user has many transactions, budgets, and goals (one-to-many relationship)

### Category Model
```typescript
Category {
  id: UUID
  name: string          // "Food", "Transportation", etc.
  type: CategoryType    // INCOME or EXPENSE
  createdAt: DateTime
  updatedAt: DateTime
  
  // Relations:
  transactions: Transaction[]  // All transactions using this category
  budgets: Budget[]           // All budgets using this category
}
```

**Key Concept**: Categories are shared by all users (not user-specific). Seeded once, used by everyone.

### Transaction Model
```typescript
Transaction {
  id: UUID
  userId: UUID          // Which user owns this transaction
  categoryId: UUID     // Which category (Food, Housing, etc.)
  amount: Decimal       // Money amount (e.g., 50.00)
  description: string?  // Optional note
  date: DateTime        // When transaction occurred
  type: TransactionType // INCOME or EXPENSE
  createdAt: DateTime
  updatedAt: DateTime
  
  // Relations:
  user: User           // The user who owns this
  category: Category   // The category assigned
}
```

**Key Concept**: Transactions link users to categories. Each transaction belongs to one user and one category.

### Budget Model
```typescript
Budget {
  id: UUID
  userId: UUID
  categoryId: UUID
  amount: Decimal       // Budget limit (e.g., $500 for Food)
  month: number         // 1-12 (January = 1)
  year: number          // 2024
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Key Concept**: Budget = spending limit for a category in a specific month/year. One budget per category per month.

### Goal Model
```typescript
Goal {
  id: UUID
  userId: UUID
  title: string         // "Save for vacation"
  description: string?
  targetAmount: Decimal // Goal amount (e.g., $5000)
  currentAmount: Decimal // How much saved so far (starts at 0)
  targetDate: DateTime? // Optional deadline
  status: GoalStatus    // IN_PROGRESS, COMPLETED, CANCELLED
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Key Concept**: Goals track progress toward savings targets. Users update currentAmount as they save.

---

## Key Backend Concepts

### 1. REST API Pattern

**REST** = Representational State Transfer

Standard HTTP methods for different operations:

| Method | Endpoint | Action | Example |
|--------|----------|--------|---------|
| GET | `/api/transactions` | Read (list) | Get all transactions |
| GET | `/api/transactions/:id` | Read (single) | Get one transaction |
| POST | `/api/transactions` | Create | Add new transaction |
| PUT | `/api/transactions/:id` | Update | Modify transaction |
| DELETE | `/api/transactions/:id` | Delete | Remove transaction |

**Why REST?**
- Standardized: Everyone uses same patterns
- Predictable: Easy to understand what each endpoint does

### Middleware

**Middleware** = functions that run between request and response

```typescript
Request → Middleware 1 → Middleware 2 → Route Handler → Response
```

**Our Middleware:**

1. **CORS**: Allows frontend to make requests
2. **JSON Parser**: Converts JSON to JavaScript object
3. **Authentication**: Checks JWT token, adds user to request
4. **Validation**: Validates request data
5. **Error Handler**: Catches errors and sends formatted response

**Key Concept**: Middleware runs in order. Each middleware can modify the request or stop the flow.

### 3. Validation with Zod

**Why Validate?**
- Prevent bad data from entering database
- Clear error messages for frontend
- Type safety at runtime

**Example:**
```typescript
// Schema defines what valid data looks like
const createTransactionSchema = z.object({
  amount: z.number().positive(),  // Must be positive number
  categoryId: z.string().uuid(),   // Must be valid UUID
  type: z.enum(['INCOME', 'EXPENSE'])  // Must be one of these
});

// Middleware validates request
validate(createTransactionSchema)  // Checks req.body matches schema
```

### 4. Database Queries with Prisma

**Prisma** = Object-Relational Mapping (ORM)
- Write JavaScript instead of SQL
- Type-safe database queries
- Automatic SQL generation

**Examples:**

```typescript
// Find all transactions for a user
const transactions = await prisma.transaction.findMany({
  where: { userId: "user-id" },
  include: { category: true }  // Include related category data
});

// Create new transaction
const transaction = await prisma.transaction.create({
  data: {
    userId: "user-id",
    amount: 50,
    categoryId: "category-id",
    type: "EXPENSE"
  }
});

// Sum amounts (aggregation)
const total = await prisma.transaction.aggregate({
  where: { userId: "user-id", type: "EXPENSE" },
  _sum: { amount: true }  // Sum the amount field
});
```

### 5. Error Handling

**Three Types of Errors:**

1. **Validation Errors** (400 Bad Request)
   - Invalid data format
   - Missing required fields

2. **Authentication Errors** (401 Unauthorized)
   - No token provided
   - Invalid/expired token

3. **Not Found Errors** (404 Not Found)
   - Transaction doesn't exist
   - User doesn't own the resource

4. **Server Errors** (500 Internal Server Error)
   - Database connection failed
   - Unexpected errors

**Error Handler Middleware:**
- Catches all errors
- Logs them for debugging
- Sends formatted JSON response to frontend

### 6. Security Concepts

**Password Hashing:**
- Never store plain passwords!
- bcrypt creates one-way hash
- Can't reverse hash to get original password
- When user logs in, hash their input and compare

**JWT Tokens:**
- Signed with secret key (only server knows it)
- Contains user ID and email
- Expires automatically (15 min for access token)
- Can't be tampered with (signature verification)

**Authorization:**
- Users can only access their own data
- Every query filters by userId: `where: { userId: req.user.userId }`
- Prevents users from seeing others' transactions

---

## File Structure Explained

```
server/
├── src/
│   ├── index.ts              # Main entry point - starts Express server
│   │
│   ├── routes/               # API endpoint handlers
│   │   ├── auth.ts          # Authentication (register, login, refresh)
│   │   ├── transactions.ts  # CRUD for transactions
│   │   ├── budget.ts        # Budget management
│   │   ├── goals.ts         # Savings goals
│   │   ├── analytics.ts     # Financial reports
│   │   └── profile.ts       # User profile management
│   │
│   ├── middleware/          # Request processing functions
│   │   ├── auth.ts          # JWT authentication check
│   │   ├── validate.ts     # Request data validation
│   │   └── errorHandler.ts # Global error handler
│   │
│   ├── validations/         # Zod validation schemas
│   │   ├── auth.ts
│   │   ├── transactions.ts
│   │   ├── budget.ts
│   │   ├── goals.ts
│   │   └── profile.ts
│   │
│   └── utils/              # Helper functions
│       ├── db.ts          # Prisma database client
│       ├── jwt.ts          # Token generation/verification
│       ├── password.ts    # Password hashing/comparison
│       └── logger.ts      # Logging utility
│
├── prisma/
│   ├── schema.prisma       # Database schema (models)
│   └── seed.ts             # Initial data (default categories)
│
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── .env                    # Environment variables (not in git!)
```

---

## Common Patterns

### Pattern 1: CRUD Operations

Every resource (transactions, budgets, goals) follows same pattern:

```typescript
// CREATE
router.post('/', validate(schema), async (req, res) => {
  const data = await prisma.model.create({ data: req.body });
  res.status(201).json({ success: true, data });
});

// READ (all)
router.get('/', async (req, res) => {
  const data = await prisma.model.findMany({ where: { userId } });
  res.json({ success: true, data });
});

// READ (one)
router.get('/:id', async (req, res) => {
  const data = await prisma.model.findFirst({ where: { id, userId } });
  res.json({ success: true, data });
});

// UPDATE
router.put('/:id', validate(schema), async (req, res) => {
  const data = await prisma.model.update({ where: { id }, data: req.body });
  res.json({ success: true, data });
});

// DELETE
router.delete('/:id', async (req, res) => {
  await prisma.model.delete({ where: { id } });
  res.json({ success: true });
});
```

### Pattern 2: User Filtering

**Always filter by userId** to ensure users only see their data:

```typescript
const userId = req.user!.userId;  // From authentication middleware
const transactions = await prisma.transaction.findMany({
  where: { userId }  // CRITICAL: Only get user's transactions
});
```

### Pattern 3: Validation Before Database

**Always validate before database operations:**

```typescript
// 1. Validate request data
validate(createSchema)  // Middleware checks data

// 2. Verify related records exist
const category = await prisma.category.findUnique({ where: { id } });
if (!category) return res.status(404).json({ error: 'Not found' });

// 3. Create record
const transaction = await prisma.transaction.create({ data });
```

### Pattern 4: Error Responses

**Consistent error format:**

```typescript
// Not found
res.status(404).json({ success: false, error: 'Transaction not found' });

// Validation error
res.status(400).json({ success: false, error: 'Invalid data' });

// Success
res.json({ success: true, data: result });
```

---

## Next Steps

1. **Read the code** - All files have detailed comments
2. **Run the server** - `npm run dev` and test endpoints
3. **Use Prisma Studio** - `npx prisma studio` to see database visually
4. **Try the API** - Use Postman or curl to test endpoints
5. **Build the frontend** - Connect Next.js to these APIs

---

## Questions to Test Your Understanding

1. What happens when a user logs in? (List all steps)
2. Why do we hash passwords before storing them?
3. How does the authenticate middleware work?
4. What's the difference between `findMany` and `findFirst`?
5. Why do we validate data before saving to database?
6. What is the purpose of JWT tokens?
7. How do we ensure users only see their own data?

---

## Resources

- [Express.js Docs](https://expressjs.com/)
- [Prisma Docs](https://www.prisma.io/docs)
- [JWT Explained](https://jwt.io/introduction)
- [REST API Best Practices](https://restfulapi.net/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Happy Learning! 🚀**

Remember: The best way to learn is to read the code, run it, modify it, and see what happens. All files have detailed comments explaining every concept.

