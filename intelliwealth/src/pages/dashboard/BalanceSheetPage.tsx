import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useBalanceStore, type NewAsset, type NewLiability } from '../../store/balanceStore'
import {
  formatLakhs,
  toLakhsStr,
  fromLakhs,
  computeNetWorth,
  ASSET_TYPE_LABELS,
  LIABILITY_TYPE_LABELS,
  ASSET_TYPES,
  LIABILITY_TYPES,
} from '../../lib/finance'
import type { Asset, Liability, AssetType, LiabilityType } from '../../types/database'
import AppShell from '../../components/layout/AppShell'
import StepProgress from '../../components/layout/StepProgress'

// ─── Presets ──────────────────────────────────────────────────

const ASSET_PRESETS = [
  { label: 'Mutual Fund', name: 'Mutual Fund',            type: 'mutual_fund'   as AssetType },
  { label: 'FD',          name: 'Fixed Deposit',          type: 'fixed_deposit' as AssetType },
  { label: 'House',       name: 'House',                  type: 'real_estate'   as AssetType },
  { label: 'PF',          name: 'Employee Provident Fund',type: 'epf'           as AssetType },
  { label: 'Gold',        name: 'Gold',                   type: 'gold'          as AssetType },
]

const LIABILITY_PRESETS = [
  { label: 'House Loan',      name: 'Home Loan',       type: 'home_loan'      as LiabilityType },
  { label: 'Personal Loan',   name: 'Personal Loan',   type: 'personal_loan'  as LiabilityType },
  { label: 'Education Loan',  name: 'Education Loan',  type: 'education_loan' as LiabilityType },
  { label: 'Car Loan',        name: 'Car Loan',        type: 'car_loan'       as LiabilityType },
]

// ─── Modal state type ─────────────────────────────────────────

type ModalState =
  | { mode: 'add-asset' }
  | { mode: 'edit-asset';      asset: Asset }
  | { mode: 'add-liability' }
  | { mode: 'edit-liability';  liability: Liability }
  | null

// ─── Page ─────────────────────────────────────────────────────

export default function BalanceSheetPage() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const { assets, liabilities, loading, fetchAll, deleteAsset, deleteLiability } = useBalanceStore()

  useEffect(() => {
    if (user) fetchAll(user.id)
  }, [user, fetchAll])

  const [modal, setModal] = useState<ModalState>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'asset' | 'liability'; id: string } | null>(null)

  const { totalAssets, totalLiabilities, netWorth } = computeNetWorth(assets, liabilities)

  const handleDelete = async (type: 'asset' | 'liability', id: string) => {
    if (type === 'asset') await deleteAsset(id)
    else await deleteLiability(id)
    setDeleteConfirm(null)
  }

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Step progress */}
        <StepProgress currentStep={2} />

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Balance Sheet</h1>
            <p className="text-gray-500 mt-1">Track your assets and liabilities with precision</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/income-expenses')}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => navigate('/goals')}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Next <span>→</span>
            </button>
          </div>
        </div>

        {/* Net Worth hero card */}
        <div className="flex justify-center mb-8">
          <div className="bg-blue-600 rounded-2xl px-16 py-8 text-white text-center shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-3">
              Net Worth
            </p>
            <p className="text-5xl font-bold tracking-tight mb-3">
              {formatLakhs(netWorth)}
            </p>
            <p className="text-sm text-blue-200">Updated just now</p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        )}

        {/* Two-column grid */}
        {!loading && (
          <div className="grid lg:grid-cols-2 gap-6">

            {/* ── Assets ───────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Column header */}
              <div className="flex items-center justify-between px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-xl">
                    💰
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Assets</h2>
                    <p className="text-xs text-gray-400">What you own</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">{formatLakhs(totalAssets)}</p>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Asset rows */}
              <div className="px-4 py-3 space-y-2">
                {assets.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No assets added yet</p>
                )}
                {assets.map((asset) => (
                  <AssetRow
                    key={asset.id}
                    asset={asset}
                    onEdit={() => setModal({ mode: 'edit-asset', asset })}
                    onDelete={() => setDeleteConfirm({ type: 'asset', id: asset.id })}
                    deleteConfirmOpen={deleteConfirm?.type === 'asset' && deleteConfirm.id === asset.id}
                    onDeleteConfirm={() => handleDelete('asset', asset.id)}
                    onDeleteCancel={() => setDeleteConfirm(null)}
                  />
                ))}
              </div>

              {/* Add button */}
              <div className="px-4 pb-4">
                <button
                  onClick={() => setModal({ mode: 'add-asset' })}
                  className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  + Add Asset
                </button>
              </div>
            </div>

            {/* ── Liabilities ──────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Column header */}
              <div className="flex items-center justify-between px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Liabilities</h2>
                    <p className="text-xs text-gray-400">What you owe</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">Total Debt</p>
                  <p className="text-2xl font-bold text-rose-500">{formatLakhs(totalLiabilities)}</p>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Liability rows */}
              <div className="px-4 py-3 space-y-2">
                {liabilities.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No liabilities added yet</p>
                )}
                {liabilities.map((liability) => (
                  <LiabilityRow
                    key={liability.id}
                    liability={liability}
                    onEdit={() => setModal({ mode: 'edit-liability', liability })}
                    onDelete={() => setDeleteConfirm({ type: 'liability', id: liability.id })}
                    deleteConfirmOpen={deleteConfirm?.type === 'liability' && deleteConfirm.id === liability.id}
                    onDeleteConfirm={() => handleDelete('liability', liability.id)}
                    onDeleteCancel={() => setDeleteConfirm(null)}
                  />
                ))}
              </div>

              {/* Add button */}
              <div className="px-4 pb-4">
                <button
                  onClick={() => setModal({ mode: 'add-liability' })}
                  className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:border-rose-400 hover:text-rose-600 transition-colors"
                >
                  + Add Liability
                </button>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <RecordModal
          state={modal}
          userId={user?.id ?? ''}
          onClose={() => setModal(null)}
        />
      )}
    </AppShell>
  )
}

// ─── AssetRow ─────────────────────────────────────────────────

function AssetRow({
  asset, onEdit, onDelete,
  deleteConfirmOpen, onDeleteConfirm, onDeleteCancel,
}: {
  asset: Asset
  onEdit: () => void
  onDelete: () => void
  deleteConfirmOpen: boolean
  onDeleteConfirm: () => void
  onDeleteCancel: () => void
}) {
  const { updateAsset } = useBalanceStore()
  const [valueL, setValueL] = useState(toLakhsStr(Number(asset.current_value)))

  useEffect(() => {
    setValueL(toLakhsStr(Number(asset.current_value)))
  }, [asset.id, asset.current_value])

  const handleBlur = () => {
    const rupees = fromLakhs(valueL)
    if (rupees >= 0) updateAsset(asset.id, { current_value: rupees })
  }

  if (deleteConfirmOpen) {
    return (
      <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-200 text-sm">
        <span className="text-red-700 font-medium">Delete "{asset.name}"?</span>
        <div className="flex gap-2">
          <button onClick={onDeleteCancel} className="px-3 py-1 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={onDeleteConfirm} className="px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700">Delete</button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 group">
      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-lg flex-shrink-0">
        {ASSET_ICONS[asset.type]}
      </div>

      <button onClick={onEdit} className="flex-1 text-left min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{asset.name}</p>
        <p className="text-xs text-gray-400">{ASSET_TYPE_LABELS[asset.type]}</p>
      </button>

      {/* Inline value edit */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-xs text-gray-400">₹</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={valueL}
          onChange={(e) => setValueL(e.target.value)}
          onBlur={handleBlur}
          className="w-20 text-center text-sm font-semibold border border-gray-200 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        />
        <span className="text-xs font-semibold text-gray-600">L</span>
      </div>

      {/* Edit / Delete — visible on hover */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50">
          <PencilIcon />
        </button>
        <button onClick={onDelete} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50">
          <TrashIcon />
        </button>
      </div>
    </div>
  )
}

// ─── LiabilityRow ─────────────────────────────────────────────

function LiabilityRow({
  liability, onEdit, onDelete,
  deleteConfirmOpen, onDeleteConfirm, onDeleteCancel,
}: {
  liability: Liability
  onEdit: () => void
  onDelete: () => void
  deleteConfirmOpen: boolean
  onDeleteConfirm: () => void
  onDeleteCancel: () => void
}) {
  const { updateLiability } = useBalanceStore()
  const [valueL, setValueL] = useState(toLakhsStr(Number(liability.outstanding_amount)))

  useEffect(() => {
    setValueL(toLakhsStr(Number(liability.outstanding_amount)))
  }, [liability.id, liability.outstanding_amount])

  const handleBlur = () => {
    const rupees = fromLakhs(valueL)
    if (rupees >= 0) updateLiability(liability.id, { outstanding_amount: rupees })
  }

  if (deleteConfirmOpen) {
    return (
      <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-200 text-sm">
        <span className="text-red-700 font-medium">Delete "{liability.name}"?</span>
        <div className="flex gap-2">
          <button onClick={onDeleteCancel} className="px-3 py-1 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={onDeleteConfirm} className="px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700">Delete</button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 group">
      <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      </div>

      <button onClick={onEdit} className="flex-1 text-left min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{liability.name}</p>
        <p className="text-xs text-gray-400">{LIABILITY_TYPE_LABELS[liability.type]}</p>
      </button>

      {/* Inline value edit */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-xs text-rose-400">₹</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={valueL}
          onChange={(e) => setValueL(e.target.value)}
          onBlur={handleBlur}
          className="w-20 text-center text-sm font-semibold text-rose-600 border border-rose-200 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent"
        />
        <span className="text-xs font-semibold text-rose-500">L</span>
      </div>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50">
          <PencilIcon />
        </button>
        <button onClick={onDelete} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50">
          <TrashIcon />
        </button>
      </div>
    </div>
  )
}

// ─── RecordModal ──────────────────────────────────────────────

function RecordModal({
  state, userId, onClose,
}: {
  state: NonNullable<ModalState>
  userId: string
  onClose: () => void
}) {
  const { addAsset, updateAsset, addLiability, updateLiability } = useBalanceStore()

  const isAsset    = state.mode === 'add-asset'    || state.mode === 'edit-asset'
  const isEdit     = state.mode === 'edit-asset'   || state.mode === 'edit-liability'
  const editAsset  = state.mode === 'edit-asset'   ? state.asset      : null
  const editLiab   = state.mode === 'edit-liability' ? state.liability : null

  const [name,   setName]   = useState(editAsset?.name ?? editLiab?.name ?? '')
  const [type,   setType]   = useState<string>(
    editAsset?.type ?? editLiab?.type ?? (isAsset ? 'mutual_fund' : 'home_loan')
  )
  const [valueL, setValueL] = useState(
    editAsset  ? toLakhsStr(Number(editAsset.current_value)) :
    editLiab   ? toLakhsStr(Number(editLiab.outstanding_amount)) : ''
  )
  const [interestRate, setInterestRate] = useState(
    editLiab?.interest_rate != null ? String(editLiab.interest_rate) : ''
  )
  const [emiL, setEmiL] = useState(
    editLiab?.emi_amount != null ? toLakhsStr(Number(editLiab.emi_amount)) : ''
  )
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Name is required'); return }
    if (!valueL || parseFloat(valueL) < 0) { setError('Enter a valid value'); return }

    setSaving(true)
    setError(null)
    try {
      const rupees = fromLakhs(valueL)
      if (isAsset) {
        const data: NewAsset = { name: name.trim(), type: type as AssetType, current_value: rupees }
        if (isEdit && editAsset) await updateAsset(editAsset.id, data)
        else await addAsset(userId, data)
      } else {
        const data: NewLiability = {
          name: name.trim(),
          type: type as LiabilityType,
          outstanding_amount: rupees,
          interest_rate: interestRate ? parseFloat(interestRate) : undefined,
          emi_amount: emiL ? fromLakhs(emiL) : undefined,
        }
        if (isEdit && editLiab) await updateLiability(editLiab.id, data)
        else await addLiability(userId, data)
      }
      onClose()
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Card */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit
              ? `Edit ${isAsset ? 'Asset' : 'Liability'}`
              : `Add ${isAsset ? 'Asset' : 'Liability'}`}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Preset chips — shown only when adding */}
        {!isEdit && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 mb-2">Quick select</p>
            <div className="flex flex-wrap gap-2">
              {(isAsset ? ASSET_PRESETS : LIABILITY_PRESETS).map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => { setName(p.name); setType(p.type) }}
                  className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isAsset ? 'e.g. HDFC Mutual Fund' : 'e.g. Home Loan – SBI'}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {(isAsset ? ASSET_TYPES : LIABILITY_TYPES).map((t) => (
                <option key={t} value={t}>
                  {isAsset ? ASSET_TYPE_LABELS[t as AssetType] : LIABILITY_TYPE_LABELS[t as LiabilityType]}
                </option>
              ))}
            </select>
          </div>

          {/* Value in Lakhs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isAsset ? 'Current Value' : 'Outstanding Amount'} (in Lakhs)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={valueL}
                onChange={(e) => setValueL(e.target.value)}
                placeholder="0.00"
                className="w-full pl-7 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">L</span>
            </div>
          </div>

          {/* Liability-only fields */}
          {!isAsset && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  placeholder="e.g. 8.5"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">EMI / month (L)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={emiL}
                    onChange={(e) => setEmiL(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-7 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">L</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {saving ? 'Saving…' : isEdit ? 'Update' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Icon helpers ─────────────────────────────────────────────

const ASSET_ICONS: Record<AssetType, string> = {
  equity_stocks:   '📈',
  mutual_fund:     '📊',
  fixed_deposit:   '🏦',
  ppf:             '🏛️',
  epf:             '🏛️',
  nps:             '🏛️',
  real_estate:     '🏠',
  gold:            '🥇',
  crypto:          '₿',
  savings_account: '💰',
  bonds:           '📜',
  other:           '💰',
}

function PencilIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}
