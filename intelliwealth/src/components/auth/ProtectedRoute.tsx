import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

/**
 * Wraps routes that require authentication.
 * Shows a full-screen spinner while the session is initializing,
 * then redirects to /login if unauthenticated.
 */
export default function ProtectedRoute() {
  const { session, loading } = useAuthStore()

  if (loading) return <FullPageSpinner />
  if (!session) return <Navigate to="/login" replace />
  return <Outlet />
}

/**
 * Wraps auth routes (/login, /signup).
 * Redirects already-authenticated users to /dashboard.
 */
export function AuthRoute() {
  const { session, loading } = useAuthStore()

  if (loading) return <FullPageSpinner />
  if (session) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <span className="text-sm text-gray-400">Loading…</span>
      </div>
    </div>
  )
}
