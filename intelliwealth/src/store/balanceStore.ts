import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Asset, Liability, AssetType, LiabilityType } from '../types/database'
import { useXpStore } from './xpStore'

// ─── Input types ──────────────────────────────────────────────

export interface NewAsset {
  name: string
  type: AssetType
  current_value: number     // rupees
  institution?: string
}

export interface NewLiability {
  name: string
  type: LiabilityType
  outstanding_amount: number  // rupees
  interest_rate?: number      // % p.a.
  emi_amount?: number         // rupees/month
}

// ─── State ────────────────────────────────────────────────────

interface BalanceState {
  assets: Asset[]
  liabilities: Liability[]
  loading: boolean
  hasFetched: boolean

  fetchAll: (userId: string) => Promise<void>
  reset: () => void
  addAsset: (userId: string, data: NewAsset) => Promise<void>
  updateAsset: (id: string, data: Partial<NewAsset>) => Promise<void>
  deleteAsset: (id: string) => Promise<void>
  addLiability: (userId: string, data: NewLiability) => Promise<void>
  updateLiability: (id: string, data: Partial<NewLiability>) => Promise<void>
  deleteLiability: (id: string) => Promise<void>
}

// ─── Store ────────────────────────────────────────────────────

export const useBalanceStore = create<BalanceState>((set, get) => ({
  assets: [],
  liabilities: [],
  loading: false,
  hasFetched: false,

  reset: () => set({ assets: [], liabilities: [], hasFetched: false }),

  fetchAll: async (userId) => {
    if (get().hasFetched) return
    set({ loading: true })
    try {
      const [{ data: assetRows }, { data: liabilityRows }] = await Promise.all([
        supabase.from('assets').select('*').eq('user_id', userId).order('created_at'),
        supabase.from('liabilities').select('*').eq('user_id', userId).order('created_at'),
      ])
      set({
        assets: (assetRows ?? []) as Asset[],
        liabilities: (liabilityRows ?? []) as Liability[],
        hasFetched: true,
      })
    } finally {
      set({ loading: false })
    }
  },

  addAsset: async (userId, data) => {
    const { data: row, error } = await supabase
      .from('assets')
      .insert({
        user_id: userId,
        name: data.name,
        type: data.type,
        current_value: data.current_value,
        institution: data.institution ?? null,
      } as never)
      .select('*')
      .single()
    if (error) throw error
    if (row) {
      set((s) => ({ assets: [...s.assets, row as Asset] }))
      useXpStore.getState().addXP(100, `asset:${(row as Asset).id}`, 'Asset Added')
    }
  },

  updateAsset: async (id, data) => {
    const update: Record<string, unknown> = {}
    if (data.name !== undefined)          update.name = data.name
    if (data.type !== undefined)          update.type = data.type
    if (data.current_value !== undefined) update.current_value = data.current_value
    if (data.institution !== undefined)   update.institution = data.institution

    const { data: row } = await supabase
      .from('assets')
      .update(update as never)
      .eq('id', id)
      .select('*')
      .single()
    if (row) set((s) => ({ assets: s.assets.map((a) => (a.id === id ? (row as Asset) : a)) }))
  },

  deleteAsset: async (id) => {
    await supabase.from('assets').delete().eq('id', id)
    set((s) => ({ assets: s.assets.filter((a) => a.id !== id) }))
  },

  addLiability: async (userId, data) => {
    const { data: row, error } = await supabase
      .from('liabilities')
      .insert({
        user_id: userId,
        name: data.name,
        type: data.type,
        principal_amount: data.outstanding_amount,
        outstanding_amount: data.outstanding_amount,
        interest_rate: data.interest_rate ?? null,
        emi_amount: data.emi_amount ?? null,
      } as never)
      .select('*')
      .single()
    if (error) throw error
    if (row) {
      set((s) => ({ liabilities: [...s.liabilities, row as Liability] }))
      useXpStore.getState().addXP(100, `liability:${(row as Liability).id}`, 'Balance Sheet Updated')
    }
  },

  updateLiability: async (id, data) => {
    const update: Record<string, unknown> = {}
    if (data.name !== undefined)              update.name = data.name
    if (data.type !== undefined)              update.type = data.type
    if (data.outstanding_amount !== undefined) {
      update.outstanding_amount = data.outstanding_amount
      update.principal_amount = data.outstanding_amount
    }
    if (data.interest_rate !== undefined) update.interest_rate = data.interest_rate
    if (data.emi_amount !== undefined)    update.emi_amount = data.emi_amount

    const { data: row } = await supabase
      .from('liabilities')
      .update(update as never)
      .eq('id', id)
      .select('*')
      .single()
    if (row) set((s) => ({ liabilities: s.liabilities.map((l) => (l.id === id ? (row as Liability) : l)) }))
  },

  deleteLiability: async (id) => {
    await supabase.from('liabilities').delete().eq('id', id)
    set((s) => ({ liabilities: s.liabilities.filter((l) => l.id !== id) }))
  },
}))
