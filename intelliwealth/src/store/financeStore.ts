import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { INCOME_FIELDS, EXPENSE_CATEGORIES } from '../lib/finance'
import type { FrequencyType, IncomeSource, Expense } from '../types/database'

// ─── Shape ───────────────────────────────────────────────────

export interface FinanceState {
  // form values (keyed by INCOME_FIELDS[].key and EXPENSE_CATEGORIES[].category)
  incomeValues: Record<string, number>
  expenseValues: Record<string, number>
  expenseFrequencies: Record<string, FrequencyType>

  // DB row IDs so we can update in-place (null = not yet saved)
  incomeIds: Record<string, string | null>
  expenseIds: Record<string, string | null>

  loading: boolean
  saving: boolean
  lastSaved: Date | null

  // actions
  fetchAll: (userId: string) => Promise<void>
  saveAll: (userId: string) => Promise<void>
  setIncomeValue: (key: string, value: number) => void
  setExpenseValue: (category: string, value: number) => void
  setExpenseFrequency: (category: string, freq: FrequencyType) => void
}

// ─── Defaults ─────────────────────────────────────────────────

function defaultIncomeValues(): Record<string, number> {
  return Object.fromEntries(INCOME_FIELDS.map((f) => [f.key, 0]))
}

function defaultExpenseValues(): Record<string, number> {
  return Object.fromEntries(EXPENSE_CATEGORIES.map((c) => [c.category, 0]))
}

function defaultExpenseFrequencies(): Record<string, FrequencyType> {
  return Object.fromEntries(EXPENSE_CATEGORIES.map((c) => [c.category, c.defaultFrequency]))
}

function defaultIds(keys: string[]): Record<string, string | null> {
  return Object.fromEntries(keys.map((k) => [k, null]))
}

// ─── Store ────────────────────────────────────────────────────

export const useFinanceStore = create<FinanceState>((set, get) => ({
  incomeValues: defaultIncomeValues(),
  expenseValues: defaultExpenseValues(),
  expenseFrequencies: defaultExpenseFrequencies(),
  incomeIds: defaultIds(INCOME_FIELDS.map((f) => f.key)),
  expenseIds: defaultIds(EXPENSE_CATEGORIES.map((c) => c.category)),
  loading: false,
  saving: false,
  lastSaved: null,

  setIncomeValue: (key, value) =>
    set((s) => ({ incomeValues: { ...s.incomeValues, [key]: value } })),

  setExpenseValue: (category, value) =>
    set((s) => ({ expenseValues: { ...s.expenseValues, [category]: value } })),

  setExpenseFrequency: (category, freq) =>
    set((s) => ({ expenseFrequencies: { ...s.expenseFrequencies, [category]: freq } })),

  // ── fetch ──────────────────────────────────────────────────

  fetchAll: async (userId) => {
    set({ loading: true })
    try {
      const [{ data: incomeRaw }, { data: expenseRaw }] = await Promise.all([
        supabase.from('income_sources').select('*').eq('user_id', userId),
        supabase.from('expenses').select('*').eq('user_id', userId),
      ])
      const incomeRows = (incomeRaw ?? []) as IncomeSource[]
      const expenseRows = (expenseRaw ?? []) as Expense[]

      const incomeValues = defaultIncomeValues()
      const incomeIds = defaultIds(INCOME_FIELDS.map((f) => f.key))

      for (const row of incomeRows) {
        const field = INCOME_FIELDS.find((f) => f.dbName === row.name)
        if (field) {
          incomeValues[field.key] = Number(row.amount)
          incomeIds[field.key] = row.id
        }
      }

      const expenseValues = defaultExpenseValues()
      const expenseFrequencies = defaultExpenseFrequencies()
      const expenseIds = defaultIds(EXPENSE_CATEGORIES.map((c) => c.category))

      for (const row of expenseRows) {
        const cat = EXPENSE_CATEGORIES.find((c) => c.category === row.category)
        if (cat) {
          expenseValues[cat.category] = Number(row.amount)
          expenseFrequencies[cat.category] = row.frequency as FrequencyType
          expenseIds[cat.category] = row.id
        }
      }

      set({ incomeValues, incomeIds, expenseValues, expenseFrequencies, expenseIds })
    } finally {
      set({ loading: false })
    }
  },

  // ── save ───────────────────────────────────────────────────

  saveAll: async (userId) => {
    set({ saving: true })
    const { incomeValues, incomeIds, expenseValues, expenseFrequencies, expenseIds } = get()

    try {
      // ── Income ──────────────────────────────────────────────
      const newIncomeIds = { ...incomeIds }

      for (const field of INCOME_FIELDS) {
        const amount = incomeValues[field.key] ?? 0
        const existingId = incomeIds[field.key]

        if (existingId) {
          if (amount === 0) {
            await supabase.from('income_sources').delete().eq('id', existingId)
            newIncomeIds[field.key] = null
          } else {
            await supabase.from('income_sources').update({ amount } as never).eq('id', existingId)
          }
        } else if (amount > 0) {
          const { data } = await supabase
            .from('income_sources')
            .insert({
              user_id: userId,
              name: field.dbName,
              type: field.type,
              amount,
              frequency: field.frequency,
              is_active: true,
            } as never)
            .select('id')
            .single()
          if (data) newIncomeIds[field.key] = (data as { id: string }).id
        }
      }

      // ── Expenses ────────────────────────────────────────────
      const newExpenseIds = { ...expenseIds }

      for (const cat of EXPENSE_CATEGORIES) {
        const amount = expenseValues[cat.category] ?? 0
        const freq = expenseFrequencies[cat.category] ?? cat.defaultFrequency
        const existingId = expenseIds[cat.category]

        if (existingId) {
          if (amount === 0) {
            await supabase.from('expenses').delete().eq('id', existingId)
            newExpenseIds[cat.category] = null
          } else {
            await supabase.from('expenses').update({ amount, frequency: freq } as never).eq('id', existingId)
          }
        } else if (amount > 0) {
          const { data } = await supabase
            .from('expenses')
            .insert({
              user_id: userId,
              name: cat.label,
              category: cat.category,
              amount,
              frequency: freq,
              is_recurring: true,
            } as never)
            .select('id')
            .single()
          if (data) newExpenseIds[cat.category] = (data as { id: string }).id
        }
      }

      set({ incomeIds: newIncomeIds, expenseIds: newExpenseIds, lastSaved: new Date() })
    } finally {
      set({ saving: false })
    }
  },
}))
