# Prisma Migration Setup for PostgreSQL Providers

## Provider Options

### Recommended for Portfolio Projects:
- **Neon.tech** - Serverless PostgreSQL, excellent free tier, Prisma-friendly
- **Supabase** - Full-featured (auth, storage), free tier
- **Render** - Simple setup, free PostgreSQL tier
- **Railway** - Easy deployment, free tier

### For Resume/Enterprise Experience:
- **AWS RDS PostgreSQL** - Industry standard, 12-month free tier
  - Resume-worthy, real-world experience
  - Requires AWS account and setup knowledge
  - More complex but valuable learning

## Supabase Setup

## The Issue
Supabase uses connection pooling. The **pooler** (port 6543) is great for regular queries but doesn't support Prisma migrations. Migrations require a **direct connection** (port 5432).

## Production-Grade Solution

### Option 1: Use Direct Connection for Migrations (Recommended)

1. **Get Direct Connection String from Supabase:**
   - Go to Supabase Dashboard → Settings → Database
   - Scroll to "Connection string"
   - Select "URI" tab (not "Pooler")
   - Copy the connection string (should have port 5432)
   - Format: `postgresql://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres`

2. **Update .env for Migrations:**
   ```bash
   # Use direct connection for migrations
   DATABASE_URL="postgresql://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres?sslmode=require"
   ```

3. **Run Migrations:**
   ```bash
   npx prisma migrate dev --name init
   # or for production:
   npx prisma migrate deploy
   ```

4. **For Production Queries (Optional):**
   Create a separate connection for regular queries using pooler:
   ```bash
   # In your code, you can use pooler for better performance
   # But Prisma Client uses DATABASE_URL from schema
   ```

### Option 2: Use Prisma Migrate Deploy (Production)

For production environments, use `prisma migrate deploy` instead of `dev`:

```bash
# This applies migrations without interactive prompts
npx prisma migrate deploy
```

This works better with CI/CD and doesn't require interactive mode.

### Option 3: Connection String Parameters

Add these parameters to your connection string if needed:

```bash
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require&connect_timeout=10"
```

Parameters:
- `sslmode=require` - Required for Supabase
- `connect_timeout=10` - Connection timeout in seconds

### Troubleshooting

**If direct connection (5432) doesn't work:**
1. Check Supabase Network Restrictions:
   - Settings → Database → Connection Pooling
   - Ensure "Restrict connections to Supabase IPs only" is OFF (for local dev)

2. Check Firewall:
   - Your local network/firewall might block port 5432
   - Try from different network or use Supabase SQL Editor

3. Use Supabase SQL Editor:
   - If migrations still fail, create tables via SQL Editor
   - Then mark migrations as applied: `npx prisma migrate resolve --applied <migration-name>`

**Best Practice:**
- Development: Use direct connection (5432) with `migrate dev`
- Production: Use direct connection (5432) with `migrate deploy` in CI/CD
- Regular queries: Can use pooler (6543) for better performance (but requires separate client setup)

### Alternative: Prisma Data Proxy (Enterprise)

Supabase offers Prisma Data Proxy integration, but it requires Supabase Enterprise plan.

## Current Status

Your connection string should be:
```
postgresql://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres?sslmode=require
```

NOT the pooler:
```
postgresql://postgres.[ref]:[password]@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true
```

The pooler is for queries, not migrations!
