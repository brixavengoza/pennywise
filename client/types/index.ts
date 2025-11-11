// User types
export interface User {
  id: string;
  email: string;
  name?: string | null;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Transaction types
export type TransactionType = 'INCOME' | 'EXPENSE';
export type CategoryType = 'INCOME' | 'EXPENSE';
export type GoalStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Transaction {
  id: string;
  userId?: string;
  categoryId?: string;
  amount: number | string;
  description: string | null;
  type: TransactionType;
  date: string;
  createdAt?: string;
  updatedAt?: string;
  category?: {
    id: string;
    name: string;
    type?: CategoryType;
    createdAt?: string;
    updatedAt?: string;
  };
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  month: number;
  year: number;
  spent?: number;
  remaining?: number;
  category?: Category;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  status: GoalStatus;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  name?: string;
}

// Analytics types
export interface MonthlySummary {
  month: number;
  year: number;
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
  expenseBreakdown: Record<string, number>;
  topCategories: Array<{ name: string; amount: number; percentage: number }>;
}

export interface MonthlySummaryParams {
  month?: number;
  year?: number;
}

export interface SpendingTrend {
  month: string;
  income: number;
  expenses: number;
}

export interface SpendingTrendsParams {
  months?: number;
}

export interface CategorySpending {
  name: string;
  amount: number;
}

export interface CategorySpendingParams {
  startDate?: string;
  endDate?: string;
}

// Budget types
export interface BudgetParams {
  month?: number;
  year?: number;
}

// Transaction request types
export interface TransactionsParams {
  page?: number;
  limit?: number;
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface TransactionsResponse {
  data: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Category request types
export interface CategoriesParams {
  type?: CategoryType;
}

