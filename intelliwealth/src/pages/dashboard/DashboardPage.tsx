import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuthStore } from '../../store/authStore'
import { useFinanceStore } from '../../store/financeStore'
import { useBalanceStore } from '../../store/balanceStore'
import { useGoalsStore } from '../../store/goalsStore'
import { computeSummary, computeNetWorth, formatCorpus, formatLakhs } from '../../lib/finance'
import { calcFICorpus } from '../../lib/fireCalc'
import type { AssetType } from '../../types/database'
import AppShell from '../../components/layout/AppShell'

// ─── Asset allocation grouping ────────────────────────────────

const EQUITY_TYPES: AssetType[]    = ['equity_stocks', 'mutual_fund', 'nps']
const DEBT_TYPES: AssetType[]      = ['fixed_deposit', 'ppf', 'epf', 'bonds', 'savings_account']
const REAL_ESTATE_TYPES: AssetType[] = ['real_estate']
const GOLD_TYPES: AssetType[]      = ['gold']
const OTHER_TYPES: AssetType[]     = ['crypto', 'other']

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// ─── Page ─────────────────────────────────────────────────────

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? 'there'

  const { incomeValues, expenseValues, fetchAll: fetchFinance } = useFinanceStore()
  const { assets, liabilities, fetchAll: fetchBalance }        = useBalanceStore()
  const { goals, fetchAll: fetchGoals }                        = useGoalsStore()

  const hasFetched = useRef(false)
  useEffect(() => {
    if (user && !hasFetched.current) {
      hasFetched.current = true
      fetchFinance(user.id)
      fetchBalance(user.id)
      fetchGoals(user.id)
    }
  }, [user, fetchFinance, fetchBalance, fetchGoals])

  // ── Derived numbers ────────────────────────────────────────
  const summary  = computeSummary(incomeValues, expenseValues)
  const nwResult = computeNetWorth(assets, liabilities)

  const monthlySurplus  = summary.monthlySurplus
  const activeGoals     = goals.filter((g) => !g.is_completed)
  const fiCorpus        = calcFICorpus(summary.totalAnnualExpenses, 4)
  const corpusProgress  = fiCorpus > 0
    ? Math.min(100, (nwResult.netWorth / fiCorpus) * 100)
    : 0

  // ── Allocation breakdown ───────────────────────────────────
  function sumTypes(types: AssetType[]) {
    return assets
      .filter((a) => types.includes(a.type as AssetType))
      .reduce((s, a) => s + Number(a.current_value), 0)
  }

  const equityAmt    = sumTypes(EQUITY_TYPES)
  const debtAmt      = sumTypes(DEBT_TYPES)
  const realEstAmt   = sumTypes(REAL_ESTATE_TYPES)
  const goldAmt      = sumTypes(GOLD_TYPES)
  const otherAmt     = sumTypes(OTHER_TYPES)
  const totalAssets  = nwResult.totalAssets || 1   // avoid div/0

  const alloc = [
    { label: 'Equity',       value: equityAmt,  color: '#3b82f6', pct: (equityAmt / totalAssets) * 100 },
    { label: 'Debt',         value: debtAmt,    color: '#22c55e', pct: (debtAmt / totalAssets) * 100 },
    { label: 'Real Estate',  value: realEstAmt, color: '#f97316', pct: (realEstAmt / totalAssets) * 100 },
    { label: 'Gold',         value: goldAmt,    color: '#eab308', pct: (goldAmt / totalAssets) * 100 },
    { label: 'Other',        value: otherAmt,   color: '#8b5cf6', pct: (otherAmt / totalAssets) * 100 },
  ].filter((a) => a.value > 0)

  // ── Allocation insight ─────────────────────────────────────
  const equityPct = totalAssets > 1 ? (equityAmt / totalAssets) * 100 : 0
  const realEstPct = totalAssets > 1 ? (realEstAmt / totalAssets) * 100 : 0

  function getAllocationInsight(): { text: string; type: 'good' | 'warn' | 'info' } {
    if (assets.length === 0) {
      return { text: 'Add your assets in the Balance Sheet to unlock personalised allocation insights.', type: 'info' }
    }
    if (realEstPct > 60) {
      return { text: `Real estate makes up ${realEstPct.toFixed(0)}% of your portfolio. Consider rebalancing into equity or debt instruments for better liquidity and diversification.`, type: 'warn' }
    }
    if (equityPct < 30 && totalAssets > 1) {
      return { text: `Your equity allocation is ${equityPct.toFixed(0)}% — below the recommended 50–60% for long-term wealth creation. Consider increasing SIP contributions to equity mutual funds.`, type: 'warn' }
    }
    if (equityPct >= 50 && equityPct <= 70) {
      return { text: `Solid allocation — equity at ${equityPct.toFixed(0)}% gives you good long-term growth while keeping risk balanced. Keep reviewing annually.`, type: 'good' }
    }
    if (equityPct > 70) {
      return { text: `Equity-heavy at ${equityPct.toFixed(0)}%. Your growth potential is strong, but consider adding some debt or gold as a hedge against volatility.`, type: 'info' }
    }
    return { text: 'Your portfolio looks diversified. Review your allocation annually as your goals evolve.', type: 'good' }
  }

  const insight = getAllocationInsight()

  // ── Upcoming milestones ────────────────────────────────────
  const upcomingGoals = [...activeGoals]
    .filter((g) => g.target_date !== null)
    .sort((a, b) => (a.target_date ?? '').localeCompare(b.target_date ?? ''))
    .slice(0, 5)

  const currentYear = new Date().getFullYear()

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {greeting()}, {firstName}
          </h1>
          <p className="text-gray-500 mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* ── Summary Cards ───────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          <SummaryCard
            label="Total Saved"
            value={formatCorpus(nwResult.netWorth)}
            sub={`Assets ${formatCorpus(nwResult.totalAssets)} · Debt ${formatCorpus(nwResult.totalLiabilities)}`}
            icon={
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            iconBg="bg-blue-50"
            linkTo="/assets"
          />

          <SummaryCard
            label="Monthly Contributions"
            value={formatLakhs(Math.max(0, monthlySurplus))}
            sub={monthlySurplus < 0 ? '⚠ Spending exceeds income' : `${summary.savingsRate.toFixed(1)}% savings rate`}
            subColor={monthlySurplus < 0 ? 'text-red-500' : undefined}
            icon={
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
            iconBg="bg-green-50"
            linkTo="/income-expenses"
          />

          <SummaryCard
            label="Active Goals"
            value={String(activeGoals.length)}
            sub={activeGoals.length === 0 ? 'No goals yet — add some' : `Total budget ${formatCorpus(activeGoals.reduce((s, g) => s + Number(g.target_amount), 0))}`}
            icon={
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
            }
            iconBg="bg-amber-50"
            linkTo="/goals"
          />

          {/* FIRE Progress card */}
          <div className="bg-slate-900 rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                </svg>
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">FI Progress</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white mb-1">
                {corpusProgress.toFixed(1)}%
              </p>
              <p className="text-xs text-slate-500 mb-3">
                {formatCorpus(nwResult.netWorth)} of {formatCorpus(fiCorpus)} target
              </p>
              {/* Progress bar */}
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, corpusProgress)}%` }}
                />
              </div>
            </div>
            <Link to="/fire" className="mt-3 text-xs text-slate-400 hover:text-white transition-colors">
              View FIRE analysis →
            </Link>
          </div>
        </div>

        {/* ── Main 2-column row ────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">

          {/* ── LEFT: Allocation + Insight ──────────────────── */}
          <div className="flex flex-col gap-4">

            {/* Allocation breakdown */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-gray-900">Asset Allocation</h2>
                <Link to="/assets" className="text-xs text-blue-600 hover:underline">Edit →</Link>
              </div>

              {assets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">No assets added yet.</p>
                  <Link to="/assets" className="mt-2 text-sm text-blue-600 hover:underline font-medium">Add your first asset →</Link>
                </div>
              ) : (
                <div className="flex gap-6 items-center">
                  {/* Pie chart */}
                  <div className="w-44 h-44 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={alloc}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          innerRadius={38}
                          outerRadius={68}
                          strokeWidth={2}
                          stroke="#fff"
                        >
                          {alloc.map((a) => (
                            <Cell key={a.label} fill={a.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(val) => [formatCorpus(Number(val)), 'Value']}
                          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend rows */}
                  <div className="flex-1 space-y-2.5">
                    {alloc.map((a) => (
                      <div key={a.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ background: a.color }} />
                          <span className="text-sm text-gray-700">{a.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-900">{a.pct.toFixed(1)}%</span>
                          <span className="text-xs text-gray-400 w-20 text-right">{formatCorpus(a.value)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Insight callout */}
            <div className={`rounded-2xl p-5 flex gap-4 border ${
              insight.type === 'good' ? 'bg-green-50 border-green-100' :
              insight.type === 'warn' ? 'bg-amber-50 border-amber-100' :
              'bg-blue-50 border-blue-100'
            }`}>
              <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                insight.type === 'good' ? 'bg-green-100' :
                insight.type === 'warn' ? 'bg-amber-100' :
                'bg-blue-100'
              }`}>
                {insight.type === 'good' && (
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {insight.type === 'warn' && (
                  <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
                {insight.type === 'info' && (
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
                  insight.type === 'good' ? 'text-green-700' :
                  insight.type === 'warn' ? 'text-amber-700' :
                  'text-blue-700'
                }`}>
                  {insight.type === 'good' ? 'Looking Good' : insight.type === 'warn' ? 'Allocation Alert' : 'Insight'}
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">{insight.text}</p>
              </div>
            </div>

          </div>

          {/* ── RIGHT: Upcoming milestones ───────────────────── */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900">Upcoming Milestones</h2>
              <Link to="/goals" className="text-xs text-blue-600 hover:underline">All goals →</Link>
            </div>

            {upcomingGoals.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 py-10 text-center">
                <div className="text-3xl mb-3">🎯</div>
                <p className="text-sm text-gray-500">No goals yet.</p>
                <Link to="/goals" className="mt-2 text-sm text-blue-600 hover:underline font-medium">
                  Add your first goal →
                </Link>
              </div>
            ) : (
              <div className="space-y-3 flex-1">
                {upcomingGoals.map((goal) => {
                  const targetYear = new Date(goal.target_date ?? Date.now()).getFullYear()
                  const yearsLeft = targetYear - currentYear
                  return (
                    <div key={goal.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      {/* Icon */}
                      <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-xl shrink-0">
                        {goal.icon}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{goal.name}</p>
                        <p className="text-xs text-gray-500">
                          {targetYear}
                          {yearsLeft > 0 ? ` · ${yearsLeft} yr${yearsLeft !== 1 ? 's' : ''} away` : yearsLeft === 0 ? ' · This year' : ' · Overdue'}
                        </p>
                      </div>

                      {/* Budget */}
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCorpus(Number(goal.target_amount))}
                        </p>
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                          yearsLeft <= 2
                            ? 'bg-red-100 text-red-600'
                            : yearsLeft <= 5
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {yearsLeft <= 2 ? 'Urgent' : yearsLeft <= 5 ? 'Near term' : 'Long term'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {upcomingGoals.length > 0 && (
              <Link
                to="/goals"
                className="mt-4 w-full py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors text-center block"
              >
                Manage goals
              </Link>
            )}
          </div>

        </div>

        {/* ── Quick nav strip ──────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {[
            { to: '/income-expenses', label: 'Income & Expenses', color: 'indigo' },
            { to: '/assets',          label: 'Balance Sheet',     color: 'emerald' },
            { to: '/goals',           label: 'Goals',             color: 'amber' },
            { to: '/fire',            label: 'FIRE Analysis',     color: 'rose' },
          ].map(({ to, label, color }) => (
            <Link
              key={to}
              to={to}
              className={`rounded-xl px-4 py-3 text-sm font-medium border text-center transition-all
                ${color === 'indigo'  ? 'bg-indigo-50 border-indigo-100 text-indigo-700 hover:border-indigo-300' : ''}
                ${color === 'emerald' ? 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:border-emerald-300' : ''}
                ${color === 'amber'   ? 'bg-amber-50 border-amber-100 text-amber-700 hover:border-amber-300' : ''}
                ${color === 'rose'    ? 'bg-rose-50 border-rose-100 text-rose-700 hover:border-rose-300' : ''}
              `}
            >
              {label}
            </Link>
          ))}
        </div>

      </div>
    </AppShell>
  )
}

// ─── SummaryCard ──────────────────────────────────────────────

function SummaryCard({
  label, value, sub, subColor, icon, iconBg, linkTo,
}: {
  label: string
  value: string
  sub: string
  subColor?: string
  icon: React.ReactNode
  iconBg: string
  linkTo: string
}) {
  return (
    <Link to={linkTo} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3 group">
      <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{value}</p>
        <p className={`text-xs mt-1 ${subColor ?? 'text-gray-400'}`}>{sub}</p>
      </div>
    </Link>
  )
}
