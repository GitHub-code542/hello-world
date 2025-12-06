// User types
export interface User {
  id: string;
  email: string;
  full_name: string;
  email_verified: boolean;
  created_at: string;
  current_age?: number;
  gender?: string;
  retirement_age?: number;
  life_expectancy?: number;
  currency?: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
}

// Financial Data types
export interface FinancialData {
  id?: string;
  user_id?: string;
  category: string;
  amount: number;
  data_type: 'income' | 'expense';
  created_at?: string;
  updated_at?: string;
}

// Asset types
export interface Asset {
  id?: string;
  user_id?: string;
  asset_name: string;
  asset_type: string;
  current_value: number;
  purchase_date?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Liability types
export interface Liability {
  id?: string;
  user_id?: string;
  liability_name: string;
  liability_type: string;
  current_balance: number;
  interest_rate?: number;
  monthly_payment?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Goal types
export interface Goal {
  id?: string;
  user_id?: string;
  goal_name: string;
  target_amount: number;
  target_age: number;
  current_savings?: number;
  priority?: 'high' | 'medium' | 'low';
  status?: 'pending' | 'in_progress' | 'completed';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Timeline types
export interface TimelineEvent {
  age: number;
  event: string;
  amount: number;
  type: 'goal' | 'retirement' | 'milestone';
}

// Retirement calculation types
export interface RetirementCalculation {
  corpusNeeded: number;
  futureMonthlyExpenses: number;
  monthlySIP: number;
  yearsToRetirement: number;
}

export interface RetirementParams {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  monthlyExpenses: number;
  inflationRate?: number;
  returnRate?: number;
}
