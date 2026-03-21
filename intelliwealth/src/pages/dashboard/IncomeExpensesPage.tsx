import { useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useFinanceStore } from '../../store/financeStore'
import {
  INCOME_FIELDS,
  EXPENSE_FIELDS,
  EXP_ANNUAL_RISE_MAX,
  computeSummary,
  formatINR,
  formatINRPlain,
} from '../../lib/finance'
import AppShell from '../../components/layout/AppShell'
import StepProgress from '../../components/layout/StepProgress'

// ─── Debounce helper ──────────────────────────────────────────

function useDebounce(fn: () => void, delay: number) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  return useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(fn, delay)
  }, [fn, delay])
}

// ─── Page ─────────────────────────────────────────────────────

export default function IncomeExpensesPage() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const {
    incomeValues, expenseValues, expAnnualRise,
    loading, saving, lastSaved,
    fetchAll, saveAll,
    setIncomeValue, setExpenseValue, setExpAnnualRise,
  } = useFinanceStore()

  useEffect(() => {
    if (user) fetchAll(user.id)
  }, [user, fetchAll])

  // Auto-save 1.2 s after last change
  const triggerSave = useCallback(() => {
    if (user) saveAll(user.id)
  }, [user, saveAll])

  const debouncedSave = useDebounce(triggerSave, 1200)

  const handleIncomeChange = (key: string, value: number) => {
    setIncomeValue(key, value)
    debouncedSave()
  }
  const handleExpenseChange = (key: string, value: number) => {
    setExpenseValue(key, value)
    debouncedSave()
  }
  const handleRiseChange = (value: number) => {
    setExpAnnualRise(value)
  }

  const summary = computeSummary(incomeValues, expenseValues)

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
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Step progress */}
        <StepProgress currentStep={1} />

        {/* ── Header ────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Income & Expenses</h1>
            <p className="text-gray-500 mt-1">Master your cash flow to build a solid foundation.</p>
          </div>
          <div className="flex items-center gap-3">
            {saving && (
              <span className="text-xs text-gray-400 flex items-center gap-1.5">
                <span className="w-3 h-3 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                Saving…
              </span>
            )}
            {!saving && lastSaved && (
              <span className="text-xs text-gray-400">
                Saved {lastSaved.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button
              onClick={() => navigate('/assets')}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Next <span>→</span>
            </button>
          </div>
        </div>

        {/* ── 3-column grid ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px_1fr] gap-6">

          {/* ── LEFT: Income Sources ──────────────────────── */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Income Sources</h2>
            </div>

            <div className="space-y-5">
              {INCOME_FIELDS.map((field) => (
                <SliderRow
                  key={field.key}
                  label={field.label}
                  value={incomeValues[field.key] ?? 0}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  color="blue"
                  onChange={(v) => handleIncomeChange(field.key, v)}
                  formatValue={(v) => formatINR(v)}
                />
              ))}

              {/* Exp. Annual Rise — percentage */}
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-sm text-gray-700">Exp. Annual Rise</span>
                  <span className="text-sm font-semibold text-gray-900">{expAnnualRise}%</span>
                </div>
                <RangeInput
                  value={expAnnualRise}
                  min={0}
                  max={EXP_ANNUAL_RISE_MAX}
                  step={1}
                  color="blue"
                  onChange={handleRiseChange}
                />
              </div>
            </div>
          </div>

          {/* ── CENTER: Summary ──────────────────────────── */}
          <div className="flex flex-col gap-4">

            {/* Big savings card */}
            <div className="bg-blue-600 rounded-2xl p-6 text-white text-center flex-1 flex flex-col items-center justify-center gap-4">
              {/* Lock icon */}
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-2">
                  Net Annual Savings
                </p>
                <p className="text-4xl font-bold tracking-tight">
                  {formatINR(summary.netAnnualSavings)}
                </p>
              </div>

              {/* Savings rate badge */}
              <div className="inline-flex items-center gap-2 bg-blue-500/60 rounded-full px-4 py-1.5">
                <svg className="w-3.5 h-3.5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-sm font-medium">
                  {summary.totalAnnualIncome > 0
                    ? `${summary.savingsRate.toFixed(1)}% Savings Rate`
                    : 'Add income first'}
                </span>
              </div>
            </div>

            {/* Inflow / Outflow */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                  Total Inflow
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {formatINRPlain(summary.totalAnnualIncome)}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                  Total Outflow
                </p>
                <p className="text-xl font-bold text-red-500">
                  {formatINRPlain(summary.totalAnnualExpenses)}
                </p>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Expenses ──────────────────────────── */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 17H5m0 0V9m0 8l8-8 4 4 6-6" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Expenses</h2>
            </div>

            <div className="space-y-5">
              {EXPENSE_FIELDS.map((field) => (
                <SliderRow
                  key={field.key}
                  label={field.label}
                  value={expenseValues[field.key] ?? 0}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  color="red"
                  onChange={(v) => handleExpenseChange(field.key, v)}
                  formatValue={(v) => formatINR(v)}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  )
}

// ─── SliderRow ────────────────────────────────────────────────

function SliderRow({
  label, value, min, max, step, color, onChange, formatValue,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  color: 'blue' | 'red'
  onChange: (v: number) => void
  formatValue: (v: number) => string
}) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-sm text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-gray-900">{formatValue(value)}</span>
      </div>
      <RangeInput value={value} min={min} max={max} step={step} color={color} onChange={onChange} />
    </div>
  )
}

// ─── RangeInput ───────────────────────────────────────────────

function RangeInput({
  value, min, max, step, color, onChange,
}: {
  value: number
  min: number
  max: number
  step: number
  color: 'blue' | 'red'
  onChange: (v: number) => void
}) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0
  const fillColor = color === 'blue' ? '#3b82f6' : '#ef4444'
  const thumbColor = color === 'blue' ? '#3b82f6' : '#ef4444'

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="iw-range w-full h-1 rounded-full cursor-pointer outline-none"
      style={{
        background: `linear-gradient(to right, ${fillColor} ${pct}%, #e5e7eb ${pct}%)`,
        '--thumb-color': thumbColor,
      } as React.CSSProperties}
    />
  )
}
