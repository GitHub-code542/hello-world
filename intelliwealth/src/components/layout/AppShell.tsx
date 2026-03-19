import { type ReactNode, useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import {
  useXpStore,
  getLevel,
  getLevelProgress,
  getXPToNextLevel,
  getLevelColor,
  XP_PER_LEVEL,
} from '../../store/xpStore'

const NAV_LINKS = [
  { to: '/dashboard',        label: 'Dashboard'         },
  { to: '/income-expenses',  label: 'Income & Expenses' },
  { to: '/assets',           label: 'Assets'            },
  { to: '/goals',            label: 'Goals'             },
  { to: '/fire',             label: 'FIRE'              },
]

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()

  const { xp, toast, clearToast } = useXpStore()
  const level    = getLevel(xp)
  const progress = getLevelProgress(xp)
  const xpToNext = getXPToNextLevel(xp)
  const colors   = getLevelColor(level)

  // ── Toast auto-dismiss ─────────────────────────────────────
  const [toastVisible, setToastVisible] = useState(false)

  useEffect(() => {
    if (!toast) return
    setToastVisible(true)
    const hide  = setTimeout(() => setToastVisible(false), 2200)
    const clear = setTimeout(() => clearToast(), 2600)
    return () => { clearTimeout(hide); clearTimeout(clear) }
  }, [toast?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0].toUpperCase() ?? '?'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Top nav ─────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <span className="text-base font-bold text-indigo-700 shrink-0">IntelliWealth</span>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1 flex-1 overflow-x-auto">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right cluster: XP badge + avatar + sign out */}
          <div className="flex items-center gap-3 shrink-0">

            {/* ── XP Level Badge ─────────────────────────────── */}
            <div className="group relative">
              <button
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold cursor-default
                  ring-2 transition-all ${colors.bg} ${colors.text} ${colors.ring}`}
              >
                <span>⚡</span>
                <span>Lv. {level}</span>
              </button>

              {/* Hover tooltip */}
              <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 pointer-events-none">
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="text-xs font-semibold text-gray-700">Level {level}</span>
                  <span className="text-xs text-gray-400">{xp % XP_PER_LEVEL} / {XP_PER_LEVEL} XP</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                  <div
                    className={`h-full rounded-full transition-all ${colors.bar}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400">{xpToNext} XP to Level {level + 1}</p>
                <div className="mt-2 pt-2 border-t border-gray-50 space-y-1">
                  <XPHint color="blue"   label="+50 XP"  desc="Add income" />
                  <XPHint color="green"  label="+100 XP" desc="Add asset / liability" />
                  <XPHint color="amber"  label="+150 XP" desc="Add a goal" />
                  <XPHint color="purple" label="+200 XP" desc="Run FIRE analysis" />
                </div>
              </div>
            </div>

            {/* User avatar */}
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
              {initials}
            </div>

            <button
              onClick={handleSignOut}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">{children}</main>

      {/* ── XP Toast ──────────────────────────────────────────── */}
      {toast && (
        <div
          key={toast.id}
          className={`fixed top-[72px] right-5 z-50 flex items-center gap-3 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 transition-all duration-300 ${
            toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          }`}
        >
          <div className="w-9 h-9 rounded-lg bg-yellow-50 flex items-center justify-center shrink-0">
            <span className="text-lg">⚡</span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">+{toast.amount} XP</p>
            <p className="text-xs text-gray-400">{toast.label}</p>
          </div>
          {/* Level display in toast */}
          <div className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${colors.bg} ${colors.text}`}>
            Lv. {level}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── XPHint ───────────────────────────────────────────────────

function XPHint({ color, label, desc }: { color: string; label: string; desc: string }) {
  const dot: Record<string, string> = {
    blue:   'bg-blue-400',
    green:  'bg-green-400',
    amber:  'bg-amber-400',
    purple: 'bg-purple-400',
  }
  return (
    <div className="flex items-center gap-2">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot[color]}`} />
      <span className="text-xs font-semibold text-gray-600 w-14">{label}</span>
      <span className="text-xs text-gray-400">{desc}</span>
    </div>
  )
}
