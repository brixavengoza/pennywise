# PennyWise

A personal finance management application for tracking income, expenses, budgets, and savings goals.

## What is PennyWise?

PennyWise helps you take control of your finances by providing an intuitive interface to:
- Track all your income and expenses
- Set monthly budgets for different categories
- Monitor your savings goals
- Visualize spending patterns and trends
- Analyze your financial health

## Purpose

Built as a learning project diving into backend development.

## Features

### Current Features
- **User Authentication** - Secure registration and login with JWT tokens
- **Transaction Management** - Add, edit, delete income and expenses
- **Category System** - Organize transactions by customizable categories
- **Budget Tracking** - Set monthly spending limits per category
- **Savings Goals** - Create and track progress toward financial goals
- **Analytics Dashboard** - Visual charts and insights on spending
- **Monthly Reports** - View income, expenses, and savings rate
- **Spending Trends** - Historical data visualization

### Planned Features (Blockchain Integration)
- Wallet connection with RainbowKit
- Multi-chain crypto portfolio tracking
- Blockchain transaction import
- Crypto exchange functionality

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Chakra UI v3
- SWR for data fetching
- Axios

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Zod validation

### Future Integration
- Wagmi - React Hooks for Ethereum
- RainbowKit - Wallet connection
- Viem - TypeScript interface for Ethereum
- Nodies - Blockchain API provider

## Project Structure

```
PennyWise/
├── client/          # Next.js frontend
├── server/          # Express backend API
└── todo.md          # Development roadmap
```

## Quick Start

### Setup

```bash
npm run setup
```
This will:
1. Install root dependencies
2. Install client dependencies
3. Install server dependencies
4. Setup environment files
5. Setup database

Then just run:
```bash
npm run dev
```

## Documentation

- [Client README](./client/README.md) - Frontend setup and details
- [Server README](./server/README.md) - Backend API documentation
- [TODO](./todo.md) - Development roadmap and tasks

## Learning Journey

This project represents a transition from frontend to full-stack development:
- Building RESTful APIs with Express
- Database design and relationships with Prisma
- Authentication and authorization patterns
- API security best practices
- State management and data fetching
- Planning for blockchain integration
- Learn Containerization using Docker and AWS Cloud Deployment (S3 and EC2)

## Notes

This is a personal learning project focused on understanding backend development, database architecture, blockchain integration planning and Cloud Architecture
