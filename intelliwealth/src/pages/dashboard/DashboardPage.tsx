import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import AppShell from '../../components/layout/AppShell'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? 'there'

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Good day, {firstName} 👋
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Here's your financial snapshot. Start by filling in your income and expenses.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickLink
            to="/income-expenses"
            title="Income & Expenses"
            desc="Log your salary, business income and monthly spending"
            color="indigo"
          />
          <QuickLink
            to="/assets"
            title="Assets & Liabilities"
            desc="Track your investments, loans and net worth"
            color="emerald"
          />
          <QuickLink
            to="/goals"
            title="Goals"
            desc="Set and monitor financial milestones"
            color="amber"
          />
          <QuickLink
            to="/fire"
            title="FIRE Calculator"
            desc="Find your Financial Independence number"
            color="rose"
          />
        </div>
      </div>
    </AppShell>
  )
}

function QuickLink({
  to, title, desc, color,
}: {
  to: string
  title: string
  desc: string
  color: 'indigo' | 'emerald' | 'amber' | 'rose'
}) {
  const bg: Record<string, string> = {
    indigo:  'bg-indigo-50  border-indigo-100  hover:border-indigo-300',
    emerald: 'bg-emerald-50 border-emerald-100 hover:border-emerald-300',
    amber:   'bg-amber-50   border-amber-100   hover:border-amber-300',
    rose:    'bg-rose-50    border-rose-100    hover:border-rose-300',
  }
  const txt: Record<string, string> = {
    indigo: 'text-indigo-700', emerald: 'text-emerald-700',
    amber: 'text-amber-700',   rose: 'text-rose-700',
  }
  return (
    <Link
      to={to}
      className={`block rounded-xl border p-5 transition-all ${bg[color]}`}
    >
      <h2 className={`font-semibold text-base mb-1 ${txt[color]}`}>{title}</h2>
      <p className="text-sm text-gray-500">{desc}</p>
    </Link>
  )
}
