import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useGoalsStore } from '../../store/goalsStore'
import type { Goal, GoalCategory } from '../../types/database'
import AppShell from '../../components/layout/AppShell'
import StepProgress from '../../components/layout/StepProgress'

// ─── Constants ────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear()
const DEFAULT_AGE  = 32   // replaced by fire_settings.current_age later

// ─── Preset goals library ─────────────────────────────────────

type PresetTab = 'quick' | 'longterm' | 'family'

interface PresetGoal {
  id: string
  name: string
  icon: string
  budgetL: number
  yearsFromNow: number
  tab: PresetTab
  category: GoalCategory
}

const PRESET_GOALS: PresetGoal[] = [
  { id: 'house',      name: 'House Purchase',   icon: '🏠', budgetL: 60, yearsFromNow: 6,  tab: 'quick',    category: 'house'          },
  { id: 'travel',     name: 'Travel & Vacation', icon: '✈️', budgetL: 18, yearsFromNow: 8,  tab: 'quick',    category: 'travel'         },
  { id: 'emergency',  name: 'Emergency Fund',    icon: '🛡️', budgetL: 10, yearsFromNow: 2,  tab: 'quick',    category: 'emergency_fund' },
  { id: 'vehicle',    name: 'New Vehicle',       icon: '🚗', budgetL: 15, yearsFromNow: 4,  tab: 'quick',    category: 'vehicle'        },
  { id: 'retirement', name: 'Retirement',        icon: '🏖️', budgetL: 90, yearsFromNow: 28, tab: 'longterm', category: 'retirement'     },
  { id: 'education',  name: 'Education',         icon: '🎓', budgetL: 35, yearsFromNow: 13, tab: 'longterm', category: 'education'      },
  { id: 'business',   name: 'Business',          icon: '🏢', budgetL: 50, yearsFromNow: 10, tab: 'longterm', category: 'business'       },
  { id: 'wedding',    name: 'Wedding',           icon: '💒', budgetL: 25, yearsFromNow: 4,  tab: 'family',   category: 'wedding'        },
  { id: 'child_edu',  name: 'Child Education',   icon: '📚', budgetL: 40, yearsFromNow: 15, tab: 'family',   category: 'education'      },
  { id: 'child_wed',  name: 'Child Wedding',     icon: '👨‍👩‍👧', budgetL: 30, yearsFromNow: 22, tab: 'family',   category: 'other'          },
]

const GOAL_ICONS = ['🏠', '🎓', '🏖️', '✈️', '💒', '📚', '🏢', '🛡️', '🚗', '💰', '🎯', '⭐', '🌍', '👶', '💊', '🎸']

// ─── Helpers ──────────────────────────────────────────────────

function getTargetYear(goal: Goal): number {
  return goal.target_date ? parseInt(goal.target_date.substring(0, 4)) : CURRENT_YEAR + 5
}
function getBudgetL(goal: Goal): number {
  return goal.target_amount / 100000
}
function agePct(year: number, currentAge: number): number {
  const age = currentAge + (year - CURRENT_YEAR)
  return Math.max(3, Math.min(96, ((age - currentAge) / (100 - currentAge)) * 100))
}
function getAgeMarkers(currentAge: number): number[] {
  const markers: number[] = [currentAge]
  for (let a = Math.ceil((currentAge + 1) / 10) * 10; a <= 100; a += 10) markers.push(a)
  return markers
}

// ─── Page ─────────────────────────────────────────────────────

export default function GoalsPage() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const { goals, fetchAll, addGoal, updateGoal, deleteGoal } = useGoalsStore()

  useEffect(() => {
    if (user) fetchAll(user.id)
  }, [user, fetchAll])

  const [tab, setTab]                   = useState<PresetTab>('quick')
  const [isDragOver, setIsDragOver]     = useState(false)
  const [selectedId, setSelectedId]     = useState<string | null>(null)
  const [iconPickerOpen, setIconPickerOpen] = useState(false)

  // Editor form state
  const [editorName,   setEditorName]   = useState('')
  const [editorIcon,   setEditorIcon]   = useState('🎯')
  const [editorYear,   setEditorYear]   = useState(CURRENT_YEAR + 5)
  const [editorBudget, setEditorBudget] = useState(10)
  const [editorSaving, setEditorSaving] = useState(false)

  const selectedGoal = goals.find((g) => g.id === selectedId) ?? null

  // Sync editor form when selection changes
  useEffect(() => {
    if (selectedGoal) {
      setEditorName(selectedGoal.name)
      setEditorIcon(selectedGoal.icon ?? '🎯')
      setEditorYear(getTargetYear(selectedGoal))
      setEditorBudget(getBudgetL(selectedGoal))
    }
  }, [selectedId])  // eslint-disable-line react-hooks/exhaustive-deps

  // ── Stats ───────────────────────────────────────────────────
  const totalBudgetL = goals.reduce((s, g) => s + getBudgetL(g), 0)
  const nextMilestone = goals
    .filter((g) => getTargetYear(g) >= CURRENT_YEAR)
    .sort((a, b) => getTargetYear(a) - getTargetYear(b))[0]

  // ── Drag helpers ────────────────────────────────────────────
  const handleDragStart = (e: React.DragEvent, preset: PresetGoal) => {
    e.dataTransfer.setData('preset', JSON.stringify(preset))
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleTimelineDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    const json = e.dataTransfer.getData('preset')
    if (!json || !user) return

    const preset = JSON.parse(json) as PresetGoal
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const targetAge = Math.round(DEFAULT_AGE + pct * (100 - DEFAULT_AGE))
    const targetYear = Math.max(CURRENT_YEAR, CURRENT_YEAR + (targetAge - DEFAULT_AGE))

    const newGoal = await addGoal(user.id, {
      name: preset.name, icon: preset.icon,
      targetYear, budgetLakhs: preset.budgetL, category: preset.category,
    })
    if (newGoal) setSelectedId(newGoal.id)
  }

  const handlePresetAdd = async (preset: PresetGoal) => {
    if (!user) return
    const newGoal = await addGoal(user.id, {
      name: preset.name, icon: preset.icon,
      targetYear: CURRENT_YEAR + preset.yearsFromNow,
      budgetLakhs: preset.budgetL, category: preset.category,
    })
    if (newGoal) setSelectedId(newGoal.id)
  }

  // ── Editor actions ──────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedId) return
    setEditorSaving(true)
    await updateGoal(selectedId, {
      name: editorName, icon: editorIcon,
      targetYear: editorYear, budgetLakhs: editorBudget,
    })
    setEditorSaving(false)
  }

  const handleDelete = async () => {
    if (!selectedId) return
    await deleteGoal(selectedId)
    setSelectedId(null)
  }

  const ageMarkers = getAgeMarkers(DEFAULT_AGE)
  const filteredPresets = PRESET_GOALS.filter((p) => p.tab === tab)

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <StepProgress currentStep={3} />

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Life Milestones</h1>
            <p className="text-gray-500 mt-1">Shape your life plan with meaningful milestones.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/assets')} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Back</button>
            <button onClick={() => navigate('/fire')} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">Analysis</button>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">

          {/* ── LEFT: Goal Library ──────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Goal Library</p>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Drag & Drop Milestones</h2>

            {/* Tip */}
            <div className="bg-yellow-50 rounded-xl px-3 py-2.5 mb-4">
              <p className="text-xs text-yellow-800">
                <span className="font-bold">💡 Tip:</span> Drag goals into the timeline to place them at your desired age
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1.5 mb-4">
              {(['quick', 'longterm', 'family'] as PresetTab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    tab === t ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {t === 'quick' ? 'Quick Add' : t === 'longterm' ? 'Long Term' : 'Family'}
                </button>
              ))}
            </div>

            {/* Preset cards */}
            <div className="space-y-2">
              {filteredPresets.map((preset) => (
                <div
                  key={preset.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, preset)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 cursor-grab active:cursor-grabbing transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-lg flex-shrink-0 group-hover:bg-blue-100">
                    {preset.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{preset.name}</p>
                    <p className="text-xs text-gray-400">
                      Year {CURRENT_YEAR + preset.yearsFromNow} · ₹{preset.budgetL}L
                    </p>
                  </div>
                  <button
                    onClick={() => handlePresetAdd(preset)}
                    className="text-xs font-medium text-blue-400 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  >
                    Add
                  </button>
                  <span className="text-xs text-gray-300 group-hover:opacity-0 transition-opacity shrink-0">Drag</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Timeline + Editor ─────────────────── */}
          <div className="space-y-5">

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              <StatCard label="Total Goals"    value={String(goals.length)} />
              <StatCard label="Total Budget"   value={`₹${totalBudgetL.toFixed(0)}L`} />
              <StatCard label="Next Milestone" value={
                nextMilestone
                  ? `Year ${getTargetYear(nextMilestone)} · ${nextMilestone.name}`
                  : 'None yet'
              } />
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div
                className={`relative h-72 transition-colors ${isDragOver ? 'bg-blue-50/60' : 'bg-white'}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleTimelineDrop}
              >
                {/* Grid background */}
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <pattern id="grid" width="80" height="60" patternUnits="userSpaceOnUse">
                      <path d="M 80 0 L 0 0 0 60" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
                    </pattern>
                    <linearGradient id="wealthGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%"   stopColor="#eab308" />
                      <stop offset="60%"  stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#16a34a" />
                    </linearGradient>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  {/* Wealth curve */}
                  <path
                    d="M 30,190 C 150,170 280,130 420,110 S 680,95 820,105 S 920,130 970,160"
                    fill="none"
                    stroke="url(#wealthGrad)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Start avatar */}
                <div className="absolute text-2xl" style={{ left: '2%', top: '56%', transform: 'translateY(-50%)' }}>👤</div>
                {/* End icon */}
                <div className="absolute text-2xl" style={{ left: '96%', top: '47%', transform: 'translateY(-50%)' }}>💰</div>

                {/* Drop hint */}
                {goals.length === 0 && !isDragOver && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-sm text-gray-300 font-medium">Drag a goal here to place it on your timeline</p>
                  </div>
                )}
                {isDragOver && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-sm text-blue-400 font-semibold">Drop to place on timeline</p>
                  </div>
                )}

                {/* Goal pins */}
                {goals.map((goal) => {
                  const year = getTargetYear(goal)
                  const pct  = agePct(year, DEFAULT_AGE)
                  const isSelected = goal.id === selectedId
                  return (
                    <GoalPin
                      key={goal.id}
                      goal={goal}
                      pct={pct}
                      selected={isSelected}
                      onSelect={() => setSelectedId(isSelected ? null : goal.id)}
                      onRemove={() => { deleteGoal(goal.id); if (isSelected) setSelectedId(null) }}
                    />
                  )
                })}

                {/* Age markers */}
                <div className="absolute bottom-3 left-0 right-0">
                  {ageMarkers.map((age) => {
                    const year = CURRENT_YEAR + (age - DEFAULT_AGE)
                    const pct  = agePct(year, DEFAULT_AGE)
                    return (
                      <div
                        key={age}
                        className="absolute transform -translate-x-1/2"
                        style={{ left: `${pct}%` }}
                      >
                        <div className="w-7 h-7 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center">
                          <span className="text-[10px] font-medium text-gray-400">{age}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Goal Editor */}
            {selectedGoal && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Goal Editor</p>
                    <h3 className="text-xl font-bold text-gray-900">Edit milestone</h3>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Update details and save your milestone.</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-5">
                  {/* Goal name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Goal name</label>
                    <input
                      type="text"
                      value={editorName}
                      onChange={(e) => setEditorName(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Icon picker */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Icon</label>
                    <button
                      onClick={() => setIconPickerOpen(!iconPickerOpen)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-left text-2xl leading-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {editorIcon}
                    </button>
                    {iconPickerOpen && (
                      <div className="absolute top-full mt-1 left-0 z-20 bg-white rounded-xl border border-gray-200 shadow-lg p-2 grid grid-cols-8 gap-1">
                        {GOAL_ICONS.map((em) => (
                          <button
                            key={em}
                            onClick={() => { setEditorIcon(em); setIconPickerOpen(false) }}
                            className={`w-8 h-8 text-lg rounded hover:bg-gray-100 flex items-center justify-center ${em === editorIcon ? 'bg-blue-100 ring-2 ring-blue-400' : ''}`}
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Target Year */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Year</label>
                    <input
                      type="number"
                      min={CURRENT_YEAR}
                      max={2100}
                      value={editorYear}
                      onChange={(e) => setEditorYear(parseInt(e.target.value) || CURRENT_YEAR)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Budget in Lakhs */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Budget as of today (Lakhs)</label>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={editorBudget}
                      onChange={(e) => setEditorBudget(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSave}
                    disabled={editorSaving}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    {editorSaving ? 'Saving…' : 'Save Goal'}
                  </button>
                  <button
                    onClick={() => setSelectedId(null)}
                    className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-6 py-2.5 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 ml-auto"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </AppShell>
  )
}

// ─── GoalPin ──────────────────────────────────────────────────

function GoalPin({ goal, pct, selected, onSelect, onRemove }: {
  goal: Goal
  pct: number
  selected: boolean
  onSelect: () => void
  onRemove: () => void
}) {
  const year    = getTargetYear(goal)
  const budgetL = getBudgetL(goal).toFixed(0)

  return (
    <div
      className="absolute z-10"
      style={{ left: `${pct}%`, top: '28%', transform: 'translate(-50%, -50%)' }}
    >
      {/* Popup card — visible when selected */}
      {selected && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-lg border border-gray-200 p-3 min-w-[160px] z-20">
          {/* Remove button */}
          <button
            onClick={(e) => { e.stopPropagation(); onRemove() }}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full text-white text-xs flex items-center justify-center"
          >
            ×
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{goal.icon ?? '🎯'}</span>
            <div>
              <p className="text-sm font-bold text-gray-900 whitespace-nowrap">{goal.name}</p>
              <p className="text-xs text-gray-400">Year {year} · ₹{budgetL}L</p>
            </div>
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-200" />
        </div>
      )}

      {/* Pin icon */}
      <button
        onClick={onSelect}
        className={`
          text-2xl transition-transform hover:scale-125
          ${selected ? 'scale-125 drop-shadow-lg' : ''}
        `}
      >
        {goal.icon ?? '🎯'}
      </button>
    </div>
  )
}

// ─── StatCard ─────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
    </div>
  )
}
