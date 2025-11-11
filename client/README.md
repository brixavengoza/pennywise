# PennyWise Client

Frontend application built with Next.js 14, TypeScript, and Chakra UI.

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

3. Run development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **UI Library:** Chakra UI v3
- **State Management:** SWR for data fetching
- **HTTP Client:** Axios
- **Authentication:** JWT tokens with refresh logic

## Project Structure

```
client/
├── app/               # Next.js pages and routes
├── components/        # Reusable UI components
├── hooks/             # Custom React hooks
├── lib/               # API clients and utilities
├── types/             # TypeScript type definitions
└── utils/             # Helper functions
```

## Features

- Dashboard with financial overview
- Transaction management (income/expenses)
- Budget tracking by category
- Savings goals
- Analytics and charts
- Responsive design

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
