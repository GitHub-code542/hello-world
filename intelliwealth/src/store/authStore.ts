import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useXpStore } from './xpStore'

interface AuthState {
  session: Session | null
  user: User | null
  loading: boolean
  // actions
  initialize: () => Promise<() => void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: true,

  initialize: async () => {
    // Hydrate from existing session
    const { data } = await supabase.auth.getSession()
    const initialUser = data.session?.user ?? null
    set({ session: data.session, user: initialUser, loading: false })
    if (initialUser) useXpStore.getState().loadXP(initialUser.id)

    // Subscribe to auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null })
      if (session?.user) {
        useXpStore.getState().loadXP(session.user.id)
      } else {
        useXpStore.getState().reset()
      }
    })

    return () => listener.subscription.unsubscribe()
  },

  signUp: async (email, password, fullName) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw error
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    set({ session: null, user: null })
    useXpStore.getState().reset()
  },
}))
