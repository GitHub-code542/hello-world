import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useFinanceStore } from '../../store/financeStore'
import { useBalanceStore } from '../../store/balanceStore'
import { computeSummary, computeNetWorth, formatCorpus } from '../../lib/finance'
import { calcFICorpus, calcTimeToFI, runMonteCarlo } from '../../lib/fireCalc'
import { supabase } from '../../lib/supabase'
import { useXpStore } from '../../store/xpStore'
import AppShell from '../../components/layout/AppShell'
import StepProgress from '../../components/layout/StepProgress'

// ─── Slider color map ─────────────────────────────────────────

const SLIDER_COLORS = {
  blue:   '#3b82f6',
  green:  '#22c55e',
  orange: '#f97316',
  red:    '#ef4444',
} as const

type SliderColor = keyof typeof SLIDER_COLORS

// ─── Default FIRE settings ───────────────────────────────────

const DEFAULT_ROI       = 11   // %
const DEFAULT_INFLATION = 6    // %
const DEFAULT_SWR       = 4    // %

// ─── Page ─────────────────────────────────────────────────────

export default function FIREPage() {
  const user     = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  const { incomeValues, expenseValues, fetchAll: fetchFinance } = useFinanceStore()
  const { assets, liabilities, fetchAll: fetchBalance }        = useBalanceStore()

  const hasFetched = useRef(false)
  useEffect(() => {
    if (user && !hasFetched.current) {
      hasFetched.current = true
      fetchFinance(user.id)
      fetchBalance(user.id)
    }
  }, [user, fetchFinance, fetchBalance])

  // ── Scenario inputs ────────────────────────────────────────
  const [roi,           setRoi]           = useState(DEFAULT_ROI)
  const [inflation,     setInflation]     = useState(DEFAULT_INFLATION)
  const [crashImpact,   setCrashImpact]   = useState(0)
  const [gapYears,      setGapYears]      = useState(0)
  const [incomeLoss,    setIncomeLoss]    = useState(100)
  const [medicalExp,    setMedicalExp]    = useState(1000000)   // ₹10 L
  const [otherExp,      setOtherExp]      = useState(2000000)   // ₹20 L

  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // ── Derived numbers ────────────────────────────────────────
  const summary  = computeSummary(incomeValues, expenseValues)
  const nwResult = computeNetWorth(assets, liabilities)

  const annualExpenses  = summary.totalAnnualExpenses
  const annualSavings   = summary.netAnnualSavings
  const currentCorpus   = nwResult.netWorth

  const fiCorpus = calcFICorpus(annualExpenses, DEFAULT_SWR)
  const timeToFI = calcTimeToFI(currentCorpus, annualSavings, fiCorpus, roi)

  const mcResult = useCallback(() => runMonteCarlo({
    currentCorpus,
    annualSavings,
    targetCorpus: fiCorpus,
    baseRoi: roi,
    baseInflation: inflation,
    gapYears,
    incomeLossPct: incomeLoss,
    medicalExpense: medicalExp,
    otherExpense: otherExp,
    crashImpact,
    iterations: 1000,
  }), [currentCorpus, annualSavings, fiCorpus, roi, inflation, gapYears, incomeLoss, medicalExp, otherExp, crashImpact])

  const mc = mcResult()

  // ── Save plan ──────────────────────────────────────────────
  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      await supabase.from('fire_settings').upsert({
        user_id: user.id,
        expected_return_rate: roi,
        inflation_rate: inflation,
        safe_withdrawal_rate: DEFAULT_SWR,
        fi_target_corpus: Math.round(fiCorpus),
      } as never, { onConflict: 'user_id' })
      setLastSaved(new Date())
      useXpStore.getState().addXP(200, `fire:${new Date().toDateString()}`, 'FIRE Analysis Run')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-6 py-8">

        <StepProgress currentStep={4} />

        {/* ── Header ────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">FIRE Analysis</h1>
            <p className="text-gray-500 mt-1">Stress-test your plan against real-world scenarios.</p>
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
              onClick={() => navigate('/goals')}
              className="px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Save Plan
            </button>
          </div>
        </div>

        {/* ── 3 Metric Cards ────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          {/* FI Target Corpus */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              FI TARGET CORPUS
            </p>
            <p className="text-4xl font-bold text-gray-900">
              {formatCorpus(fiCorpus)}
            </p>
            <p className="text-xs text-gray-400">
              {DEFAULT_SWR}% Safe Withdrawal Rate · Based on ₹{Math.round(annualExpenses / 12).toLocaleString('en-IN')}/mo expenses
            </p>
          </div>

          {/* Time to FI */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              TIME TO FI
            </p>
            <p className="text-4xl font-bold text-blue-600">
              {isFinite(timeToFI) ? `${timeToFI} Yrs` : '—'}
            </p>
            <p className="text-xs text-gray-400">
              At {roi}% ROI · Current corpus {formatCorpus(currentCorpus)}
            </p>
          </div>

          {/* Success Probability — dark card */}
          <div className="bg-slate-900 rounded-2xl p-6 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {/* Shield icon */}
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                SUCCESS PROBABILITY
              </p>
            </div>
            <p className={`text-4xl font-bold ${mc.successProbability >= 80 ? 'text-green-400' : mc.successProbability >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
              {mc.successProbability}%
            </p>
            <p className="text-xs text-slate-500">
              Monte Carlo · 1,000 simulations · Median {mc.medianYearsToFI} yrs
            </p>
          </div>
        </div>

        {/* ── 3 Scenario Input Cards ────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Income Shocks */}
          <ScenarioCard title="Income Shocks" icon={
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          } iconBg="bg-blue-50">
            <SliderRow
              label="Gap Years"
              value={gapYears}
              min={0} max={10} step={1}
              color="blue"
              displayValue={`${gapYears} Yrs`}
              onChange={setGapYears}
            />
            <SliderRow
              label="Income Loss during Gap"
              value={incomeLoss}
              min={0} max={100} step={5}
              color="red"
              displayValue={`${incomeLoss}%`}
              onChange={setIncomeLoss}
            />
          </ScenarioCard>

          {/* One-off Expenses */}
          <ScenarioCard title="One-off Expenses" icon={
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          } iconBg="bg-red-50">
            <SliderRow
              label="Major Medical Event"
              value={medicalExp}
              min={0} max={5000000} step={100000}
              color="red"
              displayValue={formatCorpus(medicalExp)}
              onChange={setMedicalExp}
            />
            <SliderRow
              label="Other Big Expense"
              value={otherExp}
              min={0} max={10000000} step={100000}
              color="red"
              displayValue={formatCorpus(otherExp)}
              onChange={setOtherExp}
            />
          </ScenarioCard>

          {/* Market Reality */}
          <ScenarioCard title="Market Reality" icon={
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          } iconBg="bg-green-50">
            <SliderRow
              label="Expected ROI"
              value={roi}
              min={4} max={20} step={0.5}
              color="green"
              displayValue={`${roi}%`}
              onChange={setRoi}
            />
            <SliderRow
              label="Annual Inflation"
              value={inflation}
              min={2} max={15} step={0.5}
              color="orange"
              displayValue={`${inflation}%`}
              onChange={setInflation}
            />
            <SliderRow
              label="Market Crash Impact"
              value={crashImpact}
              min={0} max={60} step={5}
              color="red"
              displayValue={`${crashImpact}%`}
              onChange={setCrashImpact}
            />
          </ScenarioCard>

        </div>

        {/* ── Monte Carlo band ──────────────────────────────── */}
        <div className="mt-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-3">Simulation Band (Years to FI)</p>
          <div className="flex items-center gap-6">
            <Stat label="Optimistic (P10)" value={`${mc.p10YearsToFI} yrs`} color="text-green-600" />
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-400 via-blue-500 to-red-400"
                style={{ width: '100%' }}
              />
            </div>
            <Stat label="Pessimistic (P90)" value={`${mc.p90YearsToFI} yrs`} color="text-red-500" />
          </div>
          <p className="text-xs text-gray-400 mt-3">
            ROI varies ±3% σ · Inflation varies ±1% σ per year across 1,000 simulations
          </p>
        </div>

      </div>
    </AppShell>
  )
}

// ─── ScenarioCard ─────────────────────────────────────────────

function ScenarioCard({
  title, icon, iconBg, children,
}: {
  title: string
  icon: React.ReactNode
  iconBg: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center`}>
          {icon}
        </div>
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="space-y-5">
        {children}
      </div>
    </div>
  )
}

// ─── SliderRow ────────────────────────────────────────────────

function SliderRow({
  label, value, min, max, step, color, displayValue, onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  color: SliderColor
  displayValue: string
  onChange: (v: number) => void
}) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0
  const fillColor = SLIDER_COLORS[color]

  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-sm text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-gray-900">{displayValue}</span>
      </div>
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
          '--thumb-color': fillColor,
        } as React.CSSProperties}
      />
    </div>
  )
}

// ─── Stat ────────────────────────────────────────────────────

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center min-w-[80px]">
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  )
}
