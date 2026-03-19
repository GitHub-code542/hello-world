import { useEffect, useRef, type ChangeEvent } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useFinanceStore } from '../../store/financeStore'
import {
  INCOME_FIELDS,
  EXPENSE_CATEGORIES,
  computeSummary,
  formatINR,
  formatINRFull,
} from '../../lib/finance'
import type { FrequencyType } from '../../types/database'
import AppShell from '../../components/layout/AppShell'

export default function IncomeExpensesPage() {
  const user = useAuthStore((s) => s.user)
  const {
    incomeValues, expenseValues, expenseFrequencies,
    loading, saving, lastSaved,
    fetchAll, saveAll,
    setIncomeValue, setExpenseValue, setExpenseFrequency,
  } = useFinanceStore()

  const hasFetched = useRef(false)

  useEffect(() => {
    if (user && !hasFetched.current) {
      hasFetched.current = true
      fetchAll(user.id)
    }
  }, [user, fetchAll])

  const summary = computeSummary(incomeValues, expenseValues, expenseFrequencies)
  const hasIncome = summary.totalAnnualIncome > 0

  const handleSave = () => {
    if (user) saveAll(user.id)
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* ── Page header ───────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Income & Expenses</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Track your cash flow to plan savings and investments
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastSaved && (
              <span className="text-xs text-gray-400 hidden sm:block">
                Saved {lastSaved.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Saving…
                </>
              ) : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* ── Summary cards ─────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            label="Annual Income"
            value={formatINR(summary.totalAnnualIncome)}
            full={formatINRFull(summary.totalAnnualIncome)}
            color="indigo"
          />
          <SummaryCard
            label="Annual Expenses"
            value={formatINR(summary.totalAnnualExpenses)}
            full={formatINRFull(summary.totalAnnualExpenses)}
            color="rose"
          />
          <SummaryCard
            label="Net Annual Savings"
            value={formatINR(summary.netAnnualSavings)}
            full={formatINRFull(summary.netAnnualSavings)}
            sub={summary.netAnnualSavings !== 0 ? `${formatINR(summary.monthlySurplus)}/mo` : undefined}
            color={summary.netAnnualSavings >= 0 ? 'emerald' : 'rose'}
          />
          <SummaryCard
            label="Savings Rate"
            value={hasIncome ? `${summary.savingsRate.toFixed(1)}%` : '—'}
            sub={hasIncome ? savingsRateLabel(summary.savingsRate) : 'Add income first'}
            color={savingsRateColor(summary.savingsRate, hasIncome)}
          />
        </div>

        {/* Savings progress bar */}
        {hasIncome && (
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Expenses — {formatINR(summary.totalAnnualExpenses)} ({(100 - summary.savingsRate).toFixed(1)}%)</span>
              <span>Savings — {formatINR(Math.max(0, summary.netAnnualSavings))} ({Math.max(0, summary.savingsRate).toFixed(1)}%)</span>
            </div>
            <div className="h-3 rounded-full bg-gray-100 overflow-hidden flex">
              <div
                className="h-full bg-rose-400 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, 100 - summary.savingsRate))}%` }}
              />
              <div
                className="h-full bg-emerald-400 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, summary.savingsRate))}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Two-column form ───────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Income sources */}
          <FormCard title="Income Sources" subtitle="Enter monthly amounts unless noted">
            <div className="space-y-4">
              {INCOME_FIELDS.map((field) => (
                <AmountInput
                  key={field.key}
                  label={field.label}
                  hint={field.hint}
                  badge={field.frequency === 'yearly' ? 'per year' : 'per month'}
                  value={incomeValues[field.key] ?? 0}
                  onChange={(v) => setIncomeValue(field.key, v)}
                />
              ))}

              {/* Income breakdown mini-chart */}
              {summary.totalAnnualIncome > 0 && (
                <div className="mt-2 pt-4 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-2">Breakdown</p>
                  <div className="space-y-1.5">
                    {INCOME_FIELDS.filter((f) => (incomeValues[f.key] ?? 0) > 0).map((f) => {
                      const ann = (incomeValues[f.key] ?? 0) * (f.frequency === 'yearly' ? 1 : 12)
                      const pct = (ann / summary.totalAnnualIncome) * 100
                      return (
                        <div key={f.key} className="flex items-center gap-2 text-xs">
                          <div className="w-24 shrink-0 text-gray-600 truncate">{f.label}</div>
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="w-12 text-right text-gray-500">{pct.toFixed(0)}%</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </FormCard>

          {/* Expenses */}
          <FormCard title="Monthly Expenses" subtitle="Enter the amount for each category">
            <div className="space-y-3">
              {EXPENSE_CATEGORIES.map((cat) => (
                <AmountInputWithFreq
                  key={cat.category}
                  label={cat.label}
                  hint={cat.hint}
                  value={expenseValues[cat.category] ?? 0}
                  frequency={expenseFrequencies[cat.category] ?? cat.defaultFrequency}
                  onChange={(v) => setExpenseValue(cat.category, v)}
                  onFreqChange={(f) => setExpenseFrequency(cat.category, f)}
                />
              ))}
            </div>

            {/* Expense breakdown */}
            {summary.totalAnnualExpenses > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-2">Top categories</p>
                <div className="space-y-1.5">
                  {EXPENSE_CATEGORIES
                    .filter((c) => (expenseValues[c.category] ?? 0) > 0)
                    .map((c) => {
                      const freq = expenseFrequencies[c.category] ?? c.defaultFrequency
                      const ann = (expenseValues[c.category] ?? 0) * (freq === 'monthly' ? 12 : freq === 'quarterly' ? 4 : freq === 'half_yearly' ? 2 : 1)
                      const pct = (ann / summary.totalAnnualExpenses) * 100
                      return { c, ann, pct }
                    })
                    .sort((a, b) => b.ann - a.ann)
                    .slice(0, 5)
                    .map(({ c, pct }) => (
                      <div key={c.category} className="flex items-center gap-2 text-xs">
                        <div className="w-28 shrink-0 text-gray-600 truncate">{c.label}</div>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="w-12 text-right text-gray-500">{pct.toFixed(0)}%</div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </FormCard>
        </div>

        {/* Bottom save */}
        <div className="flex justify-end pb-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>

      </div>
    </AppShell>
  )
}

// ─── Sub-components ───────────────────────────────────────────

function SummaryCard({
  label, value, full, sub, color,
}: {
  label: string
  value: string
  full?: string
  sub?: string
  color: 'indigo' | 'rose' | 'emerald' | 'amber'
}) {
  const ring: Record<string, string> = {
    indigo: 'border-indigo-100 bg-indigo-50',
    rose:   'border-rose-100   bg-rose-50',
    emerald:'border-emerald-100 bg-emerald-50',
    amber:  'border-amber-100  bg-amber-50',
  }
  const text: Record<string, string> = {
    indigo: 'text-indigo-700',
    rose:   'text-rose-700',
    emerald:'text-emerald-700',
    amber:  'text-amber-700',
  }
  return (
    <div className={`rounded-xl border p-4 shadow-sm ${ring[color]}`}>
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${text[color]}`} title={full}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function FormCard({
  title, subtitle, children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-800">{title}</h2>
      <p className="text-xs text-gray-400 mt-0.5 mb-5">{subtitle}</p>
      {children}
    </div>
  )
}

function AmountInput({
  label, hint, badge, value, onChange,
}: {
  label: string
  hint: string
  badge: string
  value: number
  onChange: (v: number) => void
}) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value)
    onChange(isNaN(v) ? 0 : v)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5">
          {badge}
        </span>
      </div>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">
          ₹
        </span>
        <input
          type="number"
          min="0"
          step="500"
          value={value === 0 ? '' : value}
          onChange={handleChange}
          placeholder="0"
          className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-300"
        />
      </div>
      <p className="text-xs text-gray-400 mt-1">{hint}</p>
    </div>
  )
}

const FREQ_OPTIONS: { value: FrequencyType; label: string }[] = [
  { value: 'monthly',     label: '/mo'  },
  { value: 'quarterly',   label: '/qtr' },
  { value: 'half_yearly', label: '/6mo' },
  { value: 'yearly',      label: '/yr'  },
]

function AmountInputWithFreq({
  label, hint, value, frequency, onChange, onFreqChange,
}: {
  label: string
  hint: string
  value: number
  frequency: FrequencyType
  onChange: (v: number) => void
  onFreqChange: (f: FrequencyType) => void
}) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value)
    onChange(isNaN(v) ? 0 : v)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">
            ₹
          </span>
          <input
            type="number"
            min="0"
            step="100"
            value={value === 0 ? '' : value}
            onChange={handleChange}
            placeholder="0"
            className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-300"
          />
        </div>
        <select
          value={frequency}
          onChange={(e) => onFreqChange(e.target.value as FrequencyType)}
          className="border border-gray-200 rounded-lg px-2 py-2 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 cursor-pointer"
        >
          {FREQ_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <p className="text-xs text-gray-400 mt-0.5">{hint}</p>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────

function savingsRateLabel(rate: number): string {
  if (rate >= 50) return 'Excellent — FIRE path'
  if (rate >= 30) return 'Good — keep it up'
  if (rate >= 20) return 'Average — can do better'
  if (rate >= 0)  return 'Low — review expenses'
  return 'Spending more than earning'
}

function savingsRateColor(rate: number, hasIncome: boolean): 'emerald' | 'amber' | 'rose' | 'indigo' {
  if (!hasIncome) return 'indigo'
  if (rate >= 30) return 'emerald'
  if (rate >= 10) return 'amber'
  return 'rose'
}
