// Auto-aligned with supabase/migrations/001_initial_schema.sql

export type IncomeType = 'salary' | 'freelance' | 'rental' | 'business' | 'dividend' | 'other'
export type FrequencyType = 'monthly' | 'quarterly' | 'half_yearly' | 'yearly' | 'one_time'
export type ExpenseCategory =
  | 'housing' | 'food' | 'transport' | 'utilities' | 'healthcare'
  | 'education' | 'entertainment' | 'insurance' | 'personal_care'
  | 'clothing' | 'travel' | 'subscriptions' | 'other'
export type AssetType =
  | 'equity_stocks' | 'mutual_fund' | 'fixed_deposit' | 'ppf' | 'epf'
  | 'nps' | 'real_estate' | 'gold' | 'crypto' | 'savings_account'
  | 'bonds' | 'other'
export type LiabilityType =
  | 'home_loan' | 'car_loan' | 'personal_loan' | 'education_loan'
  | 'credit_card' | 'business_loan' | 'other'
export type GoalCategory =
  | 'retirement' | 'emergency_fund' | 'house' | 'vehicle' | 'education'
  | 'travel' | 'wedding' | 'business' | 'other'
export type GoalPriority = 'critical' | 'high' | 'medium' | 'low'
export type FireType = 'lean' | 'regular' | 'fat' | 'coast' | 'barista'

// ─── Row types ───────────────────────────────────────────────

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  currency: string
  date_of_birth: string | null
  created_at: string
  updated_at: string
}

export interface IncomeSource {
  id: string
  user_id: string
  name: string
  type: IncomeType
  amount: number
  frequency: FrequencyType
  is_active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Expense {
  id: string
  user_id: string
  name: string
  category: ExpenseCategory
  amount: number
  frequency: FrequencyType
  is_recurring: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Asset {
  id: string
  user_id: string
  name: string
  type: AssetType
  current_value: number
  purchase_value: number | null
  purchase_date: string | null
  institution: string | null
  account_number: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Liability {
  id: string
  user_id: string
  name: string
  type: LiabilityType
  principal_amount: number
  outstanding_amount: number
  interest_rate: number | null
  emi_amount: number | null
  tenure_months: number | null
  start_date: string | null
  end_date: string | null
  institution: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Goal {
  id: string
  user_id: string
  name: string
  category: GoalCategory
  priority: GoalPriority
  target_amount: number
  current_amount: number
  target_date: string | null
  is_completed: boolean
  notes: string | null
  icon: string | null
  color: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface FireSettings {
  id: string
  user_id: string
  fire_type: FireType
  current_age: number | null
  target_retirement_age: number | null
  monthly_expenses: number | null
  inflation_rate: number
  expected_return_rate: number
  safe_withdrawal_rate: number
  corpus_target_override: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

// ─── Supabase Database shape (for createClient generic) ───────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
      }
      income_sources: {
        Row: IncomeSource
        Insert: Omit<IncomeSource, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<IncomeSource, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
      }
      expenses: {
        Row: Expense
        Insert: Omit<Expense, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
      }
      assets: {
        Row: Asset
        Insert: Omit<Asset, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Asset, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
      }
      liabilities: {
        Row: Liability
        Insert: Omit<Liability, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Liability, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
      }
      goals: {
        Row: Goal
        Insert: Omit<Goal, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
      }
      fire_settings: {
        Row: FireSettings
        Insert: Omit<FireSettings, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<FireSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
      }
    }
    Enums: {
      income_type: IncomeType
      frequency_type: FrequencyType
      expense_category: ExpenseCategory
      asset_type: AssetType
      liability_type: LiabilityType
      goal_category: GoalCategory
      goal_priority: GoalPriority
      fire_type: FireType
    }
  }
}
