import { create } from 'zustand'
import { supabase } from '../lib/supabase'

// ─── Constants ────────────────────────────────────────────────

export const XP_PER_LEVEL = 500

export function getLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1
}

export function getLevelProgress(xp: number): number {
  return ((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100
}

export function getXPToNextLevel(xp: number): number {
  return XP_PER_LEVEL - (xp % XP_PER_LEVEL)
}

export function getLevelColor(level: number): { bg: string; text: string; bar: string; ring: string } {
  if (level <= 2)  return { bg: 'bg-gray-100',   text: 'text-gray-600',   bar: 'bg-gray-400',   ring: 'ring-gray-200'   }
  if (level <= 5)  return { bg: 'bg-green-100',  text: 'text-green-700',  bar: 'bg-green-500',  ring: 'ring-green-200'  }
  if (level <= 9)  return { bg: 'bg-blue-100',   text: 'text-blue-700',   bar: 'bg-blue-500',   ring: 'ring-blue-200'   }
  if (level <= 14) return { bg: 'bg-purple-100', text: 'text-purple-700', bar: 'bg-purple-500', ring: 'ring-purple-200' }
  return             { bg: 'bg-amber-100',  text: 'text-amber-700',  bar: 'bg-amber-500',  ring: 'ring-amber-200'  }
}

// ─── Types ────────────────────────────────────────────────────

export interface XPToast {
  amount: number
  label: string
  id: number
}

interface XPState {
  xp: number
  earnedEvents: string[]
  toast: XPToast | null
  loadXP: (userId: string) => Promise<void>
  addXP: (amount: number, eventKey: string, label: string) => void
  clearToast: () => void
  reset: () => void
}

// ─── Store (persisted to Supabase profiles, user-scoped) ──────

export const useXpStore = create<XPState>((set, get) => ({
  xp: 0,
  earnedEvents: [],
  toast: null,

  loadXP: async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('xp, earned_events')
      .eq('id', userId)
      .single()
    if (data) {
      set({ xp: data.xp ?? 0, earnedEvents: data.earned_events ?? [] })
    }
  },

  addXP: (amount, eventKey, label) => {
    if (get().earnedEvents.includes(eventKey)) return
    const nextXP = get().xp + amount
    const nextEvents = [...get().earnedEvents, eventKey]
    set({ xp: nextXP, earnedEvents: nextEvents, toast: { amount, label, id: Date.now() } })
    // Sync to Supabase — RLS ensures only the authenticated user's row is updated
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      supabase
        .from('profiles')
        .update({ xp: nextXP, earned_events: nextEvents })
        .eq('id', data.user.id)
    })
  },

  clearToast: () => set({ toast: null }),

  reset: () => set({ xp: 0, earnedEvents: [], toast: null }),
}))
