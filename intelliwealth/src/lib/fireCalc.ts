// ─── FIRE Calculation Engine ──────────────────────────────────

export interface MonteCarloParams {
  currentCorpus: number      // Current net worth (₹)
  annualSavings: number      // Annual savings / investment (₹)
  targetCorpus: number       // FI target corpus (₹)
  baseRoi: number            // Expected annual ROI (%)
  baseInflation: number      // Annual inflation (%)
  gapYears: number           // Years with no income
  incomeLossPct: number      // % income lost during gap years (0-100)
  medicalExpense: number     // One-off medical event (₹)
  otherExpense: number       // Other big one-off expense (₹)
  crashImpact: number        // Market crash impact % (0-100)
  iterations?: number        // Default 1000
}

export interface MonteCarloResult {
  successProbability: number    // 0-100
  medianYearsToFI: number
  p10YearsToFI: number
  p90YearsToFI: number
}

// ─── Box-Muller Gaussian random ──────────────────────────────

function gaussianRandom(mean: number, std: number): number {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return mean + std * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

// ─── Core formulas ────────────────────────────────────────────

/** FI Target Corpus = Annual Expenses / (SWR / 100) */
export function calcFICorpus(annualExpenses: number, swr = 4): number {
  if (swr <= 0) return 0
  return annualExpenses / (swr / 100)
}

/**
 * Years to accumulate targetCorpus starting from currentCorpus
 * with annualContribution at annualRoi (%).
 * Uses financial formula: log((FV*r + PMT) / (PV*r + PMT)) / log(1+r)
 * Falls back to linear if roi ≈ 0.
 */
export function calcTimeToFI(
  currentCorpus: number,
  annualContribution: number,
  targetCorpus: number,
  annualRoi: number,
): number {
  if (targetCorpus <= 0) return 0
  if (currentCorpus >= targetCorpus) return 0

  const r = annualRoi / 100

  if (Math.abs(r) < 0.0001) {
    // Linear case
    const gap = targetCorpus - currentCorpus
    return annualContribution > 0 ? gap / annualContribution : Infinity
  }

  const pmt = annualContribution
  const pv = currentCorpus
  const fv = targetCorpus

  // PMT contributes at end of period (ordinary annuity)
  // fv = pv*(1+r)^n + pmt*((1+r)^n - 1)/r
  // Solve for n numerically (simple iteration cap 200 yrs)
  let corpus = pv
  for (let y = 1; y <= 200; y++) {
    corpus = corpus * (1 + r) + pmt
    if (corpus >= fv) return y
  }
  return Infinity
}

// ─── Monte Carlo simulation ───────────────────────────────────

export function runMonteCarlo(params: MonteCarloParams): MonteCarloResult {
  const {
    currentCorpus,
    annualSavings,
    targetCorpus,
    baseRoi,
    baseInflation,
    gapYears,
    incomeLossPct,
    medicalExpense,
    otherExpense,
    crashImpact,
    iterations = 1000,
  } = params

  if (targetCorpus <= 0) {
    return { successProbability: 100, medianYearsToFI: 0, p10YearsToFI: 0, p90YearsToFI: 0 }
  }

  const roiStd = 3       // ±3% σ
  const inflStd = 1      // ±1% σ
  const maxYears = 60    // accumulation horizon

  const successes: number[] = []

  for (let i = 0; i < iterations; i++) {
    let corpus = currentCorpus
    // Apply one-off shocks upfront (stochastic timing: random year in first 5 yrs)
    const medYear = Math.floor(Math.random() * 5)
    const otherYear = Math.floor(Math.random() * 5)
    // Crash in a random year (0 = no crash this run if crashImpact=0)
    const crashYear = Math.floor(Math.random() * maxYears)
    // Gap starts at random point in first 20 yrs
    const gapStart = Math.floor(Math.random() * 20)

    let reachedFI = false

    for (let y = 0; y < maxYears; y++) {
      const roi = gaussianRandom(baseRoi, roiStd) / 100
      const infl = gaussianRandom(baseInflation, inflStd) / 100

      // Market crash: reduce corpus by crashImpact%
      if (y === crashYear && crashImpact > 0) {
        corpus *= (1 - crashImpact / 100)
      }

      // Annual growth
      corpus *= (1 + roi)

      // Contribution (reduced during gap years)
      const inGap = gapYears > 0 && y >= gapStart && y < gapStart + gapYears
      const contribution = inGap
        ? annualSavings * (1 - incomeLossPct / 100)
        : annualSavings

      corpus += contribution

      // One-off expenses (inflate them by avg inflation)
      if (y === medYear && medicalExpense > 0) corpus -= medicalExpense * Math.pow(1 + infl, y)
      if (y === otherYear && otherExpense > 0) corpus -= otherExpense * Math.pow(1 + infl, y)

      corpus = Math.max(corpus, 0)

      // Target also inflates with inflation
      const inflatedTarget = targetCorpus * Math.pow(1 + baseInflation / 100, y)

      if (corpus >= inflatedTarget) {
        successes.push(y + 1)
        reachedFI = true
        break
      }
    }

    if (!reachedFI) {
      successes.push(maxYears + 1) // Did not reach FI
    }
  }

  successes.sort((a, b) => a - b)

  const successCount = successes.filter((y) => y <= maxYears).length
  const successProbability = (successCount / iterations) * 100

  const median = successes[Math.floor(iterations * 0.5)]
  const p10 = successes[Math.floor(iterations * 0.1)]
  const p90 = successes[Math.floor(iterations * 0.9)]

  return {
    successProbability: Math.round(successProbability),
    medianYearsToFI: median <= maxYears ? median : maxYears,
    p10YearsToFI: p10 <= maxYears ? p10 : maxYears,
    p90YearsToFI: p90 <= maxYears ? p90 : maxYears,
  }
}
