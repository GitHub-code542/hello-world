import type { FrequencyType, IncomeType, ExpenseCategory } from '../types/database'

// ─── Frequency helpers ────────────────────────────────────────

export const ANNUAL_MULTIPLIER: Record<FrequencyType, number> = {
  monthly: 12,
  quarterly: 4,
  half_yearly: 2,
  yearly: 1,
  one_time: 1,
}

export function toAnnual(amount: number, frequency: FrequencyType): number {
  return amount * ANNUAL_MULTIPLIER[frequency]
}

// ─── Indian number formatting ─────────────────────────────────

/** Full Indian comma format: ₹2,30,000 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/** No currency symbol: 2,30,000 */
export function formatINRPlain(amount: number): string {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount)
}

// ─── Income field config ──────────────────────────────────────

export interface IncomeFieldConfig {
  key: string
  label: string
  dbName: string
  type: IncomeType
  frequency: FrequencyType
  min: number
  max: number
  step: number
}

export const INCOME_FIELDS: IncomeFieldConfig[] = [
  {
    key: 'monthly_salary',
    label: 'Monthly Salary',
    dbName: 'Monthly Salary',
    type: 'salary',
    frequency: 'monthly',
    min: 0, max: 500000, step: 5000,
  },
  {
    key: 'annual_bonus',
    label: 'Annual Bonus',
    dbName: 'Annual Bonus',
    type: 'salary',
    frequency: 'yearly',
    min: 0, max: 2000000, step: 10000,
  },
  {
    key: 'rental_income',
    label: 'Rental Income (Mo)',
    dbName: 'Rental Income',
    type: 'rental',
    frequency: 'monthly',
    min: 0, max: 200000, step: 1000,
  },
  {
    key: 'business_income',
    label: 'Business Income',
    dbName: 'Business Income',
    type: 'business',
    frequency: 'monthly',
    min: 0, max: 500000, step: 5000,
  },
  {
    key: 'investment_income',
    label: 'Investment Income',
    dbName: 'Investment Income',
    type: 'dividend',
    frequency: 'monthly',
    min: 0, max: 200000, step: 1000,
  },
  {
    key: 'other_income',
    label: 'Other Income',
    dbName: 'Other Income',
    type: 'other',
    frequency: 'monthly',
    min: 0, max: 500000, step: 5000,
  },
]

export const EXP_ANNUAL_RISE_DEFAULT = 7   // %
export const EXP_ANNUAL_RISE_MAX = 30

// ─── Expense field config (prototype-matched) ─────────────────

export interface ExpenseFieldConfig {
  key: string
  label: string
  dbName: string
  category: ExpenseCategory
  frequency: FrequencyType
  min: number
  max: number
  step: number
}

export const EXPENSE_FIELDS: ExpenseFieldConfig[] = [
  {
    key: 'house_rent',
    label: 'House Rent',
    dbName: 'House Rent',
    category: 'housing',
    frequency: 'monthly',
    min: 0, max: 200000, step: 1000,
  },
  {
    key: 'school_fees',
    label: 'School Fees',
    dbName: 'School Fees',
    category: 'education',
    frequency: 'monthly',
    min: 0, max: 100000, step: 1000,
  },
  {
    key: 'household',
    label: 'Household',
    dbName: 'Household',
    category: 'food',
    frequency: 'monthly',
    min: 0, max: 200000, step: 1000,
  },
  {
    key: 'emis',
    label: 'EMIs',
    dbName: 'EMIs',
    category: 'other',
    frequency: 'monthly',
    min: 0, max: 200000, step: 1000,
  },
  {
    key: 'vacation',
    label: 'Vacation (Yr)',
    dbName: 'Vacation',
    category: 'travel',
    frequency: 'yearly',
    min: 0, max: 1000000, step: 10000,
  },
  {
    key: 'discretionary',
    label: 'Discretionary (Yr)',
    dbName: 'Discretionary',
    category: 'entertainment',
    frequency: 'yearly',
    min: 0, max: 500000, step: 5000,
  },
  {
    key: 'life_insurance',
    label: 'Life Ins (Yr)',
    dbName: 'Life Insurance',
    category: 'insurance',
    frequency: 'yearly',
    min: 0, max: 300000, step: 1000,
  },
  {
    key: 'health_insurance',
    label: 'Health Ins (Yr)',
    dbName: 'Health Insurance',
    category: 'healthcare',
    frequency: 'yearly',
    min: 0, max: 100000, step: 500,
  },
  {
    key: 'maintenance',
    label: 'Maintenance (Yr)',
    dbName: 'Maintenance',
    category: 'other',
    frequency: 'yearly',
    min: 0, max: 200000, step: 1000,
  },
]

// ─── Summary calculations ─────────────────────────────────────

export interface IncomeSummary {
  totalAnnualIncome: number
  totalAnnualExpenses: number
  netAnnualSavings: number
  savingsRate: number
  monthlySurplus: number
}

export function computeSummary(
  incomeValues: Record<string, number>,
  expenseValues: Record<string, number>,
): IncomeSummary {
  const totalAnnualIncome = INCOME_FIELDS.reduce((sum, f) => {
    return sum + toAnnual(incomeValues[f.key] ?? 0, f.frequency)
  }, 0)

  const totalAnnualExpenses = EXPENSE_FIELDS.reduce((sum, f) => {
    return sum + toAnnual(expenseValues[f.key] ?? 0, f.frequency)
  }, 0)

  const netAnnualSavings = totalAnnualIncome - totalAnnualExpenses
  const savingsRate = totalAnnualIncome > 0
    ? (netAnnualSavings / totalAnnualIncome) * 100
    : 0

  return {
    totalAnnualIncome,
    totalAnnualExpenses,
    netAnnualSavings,
    savingsRate,
    monthlySurplus: netAnnualSavings / 12,
  }
}
