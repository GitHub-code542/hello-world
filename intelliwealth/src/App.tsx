import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import ProtectedRoute, { AuthRoute } from './components/auth/ProtectedRoute'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import DashboardPage from './pages/dashboard/DashboardPage'

export default function App() {
  const initialize = useAuthStore((s) => s.initialize)

  // Boot: hydrate session and subscribe to auth events
  useEffect(() => {
    let unsubscribe: (() => void) | undefined
    initialize().then((fn) => { unsubscribe = fn })
    return () => unsubscribe?.()
  }, [initialize])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public root — redirect based on auth state */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Auth routes — redirect to /dashboard if already signed in */}
        <Route element={<AuthRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        {/* Protected routes — redirect to /login if not signed in */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
