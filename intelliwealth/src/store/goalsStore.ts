import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Goal, GoalCategory } from '../types/database'

export interface GoalInput {
  name: string
  icon: string
  targetYear: number
  budgetLakhs: number
  category: GoalCategory
}

interface GoalsState {
  goals: Goal[]
  loading: boolean
  fetchAll: (userId: string) => Promise<void>
  addGoal: (userId: string, data: GoalInput) => Promise<Goal | null>
  updateGoal: (id: string, data: Partial<GoalInput>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
}

export const useGoalsStore = create<GoalsState>((set, get) => ({
  goals: [],
  loading: false,

  fetchAll: async (userId) => {
    set({ loading: true })
    try {
      const { data } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('sort_order')
        .order('target_date')
      set({ goals: (data ?? []) as Goal[] })
    } finally {
      set({ loading: false })
    }
  },

  addGoal: async (userId, data) => {
    const sortOrder = get().goals.length
    const { data: row } = await supabase
      .from('goals')
      .insert({
        user_id: userId,
        name: data.name,
        icon: data.icon,
        category: data.category,
        target_date: `${data.targetYear}-01-01`,
        target_amount: Math.round(data.budgetLakhs * 100000),
        current_amount: 0,
        priority: 'medium',
        is_completed: false,
        sort_order: sortOrder,
      } as never)
      .select('*')
      .single()
    if (row) {
      set((s) => ({ goals: [...s.goals, row as Goal] }))
      return row as Goal
    }
    return null
  },

  updateGoal: async (id, data) => {
    const update: Record<string, unknown> = {}
    if (data.name !== undefined)        update.name = data.name
    if (data.icon !== undefined)        update.icon = data.icon
    if (data.category !== undefined)    update.category = data.category
    if (data.targetYear !== undefined)  update.target_date = `${data.targetYear}-01-01`
    if (data.budgetLakhs !== undefined) update.target_amount = Math.round(data.budgetLakhs * 100000)

    const { data: row } = await supabase
      .from('goals')
      .update(update as never)
      .eq('id', id)
      .select('*')
      .single()
    if (row) set((s) => ({ goals: s.goals.map((g) => (g.id === id ? (row as Goal) : g)) }))
  },

  deleteGoal: async (id) => {
    await supabase.from('goals').delete().eq('id', id)
    set((s) => ({ goals: s.goals.filter((g) => g.id !== id) }))
  },
}))
