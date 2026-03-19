import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  addXP: (amount: number, eventKey: string, label: string) => void
  clearToast: () => void
}

// ─── Store (persisted to localStorage) ───────────────────────

export const useXpStore = create<XPState>()(
  persist(
    (set, get) => ({
      xp: 0,
      earnedEvents: [],
      toast: null,

      addXP: (amount, eventKey, label) => {
        if (get().earnedEvents.includes(eventKey)) return
        set((s) => ({
          xp: s.xp + amount,
          earnedEvents: [...s.earnedEvents, eventKey],
          toast: { amount, label, id: Date.now() },
        }))
      },

      clearToast: () => set({ toast: null }),
    }),
    { name: 'iw-xp' },
  ),
)
