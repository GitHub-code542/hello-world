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

export function formatINR(amount: number): string {
  const abs = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  if (abs >= 10_00_000) return `${sign}₹${(abs / 10_00_000).toFixed(2)} L`
  if (abs >= 1_000) return `${sign}₹${(abs / 1_000).toFixed(1)} K`
  return `${sign}₹${abs.toFixed(0)}`
}

export function formatINRFull(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

// ─── Income field config ──────────────────────────────────────

export interface IncomeFieldConfig {
  key: string
  label: string
  dbName: string          // stored as `name` in income_sources row
  type: IncomeType
  frequency: FrequencyType
  placeholder: string
  hint: string
}

export const INCOME_FIELDS: IncomeFieldConfig[] = [
  {
    key: 'monthly_salary',
    label: 'Monthly Salary',
    dbName: 'Monthly Salary',
    type: 'salary',
    frequency: 'monthly',
    placeholder: '0',
    hint: 'Take-home after TDS / EPF deductions',
  },
  {
    key: 'annual_bonus',
    label: 'Annual Bonus',
    dbName: 'Annual Bonus',
    type: 'salary',
    frequency: 'yearly',
    placeholder: '0',
    hint: 'Expected performance bonus / variable pay per year',
  },
  {
    key: 'rental_income',
    label: 'Rental Income',
    dbName: 'Rental Income',
    type: 'rental',
    frequency: 'monthly',
    placeholder: '0',
    hint: 'Monthly rent received from property',
  },
  {
    key: 'business_income',
    label: 'Business / Freelance Income',
    dbName: 'Business Income',
    type: 'business',
    frequency: 'monthly',
    placeholder: '0',
    hint: 'Monthly net earnings from business or freelancing',
  },
  {
    key: 'investment_income',
    label: 'Investment Income',
    dbName: 'Investment Income',
    type: 'dividend',
    frequency: 'monthly',
    placeholder: '0',
    hint: 'Dividends, interest, SWP from mutual funds',
  },
]

// ─── Expense category config ──────────────────────────────────

export interface ExpenseCategoryConfig {
  category: ExpenseCategory
  label: string
  hint: string
  defaultFrequency: FrequencyType
}

export const EXPENSE_CATEGORIES: ExpenseCategoryConfig[] = [
  { category: 'housing',       label: 'Housing',           hint: 'Rent, society maintenance, repairs',       defaultFrequency: 'monthly'  },
  { category: 'food',          label: 'Food & Groceries',  hint: 'Groceries, dining out, Swiggy / Zomato',   defaultFrequency: 'monthly'  },
  { category: 'transport',     label: 'Transport',         hint: 'Fuel, metro, Ola / Uber, vehicle EMI',     defaultFrequency: 'monthly'  },
  { category: 'utilities',     label: 'Utilities',         hint: 'Electricity, water, internet, mobile',     defaultFrequency: 'monthly'  },
  { category: 'healthcare',    label: 'Healthcare',        hint: 'Doctor, medicines, health check-ups',      defaultFrequency: 'monthly'  },
  { category: 'education',     label: 'Education',         hint: 'School / college fees, courses, books',    defaultFrequency: 'monthly'  },
  { category: 'entertainment', label: 'Entertainment',     hint: 'Movies, events, hobbies, gaming',          defaultFrequency: 'monthly'  },
  { category: 'insurance',     label: 'Insurance',         hint: 'Life, health, vehicle — annualise if needed', defaultFrequency: 'yearly' },
  { category: 'personal_care', label: 'Personal Care',     hint: 'Salon, gym, wellness, cosmetics',          defaultFrequency: 'monthly'  },
  { category: 'clothing',      label: 'Clothing',          hint: 'Clothes, footwear, accessories',           defaultFrequency: 'monthly'  },
  { category: 'travel',        label: 'Travel & Holidays', hint: 'Vacations, trips, hotels — enter per year', defaultFrequency: 'yearly'  },
  { category: 'subscriptions', label: 'Subscriptions',     hint: 'OTT, software, news, gym memberships',     defaultFrequency: 'monthly'  },
  { category: 'other',         label: 'Other Expenses',    hint: 'Anything not covered above',               defaultFrequency: 'monthly'  },
]

// ─── Summary calculations ─────────────────────────────────────

export interface IncomeSummary {
  totalAnnualIncome: number
  totalAnnualExpenses: number
  netAnnualSavings: number
  savingsRate: number     // 0–100
  monthlySurplus: number
}

export function computeSummary(
  incomeValues: Record<string, number>,
  expenseValues: Record<string, number>,
  expenseFrequencies: Record<string, FrequencyType>,
): IncomeSummary {
  const totalAnnualIncome = INCOME_FIELDS.reduce((sum, f) => {
    return sum + toAnnual(incomeValues[f.key] ?? 0, f.frequency)
  }, 0)

  const totalAnnualExpenses = EXPENSE_CATEGORIES.reduce((sum, c) => {
    const freq = expenseFrequencies[c.category] ?? c.defaultFrequency
    return sum + toAnnual(expenseValues[c.category] ?? 0, freq)
  }, 0)

  const netAnnualSavings = totalAnnualIncome - totalAnnualExpenses
  const savingsRate = totalAnnualIncome > 0
    ? (netAnnualSavings / totalAnnualIncome) * 100
    : 0
  const monthlySurplus = netAnnualSavings / 12

  return { totalAnnualIncome, totalAnnualExpenses, netAnnualSavings, savingsRate, monthlySurplus }
}
