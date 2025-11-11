/**
 * Generate Postman Collection from API Routes
 * 
 * This script automatically generates a Postman collection JSON file
 * with all API endpoints organized by folder/collection.
 * 
 * Usage: node scripts/generate-postman.js
 * Output: postman-collection.json (can be imported into Postman)
 */

const fs = require('fs');
const path = require('path');

// API Base URL
const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';

// Define all API endpoints with their methods, paths, and descriptions
const endpoints = [
  // Authentication Routes
  {
    folder: 'Authentication',
    name: 'Register',
    method: 'POST',
    path: '/api/auth/register',
    description: 'Register a new user account',
    body: {
      email: 'user@example.com',
      password: 'password123',
      name: 'John Doe',
    },
    auth: false,
  },
  {
    folder: 'Authentication',
    name: 'Login',
    method: 'POST',
    path: '/api/auth/login',
    description: 'Login with email and password',
    body: {
      email: 'user@example.com',
      password: 'password123',
    },
    auth: false,
  },
  {
    folder: 'Authentication',
    name: 'Refresh Token',
    method: 'POST',
    path: '/api/auth/refresh',
    description: 'Get new access token using refresh token',
    body: {
      refreshToken: 'your-refresh-token',
    },
    auth: false,
  },
  {
    folder: 'Authentication',
    name: 'Get Current User',
    method: 'GET',
    path: '/api/auth/me',
    description: 'Get current logged-in user information',
    auth: true,
  },

  // Transaction Routes
  {
    folder: 'Transactions',
    name: 'Get All Transactions',
    method: 'GET',
    path: '/api/transactions?page=1&limit=20&type=EXPENSE',
    description: 'Get all transactions with optional filters',
    auth: true,
  },
  {
    folder: 'Transactions',
    name: 'Get Transaction by ID',
    method: 'GET',
    path: '/api/transactions/:id',
    description: 'Get a single transaction by ID',
    auth: true,
  },
  {
    folder: 'Transactions',
    name: 'Create Transaction',
    method: 'POST',
    path: '/api/transactions',
    description: 'Create a new transaction',
    body: {
      categoryId: 'category-uuid',
      amount: 100.50,
      description: 'Groceries',
      type: 'EXPENSE',
      date: '2024-01-15T10:00:00Z',
    },
    auth: true,
  },
  {
    folder: 'Transactions',
    name: 'Update Transaction',
    method: 'PUT',
    path: '/api/transactions/:id',
    description: 'Update an existing transaction',
    body: {
      amount: 150.00,
      description: 'Updated description',
    },
    auth: true,
  },
  {
    folder: 'Transactions',
    name: 'Delete Transaction',
    method: 'DELETE',
    path: '/api/transactions/:id',
    description: 'Delete a transaction',
    auth: true,
  },

  // Budget Routes
  {
    folder: 'Budget',
    name: 'Get All Budgets',
    method: 'GET',
    path: '/api/budget?month=1&year=2024',
    description: 'Get all budgets with optional month/year filter',
    auth: true,
  },
  {
    folder: 'Budget',
    name: 'Get Budget by ID',
    method: 'GET',
    path: '/api/budget/:id',
    description: 'Get a single budget by ID',
    auth: true,
  },
  {
    folder: 'Budget',
    name: 'Create Budget',
    method: 'POST',
    path: '/api/budget',
    description: 'Create a new budget',
    body: {
      categoryId: 'category-uuid',
      amount: 500.00,
      month: 1,
      year: 2024,
    },
    auth: true,
  },
  {
    folder: 'Budget',
    name: 'Update Budget',
    method: 'PUT',
    path: '/api/budget/:id',
    description: 'Update an existing budget',
    body: {
      amount: 600.00,
    },
    auth: true,
  },
  {
    folder: 'Budget',
    name: 'Delete Budget',
    method: 'DELETE',
    path: '/api/budget/:id',
    description: 'Delete a budget',
    auth: true,
  },

  // Goals Routes
  {
    folder: 'Goals',
    name: 'Get All Goals',
    method: 'GET',
    path: '/api/goals?status=IN_PROGRESS',
    description: 'Get all goals with optional status filter',
    auth: true,
  },
  {
    folder: 'Goals',
    name: 'Get Goal by ID',
    method: 'GET',
    path: '/api/goals/:id',
    description: 'Get a single goal by ID',
    auth: true,
  },
  {
    folder: 'Goals',
    name: 'Create Goal',
    method: 'POST',
    path: '/api/goals',
    description: 'Create a new savings goal',
    body: {
      title: 'Save for vacation',
      description: 'Trip to Hawaii',
      targetAmount: 5000.00,
      targetDate: '2024-12-31T00:00:00Z',
    },
    auth: true,
  },
  {
    folder: 'Goals',
    name: 'Update Goal',
    method: 'PUT',
    path: '/api/goals/:id',
    description: 'Update an existing goal',
    body: {
      currentAmount: 1000.00,
      status: 'IN_PROGRESS',
    },
    auth: true,
  },
  {
    folder: 'Goals',
    name: 'Delete Goal',
    method: 'DELETE',
    path: '/api/goals/:id',
    description: 'Delete a goal',
    auth: true,
  },

  // Analytics Routes
  {
    folder: 'Analytics',
    name: 'Monthly Summary',
    method: 'GET',
    path: '/api/analytics/monthly-summary?month=1&year=2024',
    description: 'Get comprehensive monthly financial summary',
    auth: true,
  },
  {
    folder: 'Analytics',
    name: 'Spending Trends',
    method: 'GET',
    path: '/api/analytics/spending-trends?months=6',
    description: 'Get spending trends over multiple months',
    auth: true,
  },
  {
    folder: 'Analytics',
    name: 'Category Spending',
    method: 'GET',
    path: '/api/analytics/category-spending?startDate=2024-01-01&endDate=2024-12-31',
    description: 'Get total spending by category',
    auth: true,
  },

  // Profile Routes
  {
    folder: 'Profile',
    name: 'Get Profile',
    method: 'GET',
    path: '/api/profile',
    description: 'Get current user profile',
    auth: true,
  },
  {
    folder: 'Profile',
    name: 'Update Profile',
    method: 'PUT',
    path: '/api/profile',
    description: 'Update user profile',
    body: {
      name: 'John Doe',
      email: 'newemail@example.com',
    },
    auth: true,
  },
  {
    folder: 'Profile',
    name: 'Change Password',
    method: 'POST',
    path: '/api/profile/change-password',
    description: 'Change user password',
    body: {
      currentPassword: 'oldpassword123',
      newPassword: 'newpassword456',
    },
    auth: true,
  },
];

// Generate Postman collection
function generatePostmanCollection() {
  const folders = {};
  
  // Group endpoints by folder
  endpoints.forEach((endpoint) => {
    if (!folders[endpoint.folder]) {
      folders[endpoint.folder] = [];
    }
    folders[endpoint.folder].push(endpoint);
  });

  // Create Postman collection structure
  const collection = {
    info: {
      name: 'PennyWise API',
      description: 'Personal Finance Management API Collection',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    auth: {
      type: 'bearer',
      bearer: [
        {
          key: 'token',
          value: '{{accessToken}}',
          type: 'string',
        },
      ],
    },
    variable: [
      {
        key: 'baseUrl',
        value: API_BASE_URL,
        type: 'string',
      },
      {
        key: 'accessToken',
        value: '',
        type: 'string',
      },
    ],
    item: Object.keys(folders).map((folderName) => ({
      name: folderName,
      item: folders[folderName].map((endpoint) => {
        const item = {
          name: endpoint.name,
          request: {
            method: endpoint.method,
            header: [
              {
                key: 'Content-Type',
                value: 'application/json',
              },
            ],
            url: {
              raw: `{{baseUrl}}${endpoint.path}`,
              host: ['{{baseUrl}}'],
              path: endpoint.path.split('/').filter(Boolean),
            },
            description: endpoint.description,
          },
        };

        // Add authentication if required
        if (endpoint.auth) {
          item.request.auth = {
            type: 'bearer',
            bearer: [
              {
                key: 'token',
                value: '{{accessToken}}',
                type: 'string',
              },
            ],
          };
        }

        // Add request body if provided
        if (endpoint.body) {
          item.request.body = {
            mode: 'raw',
            raw: JSON.stringify(endpoint.body, null, 2),
            options: {
              raw: {
                language: 'json',
              },
            },
          };
        }

        return item;
      }),
    })),
  };

  return collection;
}

// Write collection to file
const collection = generatePostmanCollection();
const outputPath = path.join(__dirname, '..', 'postman-collection.json');

fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2));

console.log('✅ Postman collection generated successfully!');
console.log(`📁 Location: ${outputPath}`);
console.log('\n📝 Next steps:');
console.log('1. Open Postman');
console.log('2. Click Import');
console.log('3. Select the generated postman-collection.json file');
console.log('4. All endpoints will be organized in folders!');
console.log('\n💡 Tip: After logging in, copy the accessToken and set it in Postman variables');

