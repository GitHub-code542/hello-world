import { useAuthStore } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-bold text-indigo-700">IntelliWealth</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.email}</span>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-500">
          Authenticated as <span className="font-medium text-indigo-600">{user?.email}</span>
        </p>
        <p className="mt-4 text-sm text-gray-400">
          Step 3 complete — auth working. Dashboard UI coming next.
        </p>
      </main>
    </div>
  )
}
