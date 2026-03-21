import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import {
  INCOME_FIELDS,
  EXPENSE_FIELDS,
  EXP_ANNUAL_RISE_DEFAULT,
} from '../lib/finance'
import type { IncomeSource, Expense } from '../types/database'
import { useXpStore } from './xpStore'

// ─── State shape ──────────────────────────────────────────────

export interface FinanceState {
  incomeValues: Record<string, number>
  expenseValues: Record<string, number>
  expAnnualRise: number          // % — used by FIRE; not persisted to DB here

  incomeIds: Record<string, string | null>
  expenseIds: Record<string, string | null>

  loading: boolean
  saving: boolean
  lastSaved: Date | null
  hasFetched: boolean

  fetchAll: (userId: string) => Promise<void>
  saveAll: (userId: string) => Promise<void>
  setIncomeValue: (key: string, value: number) => void
  setExpenseValue: (key: string, value: number) => void
  setExpAnnualRise: (value: number) => void
  reset: () => void
}

// ─── Defaults ─────────────────────────────────────────────────

const defaultIncome = () => Object.fromEntries(INCOME_FIELDS.map((f) => [f.key, 0]))
const defaultExpense = () => Object.fromEntries(EXPENSE_FIELDS.map((f) => [f.key, 0]))
const defaultIds = (keys: string[]) => Object.fromEntries(keys.map((k) => [k, null as string | null]))

// ─── Store ────────────────────────────────────────────────────

export const useFinanceStore = create<FinanceState>((set, get) => ({
  incomeValues: defaultIncome(),
  expenseValues: defaultExpense(),
  expAnnualRise: EXP_ANNUAL_RISE_DEFAULT,
  incomeIds: defaultIds(INCOME_FIELDS.map((f) => f.key)),
  expenseIds: defaultIds(EXPENSE_FIELDS.map((f) => f.key)),
  loading: false,
  saving: false,
  lastSaved: null,
  hasFetched: false,

  reset: () => set({
    incomeValues: defaultIncome(),
    expenseValues: defaultExpense(),
    incomeIds: defaultIds(INCOME_FIELDS.map((f) => f.key)),
    expenseIds: defaultIds(EXPENSE_FIELDS.map((f) => f.key)),
    hasFetched: false,
    lastSaved: null,
  }),

  setIncomeValue: (key, value) =>
    set((s) => ({ incomeValues: { ...s.incomeValues, [key]: value } })),

  setExpenseValue: (key, value) =>
    set((s) => ({ expenseValues: { ...s.expenseValues, [key]: value } })),

  setExpAnnualRise: (value) => set({ expAnnualRise: value }),

  // ── fetch ──────────────────────────────────────────────────

  fetchAll: async (userId) => {
    if (get().hasFetched) return
    set({ loading: true })
    try {
      const [{ data: incomeRaw }, { data: expenseRaw }] = await Promise.all([
        supabase.from('income_sources').select('*').eq('user_id', userId),
        supabase.from('expenses').select('*').eq('user_id', userId),
      ])

      const incomeRows = (incomeRaw ?? []) as IncomeSource[]
      const expenseRows = (expenseRaw ?? []) as Expense[]

      const incomeValues = defaultIncome()
      const incomeIds = defaultIds(INCOME_FIELDS.map((f) => f.key))

      for (const row of incomeRows) {
        const field = INCOME_FIELDS.find((f) => f.dbName === row.name)
        if (field) {
          incomeValues[field.key] = Number(row.amount)
          incomeIds[field.key] = row.id
        }
      }

      const expenseValues = defaultExpense()
      const expenseIds = defaultIds(EXPENSE_FIELDS.map((f) => f.key))

      for (const row of expenseRows) {
        const field = EXPENSE_FIELDS.find((f) => f.dbName === row.name)
        if (field) {
          expenseValues[field.key] = Number(row.amount)
          expenseIds[field.key] = row.id
        }
      }

      set({ incomeValues, incomeIds, expenseValues, expenseIds, hasFetched: true })
    } finally {
      set({ loading: false })
    }
  },

  // ── save ───────────────────────────────────────────────────

  saveAll: async (userId) => {
    set({ saving: true })
    const { incomeValues, incomeIds, expenseValues, expenseIds } = get()

    try {
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
            .insert({ user_id: userId, name: field.dbName, type: field.type, amount, frequency: field.frequency, is_active: true } as never)
            .select('id')
            .single()
          if (data) newIncomeIds[field.key] = (data as { id: string }).id
        }
      }

      const newExpenseIds = { ...expenseIds }

      for (const field of EXPENSE_FIELDS) {
        const amount = expenseValues[field.key] ?? 0
        const existingId = expenseIds[field.key]

        if (existingId) {
          if (amount === 0) {
            await supabase.from('expenses').delete().eq('id', existingId)
            newExpenseIds[field.key] = null
          } else {
            await supabase.from('expenses').update({ amount } as never).eq('id', existingId)
          }
        } else if (amount > 0) {
          const { data } = await supabase
            .from('expenses')
            .insert({ user_id: userId, name: field.dbName, category: field.category, amount, frequency: field.frequency, is_recurring: true } as never)
            .select('id')
            .single()
          if (data) newExpenseIds[field.key] = (data as { id: string }).id
        }
      }

      // Grant XP if any income record was newly inserted this save
      const anyNewIncome = INCOME_FIELDS.some(
        (f) => newIncomeIds[f.key] && !incomeIds[f.key],
      )
      if (anyNewIncome) {
        useXpStore.getState().addXP(50, `income:${userId}`, 'Income Added')
      }

      set({ incomeIds: newIncomeIds, expenseIds: newExpenseIds, lastSaved: new Date() })
    } finally {
      set({ saving: false })
    }
  },
}))
