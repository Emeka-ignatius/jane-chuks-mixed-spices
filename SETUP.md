# JaneChucks Mixed Spices - Setup Guide

## Prerequisites
- Node.js 18+ installed
- Neon PostgreSQL database configured

## Environment Variables

Create a `.env` file in the root directory with the following variables:

\`\`\`env
# Database (Neon)
DATABASE_URL="your-neon-database-url"

# Authentication
JWT_SECRET="your-secure-jwt-secret-key-at-least-32-characters"

# Email (Resend)
RESEND_API_KEY="your-resend-api-key"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Payment (Paystack)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="your-paystack-public-key"
\`\`\`

## Installation Steps

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Setup Prisma
\`\`\`bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database
npx prisma db push

# Seed the database with initial data (admin user + products)
npm run prisma:seed
\`\`\`

### 3. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to see your application.

## Admin Access

After seeding the database, you can access the admin panel at:
- **URL:** `http://localhost:3000/admin/login`
- **Email:** `admin@janechucks.com`
- **Password:** `Admin@123`

## Database Management

### View Database in Prisma Studio
\`\`\`bash
npm run prisma:studio
\`\`\`

### Create a Migration
\`\`\`bash
npm run prisma:migrate
\`\`\`

### Reset Database (WARNING: Deletes all data)
\`\`\`bash
npx prisma migrate reset
\`\`\`

## Email Configuration

To enable email functionality:
1. Sign up for a free account at [Resend](https://resend.com)
2. Get your API key from the dashboard
3. Add it to your `.env` file as `RESEND_API_KEY`
4. Verify your domain or use the test domain for development

## Payment Configuration (Paystack)

To enable payment functionality:
1. Sign up for a free account at [Paystack](https://paystack.com)
2. Get your public key from the dashboard (Settings > API Keys & Webhooks)
3. Add it to your `.env` file as `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
4. For testing, use the test public key (starts with `pk_test_`)
5. For production, use the live public key (starts with `pk_live_`)

**Test Cards for Development:**
- Success: `4084084084084081` (CVV: 408, Expiry: any future date)
- Insufficient Funds: `5060666666666666666` (CVV: 123, Expiry: any future date)

## Troubleshooting

### Prisma Client Not Generated
\`\`\`bash
npm run prisma:generate
\`\`\`

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Check that your Neon database is active
- Ensure your IP is whitelisted in Neon dashboard

### Admin Login Not Working
- Make sure you ran the seed script: `npm run prisma:seed`
- Check that the admin user exists in Prisma Studio
- Verify `JWT_SECRET` is set in your environment variables

## Production Deployment

1. Set all environment variables in your hosting platform
2. Run `npx prisma generate` during build
3. Run `npx prisma db push` to sync schema
4. Optionally run seed script for initial data
