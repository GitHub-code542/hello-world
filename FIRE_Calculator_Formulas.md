# IntelliWealth MVP - Complete Formula Documentation

## Table of Contents
1. [Page 1: Income & Expenses Calculations](#page-1-income--expenses-calculations)
2. [Page 2: Assets & Liabilities Calculations](#page-2-assets--liabilities-calculations)
3. [Page 4: FIRE Calculator Core Formulas](#page-4-fire-calculator-core-formulas)
4. [Page 4: Scenario Analysis Formulas](#page-4-scenario-analysis-formulas)
5. [Page 4: Stress Test Formulas](#page-4-stress-test-formulas)
6. [Data Formatting Functions](#data-formatting-functions)

---

## Page 1: Income & Expenses Calculations

### 1.1 Total Annual Income
**Formula:**
```
Total Income = (Monthly Salary × 12) + Annual Bonus + (Rental Income × 12) +
               (Business Income × 12) + (Investment Income × 12) + (Other Income × 12)
```

**Components:**
- **Monthly Take Home Salary**: Monthly salary (converted to annual by × 12)
- **Expected Annual Bonus**: Annual bonus amount
- **Rental Income**: Monthly rental income (converted to annual by × 12)
- **Business Income**: Monthly business income (converted to annual by × 12)
- **Investment Income**: Monthly investment returns (converted to annual by × 12)
- **Other Income Sources**: Monthly other income (converted to annual by × 12)

**Example:**
```
Salary: ₹2,30,000/month → ₹27,60,000/year
Bonus: ₹8,50,000/year
Rental: ₹12,000/month → ₹1,44,000/year
Business: ₹8,000/month → ₹96,000/year
Investment: ₹14,000/month → ₹1,68,000/year
Other: ₹0/month → ₹0/year

Total Income = ₹40,18,000/year
```

---

### 1.2 Total Annual Expenses
**Formula:**
```
Total Expenses = (Monthly Rent × 12) + (School Fees × 12) + (Household Expenses × 12) +
                 (Loan EMIs × 12) + Annual Vacation + Annual Discretionary +
                 Annual Life Insurance + Annual Health Insurance + Annual Maintenance
```

**Components:**
- **House Rent**: Monthly rent (converted to annual by × 12)
- **School Fees**: Monthly school fees (converted to annual by × 12)
- **Household Expenses**: Monthly household expenses (converted to annual by × 12)
- **Loan EMIs**: Monthly loan EMIs (converted to annual by × 12)
- **Vacation Budget**: Annual vacation budget
- **Discretionary Purchases**: Annual discretionary spending
- **Life Insurance**: Annual life insurance premium
- **Health Insurance**: Annual health insurance premium
- **Maintenance**: Annual maintenance costs

**Example:**
```
Rent: ₹38,000/month → ₹4,56,000/year
School: ₹13,000/month → ₹1,56,000/year
Household: ₹64,998/month → ₹7,79,976/year
EMIs: ₹24,000/month → ₹2,88,000/year
Vacation: ₹3,99,999/year
Discretionary: ₹2,00,000/year
Life Insurance: ₹26,000/year
Health Insurance: ₹4,500/year
Maintenance: ₹7,500/year

Total Expenses = ₹23,17,975/year
```

---

### 1.3 Net Annual Savings
**Formula:**
```
Net Savings = Total Income - Total Expenses
```

**Definition:** The amount available for investment/savings after all expenses.

**Example:**
```
Net Savings = ₹40,18,000 - ₹23,17,975 = ₹17,00,025/year
```

---

### 1.4 Savings Rate
**Formula:**
```
Savings Rate (%) = (Net Savings / Total Income) × 100
```

**Definition:** Percentage of income saved annually. Higher savings rate accelerates FIRE timeline.

**Example:**
```
Savings Rate = (₹17,00,025 / ₹40,18,000) × 100 = 42.3%
```

---

### 1.5 Monthly Savings
**Formula:**
```
Monthly Savings = Net Annual Savings / 12
```

**Definition:** Average monthly amount available for investment.

**Example:**
```
Monthly Savings = ₹17,00,025 / 12 = ₹1,41,669/month
```

---

## Page 2: Assets & Liabilities Calculations

### 2.1 Total Assets
**Formula:**
```
Total Assets = Sum of all asset values (Mutual Funds + FD + House + PF + Gold + Others)
```

**Definition:** Sum of current market value of all assets owned.

**Unit Conversion:**
- Input in Lakhs (L): Value × 100,000 = Rupees
- Input in Crores (Cr): Value × 10,000,000 = Rupees

**Example:**
```
Mutual Funds: ₹10 L = ₹10,00,000
FD: ₹5 L = ₹5,00,000
House: ₹1.5 Cr = ₹1,50,00,000
PF: ₹8 L = ₹8,00,000
Gold: ₹3 L = ₹3,00,000

Total Assets = ₹1,76,00,000
```

---

### 2.2 Total Liabilities
**Formula:**
```
Total Liabilities = Sum of all liability values (House Loan + Personal Loan + Education Loan + Car Loan + Others)
```

**Definition:** Sum of outstanding principal on all loans and debts.

**Example:**
```
House Loan: ₹80 L = ₹80,00,000
Car Loan: ₹5 L = ₹5,00,000

Total Liabilities = ₹85,00,000
```

---

### 2.3 Net Worth
**Formula:**
```
Net Worth = Total Assets - Total Liabilities
```

**Definition:** Current financial position; wealth available after paying off all debts.

**Example:**
```
Net Worth = ₹1,76,00,000 - ₹85,00,000 = ₹91,00,000
```

---

### 2.4 Balance Scale Tilt (Visual)
**Formula:**
```
Tilt Degree = min(15, max(-15, (Total Assets - Total Liabilities) / 1,000,000))
```

**Definition:** Visual representation of balance; positive tilt = assets heavier, negative = liabilities heavier.

**Range:** -15° to +15°

---

## Page 4: FIRE Calculator Core Formulas

### 4.1 Retirement Expense (Today)
**Formula:**
```
Retirement Expense Today = Annual Expenses × (Retirement Expense % / 100)
```

**Definition:** Expected annual expenses during retirement as a percentage of current expenses.

**Default:** 80% (expenses typically reduce in retirement - no commute, no mortgage, kids independent)

**Example:**
```
Retirement Expense = ₹23,17,975 × 0.80 = ₹18,54,380
```

---

### 4.2 FI Target (Today)
**Formula:**
```
FI Target Today = Retirement Expense Today × 25
```

**Definition:** Based on the 4% rule - you can safely withdraw 4% annually, so you need 25× your annual expenses.

**Methodology:** Trinity Study / 4% Safe Withdrawal Rate

**Example:**
```
FI Target = ₹18,54,380 × 25 = ₹4,63,59,500 (≈ ₹4.64 Cr)
```

---

### 4.3 Year-by-Year Wealth Simulation

The FIRE calculator runs a year-by-year simulation from current age to max working age (default 65) or until FIRE is achieved.

#### 4.3.1 Initial Values (Year 0)
```
Wealth₀ = Current Net Worth
Annual Savings₀ = Monthly Savings × 12
Annual Expenses₀ = Total Annual Expenses
Current Age₀ = User's current age
```

---

#### 4.3.2 Market Crash (Year 0 only)
**Formula:**
```
IF year = 0 AND Crash % > 0:
    Wealth₀ = Wealth₀ × (1 - Crash %/100)
```

**Definition:** Immediate portfolio decline in Year 1.

**Example:**
```
If Crash = 30% and Wealth = ₹91,00,000
Wealth after crash = ₹91,00,000 × 0.70 = ₹63,70,000
```

---

#### 4.3.3 Savings Multiplier Calculation

**Formula:**
```
Savings Multiplier = 1.0

// Apply job gap (loss of income)
IF year < Job Gap Years:
    Savings Multiplier × (1 - Income Loss During Gap %/100)

// Apply post-gap income reduction
IF year >= Job Gap Years AND year < (Job Gap Years + Post-Gap Duration):
    Savings Multiplier × (1 - Post-Gap Reduction %/100)

// Apply caregiving break (zero savings)
IF year < Caregiving Break Years:
    Savings Multiplier = 0

// Apply savings rate shock (first 3 years)
IF year < 3:
    Savings Multiplier × (1 - Savings Rate Shock %/100)
```

**Example:**
```
Base savings: ₹17,00,025/year

Scenario: 2-year job gap with 100% income loss
Year 0: Savings Multiplier = 0, Actual Savings = ₹0
Year 1: Savings Multiplier = 0, Actual Savings = ₹0
Year 2: Savings Multiplier = 1, Actual Savings = ₹17,00,025
```

---

#### 4.3.4 Annual Wealth Growth

**Formula:**
```
For each year:

1. Add Savings:
   Wealthₙ = Wealthₙ₋₁ + (Annual Savings × Savings Multiplier)

2. Subtract One-Time Emergency (Year 0 only):
   IF year = 0:
       Wealthₙ = Wealthₙ - One-Time Emergency Expense

3. Subtract Medical Recurring:
   IF year < Medical Duration Years:
       Wealthₙ = Wealthₙ - (Medical Monthly Cost × 12)

4. Apply Investment Returns:
   Wealthₙ = Wealthₙ × (1 + ROI %/100)

5. Grow Savings for Next Year:
   Annual Savingsₙ₊₁ = Annual Savingsₙ × (1 + Income Growth %/100)

6. Grow Expenses for Next Year:
   Annual Expensesₙ₊₁ = Annual Expensesₙ × (1 + Expense Growth %/100)
```

**Example (Year 1):**
```
Starting Wealth: ₹91,00,000
Annual Savings: ₹17,00,025
ROI: 12%
Income Growth: 7%
Expense Growth: 6%

Step 1: Add Savings
Wealth = ₹91,00,000 + ₹17,00,025 = ₹1,08,00,025

Step 2: No one-time expense (Year 1)

Step 3: No medical expenses

Step 4: Apply ROI
Wealth = ₹1,08,00,025 × 1.12 = ₹1,20,96,028

Step 5: Grow savings for next year
Next year savings = ₹17,00,025 × 1.07 = ₹18,19,027

Step 6: Grow expenses for next year
Next year expenses = ₹23,17,975 × 1.06 = ₹24,57,054
```

---

#### 4.3.5 Inflation-Adjusted FI Target

**Formula:**
```
For year n:

Retirement Expense in Year n = Retirement Expense Today × (1 + Inflation %/100)ⁿ

FI Target in Year n = Retirement Expense in Year n × 25
```

**Definition:** FI target grows with inflation; your portfolio must keep pace.

**Example:**
```
Retirement Expense Today: ₹18,54,380
Inflation: 6% per year

Year 5:
Retirement Expense₅ = ₹18,54,380 × (1.06)⁵ = ₹24,81,207
FI Target₅ = ₹24,81,207 × 25 = ₹6,20,30,175
```

---

#### 4.3.6 FIRE Achievement Test

**Formula:**
```
For each year n:

IF Wealthₙ >= FI Targetₙ:
    FIRE Achieved!
    FIRE Age = Current Age + n
    Time to FI = n years
    Net Worth at FI = Wealthₙ
    STOP simulation
```

**Example:**
```
Year 13:
Wealth₁₃ = ₹6,45,00,000
FI Target₁₃ = ₹6,20,30,175

₹6,45,00,000 >= ₹6,20,30,175 → FIRE ACHIEVED!

FIRE Age = 32 + 13 = 45 years
Time to FI = 13 years
Net Worth at FI = ₹6.45 Cr
```

---

### 4.4 FIRE Not Achieved

**Condition:**
```
IF Current Age + n > Maximum Working Age AND Wealth < FI Target:
    FIRE Not Achieved
    Display: "Not by age {Max Working Age}"
```

---

## Page 4: Scenario Analysis Formulas

### 5.1 Job Gap Impact

**Formula:**
```
Years affected: 0 to (Job Gap Years - 1)

Annual Savings during gap = Base Annual Savings × (1 - Income Loss %/100)
```

**Example:**
```
Base Savings: ₹17,00,025/year
Job Gap: 2 years
Income Loss: 100%

Year 0 Savings = ₹17,00,025 × 0 = ₹0
Year 1 Savings = ₹17,00,025 × 0 = ₹0
Year 2+ Savings = ₹17,00,025 (normal)

Impact on FIRE: Delays FIRE by approximately 2-3 years
```

---

### 5.2 Post-Gap Income Reduction

**Formula:**
```
Years affected: Job Gap Years to (Job Gap Years + Post-Gap Duration - 1)

Annual Savings = Base Annual Savings × (1 - Post-Gap Reduction %/100)
```

**Example:**
```
After 2-year gap, income reduced by 20% for 3 years

Year 2 Savings = ₹17,00,025 × 0.80 = ₹13,60,020
Year 3 Savings = ₹18,19,027 × 0.80 = ₹14,55,222 (also grows)
Year 4 Savings = ₹19,46,359 × 0.80 = ₹15,57,087
Year 5+ Savings = Normal (with growth)
```

---

### 5.3 One-Time Emergency Expense

**Formula:**
```
IF year = 0:
    Wealth₀ = Wealth₀ - One-Time Emergency
```

**Example:**
```
Emergency: ₹10,00,000
Starting Wealth: ₹91,00,000

Wealth after emergency = ₹91,00,000 - ₹10,00,000 = ₹81,00,000

Impact: Reduces starting capital, delays FIRE by 1-2 years
```

---

### 5.4 Medical Recurring Expenses

**Formula:**
```
For years 0 to (Medical Duration - 1):
    Annual Medical Cost = Medical Monthly Cost × 12
    Wealth = Wealth - Annual Medical Cost
```

**Example:**
```
Medical Cost: ₹20,000/month for 5 years
Annual Impact = ₹20,000 × 12 = ₹2,40,000/year

Total Impact over 5 years = ₹2,40,000 × 5 = ₹12,00,000
(Plus opportunity cost of not investing this amount)
```

---

### 5.5 Caregiving Break

**Formula:**
```
For years 0 to (Caregiving Years - 1):
    Savings Multiplier = 0
    Annual Savings = 0
```

**Example:**
```
Caregiving: 3 years
Lost Savings = ₹17,00,025 × 3 = ₹51,00,075

Plus opportunity cost:
If invested at 12%, the lost future value is much higher
```

---

## Page 4: Stress Test Formulas

### 6.1 Portfolio ROI (Return on Investment)

**Formula:**
```
Wealthₙ = Wealthₙ₋₁ × (1 + ROI %/100)
```

**Definition:** Annual nominal returns on your investment portfolio.

**Typical Values:**
- Conservative: 8-10% (more debt/fixed income)
- Moderate: 10-12% (balanced)
- Aggressive: 12-15% (equity-heavy)

**Example:**
```
Wealth: ₹1,00,00,000
ROI: 12%

Year 1: ₹1,00,00,000 × 1.12 = ₹1,12,00,000
Year 2: ₹1,12,00,000 × 1.12 = ₹1,25,44,000
Year 3: ₹1,25,44,000 × 1.12 = ₹1,40,49,280
```

---

### 6.2 Inflation Rate

**Formula:**
```
Retirement Expenseₙ = Retirement Expense₀ × (1 + Inflation %/100)ⁿ
```

**Definition:** Annual rate of price increase. Reduces purchasing power.

**India Typical:** 5-7%

**Example:**
```
Expense Today: ₹10,00,000
Inflation: 6%

After 10 years: ₹10,00,000 × (1.06)¹⁰ = ₹17,90,848
After 20 years: ₹10,00,000 × (1.06)²⁰ = ₹32,07,135
```

---

### 6.3 Income Growth Rate

**Formula:**
```
Annual Savingsₙ = Annual Savingsₙ₋₁ × (1 + Income Growth %/100)
```

**Definition:** Annual salary and income increases.

**Typical Values:**
- Early career: 8-12%
- Mid career: 5-8%
- Late career: 3-5%

**Example:**
```
Starting Savings: ₹17,00,025
Growth: 7%

Year 1: ₹17,00,025
Year 2: ₹18,19,027
Year 3: ₹19,46,359
Year 10: ₹33,42,286
```

---

### 6.4 Expense Growth Rate

**Formula:**
```
Annual Expensesₙ = Annual Expensesₙ₋₁ × (1 + Expense Growth %/100)
```

**Definition:** Rate at which lifestyle expenses increase.

**Note:** Should ideally be ≤ Inflation rate (lifestyle inflation control)

**Example:**
```
Starting Expenses: ₹23,17,975
Growth: 6%

Year 1: ₹23,17,975
Year 2: ₹24,57,054
Year 3: ₹26,04,477
Year 10: ₹41,47,253
```

---

### 6.5 Market Crash (Year 1)

**Formula:**
```
IF year = 0:
    Wealth₀ = Starting Net Worth × (1 - Crash %/100)
```

**Definition:** Simulates immediate portfolio decline (market downturn, recession).

**Example:**
```
Starting Wealth: ₹1,00,00,000
Crash: 40% (like 2008 financial crisis)

Wealth after crash = ₹1,00,00,000 × 0.60 = ₹60,00,000

This significantly delays FIRE unless savings rate is high
```

---

### 6.6 Savings Rate Shock (First 3 Years)

**Formula:**
```
For years 0, 1, 2:
    Savings Multiplier × (1 - Savings Rate Shock %/100)
```

**Definition:** Temporary reduction in savings ability (e.g., new expense, lifestyle change).

**Example:**
```
Normal Savings: ₹17,00,025
Shock: 50% for 3 years

Year 0: ₹17,00,025 × 0.50 = ₹8,50,013
Year 1: ₹18,19,027 × 0.50 = ₹9,09,514
Year 2: ₹19,46,359 × 0.50 = ₹9,73,180
Year 3+: Normal savings resume
```

---

### 6.7 Maximum Working Age

**Definition:** Latest age willing/able to work. If FIRE not achieved by this age, plan needs adjustment.

**Typical Values:** 60-65 years

**Impact:**
```
IF Current Age + Years Simulated > Max Working Age:
    STOP simulation
    Result = "FIRE not achieved by {Max Working Age}"
```

---

### 6.8 Retirement Expense Percentage

**Formula:**
```
Retirement Expense = Current Annual Expenses × (Retirement Expense %/100)
```

**Typical Values:**
- 60-70%: Minimal retirement (frugal lifestyle)
- 80%: Standard (most people)
- 100%+: Luxury retirement or high medical costs

**Example:**
```
Current Expenses: ₹30,00,000/year

At 60%: Retirement = ₹18,00,000/year → FI Target = ₹4.5 Cr
At 80%: Retirement = ₹24,00,000/year → FI Target = ₹6.0 Cr
At 100%: Retirement = ₹30,00,000/year → FI Target = ₹7.5 Cr
```

---

## Data Formatting Functions

### 7.1 Indian Currency Format

**Formula:**
```
IF amount >= 10,000,000:
    Display as (amount / 10,000,000) + " Cr"
ELSE IF amount >= 100,000:
    Display as (amount / 100,000) + " L"
ELSE:
    Display with comma separators (Indian style)
```

**Examples:**
```
₹150,000,000 → ₹15.00 Cr
₹5,000,000 → ₹50.00 L
₹125,000 → ₹1.25 L
₹45,000 → ₹45,000
```

---

### 7.2 Indian Number Format (Lakhs/Crores)

**Conversion:**
```
1 Lakh (L) = 1,00,000 = 100,000
1 Crore (Cr) = 1,00,00,000 = 10,000,000

1 Crore = 100 Lakhs
```

---

## Key Assumptions & Methodology

### The 4% Rule
**Origin:** Trinity Study (1998)
**Principle:** Withdraw 4% of portfolio annually (inflation-adjusted) with 95%+ success rate over 30 years

**Formula:**
```
Required Portfolio = Annual Expenses / 0.04 = Annual Expenses × 25
```

**Example:**
```
Annual Retirement Expense: ₹20,00,000
Required Portfolio = ₹20,00,000 × 25 = ₹5,00,00,000 (₹5 Cr)
```

---

### Safe Withdrawal Rate (SWR)

**4% SWR Calculation:**
```
Annual Safe Withdrawal = Portfolio Value × 0.04
```

**Example:**
```
Portfolio: ₹5 Cr
Annual Safe Withdrawal = ₹5,00,00,000 × 0.04 = ₹20,00,000/year

This should cover your expenses indefinitely (with high probability)
```

---

### Real vs Nominal Returns

**Real Return Formula:**
```
Real Return ≈ Nominal Return - Inflation

More precise:
Real Return = [(1 + Nominal Return) / (1 + Inflation)] - 1
```

**Example:**
```
Nominal ROI: 12%
Inflation: 6%

Simple: 12% - 6% = 6% real return

Precise: [(1.12) / (1.06)] - 1 = 0.0566 = 5.66% real return
```

---

## Summary of All Input Parameters

| Parameter | Default | Range | Unit | Page |
|-----------|---------|-------|------|------|
| Current Age | 32 | 18-65 | years | Page 3 |
| Current Net Worth | Calculated | 0-∞ | ₹ | Page 2 |
| Monthly Savings | Calculated | 0-∞ | ₹ | Page 1 |
| Annual Expenses | Calculated | 0-∞ | ₹ | Page 1 |
| Retirement Expense % | 80 | 40-120 | % | Page 4 |
| Portfolio ROI | 12 | 0-20 | % | Page 4 |
| Inflation | 6 | 0-12 | % | Page 4 |
| Income Growth | 7 | 0-20 | % | Page 4 |
| Expense Growth | 6 | 0-20 | % | Page 4 |
| Market Crash (Y1) | 0 | 0-60 | % | Page 4 |
| Savings Rate Shock | 0 | 0-80 | % | Page 4 |
| Max Working Age | 65 | 50-75 | years | Page 4 |
| Job Gap | 0 | 0-5 | years | Page 4 |
| Job Gap Income Loss | 100 | 0-100 | % | Page 4 |
| Post-Gap Duration | 0 | 0-5 | years | Page 4 |
| Post-Gap Income Loss | 0 | 0-50 | % | Page 4 |
| One-Time Emergency | 0 | 0-20L | ₹ | Page 4 |
| Medical Monthly | 0 | 0-1L | ₹/mo | Page 4 |
| Medical Duration | 0 | 0-10 | years | Page 4 |
| Caregiving Break | 0 | 0-5 | years | Page 4 |

---

## Example: Complete FIRE Calculation Walkthrough

### Starting Inputs:
- Current Age: 35 years
- Net Worth: ₹50,00,000
- Annual Savings: ₹20,00,000
- Annual Expenses: ₹15,00,000
- Retirement Expense %: 80%
- ROI: 12%
- Inflation: 6%
- Income Growth: 7%
- Expense Growth: 6%

### Calculations:

**Step 1: Calculate FI Target (Today)**
```
Retirement Expense = ₹15,00,000 × 0.80 = ₹12,00,000
FI Target Today = ₹12,00,000 × 25 = ₹3,00,00,000 (₹3 Cr)
```

**Step 2: Year-by-Year Simulation**

**Year 0 (Age 35):**
```
Wealth = ₹50,00,000 + ₹20,00,000 = ₹70,00,000
Wealth after ROI = ₹70,00,000 × 1.12 = ₹78,40,000
FI Target (Year 0) = ₹12,00,000 × (1.06)⁰ × 25 = ₹3,00,00,000
Check: ₹78,40,000 < ₹3,00,00,000 → Continue
```

**Year 1 (Age 36):**
```
Annual Savings = ₹20,00,000 × 1.07 = ₹21,40,000
Wealth = ₹78,40,000 + ₹21,40,000 = ₹99,80,000
Wealth after ROI = ₹99,80,000 × 1.12 = ₹1,11,77,600
FI Target (Year 1) = ₹12,00,000 × (1.06)¹ × 25 = ₹3,18,00,000
Check: ₹1,11,77,600 < ₹3,18,00,000 → Continue
```

**Year 2 (Age 37):**
```
Annual Savings = ₹21,40,000 × 1.07 = ₹22,89,800
Wealth = ₹1,11,77,600 + ₹22,89,800 = ₹1,34,67,400
Wealth after ROI = ₹1,34,67,400 × 1.12 = ₹1,50,83,488
FI Target (Year 2) = ₹12,00,000 × (1.06)² × 25 = ₹3,37,08,000
Check: ₹1,50,83,488 < ₹3,37,08,000 → Continue
```

*...continue until FIRE achieved...*

**Year 10 (Age 45):**
```
Cumulative wealth with compounding ≈ ₹4,10,00,000
FI Target (Year 10) = ₹12,00,000 × (1.06)¹⁰ × 25 = ₹5,37,28,138
Check: ₹4,10,00,000 < ₹5,37,28,138 → Continue
```

**Year 13 (Age 48):**
```
Cumulative wealth ≈ ₹5,80,00,000
FI Target (Year 13) = ₹12,00,000 × (1.06)¹³ × 25 = ₹6,40,60,541
Check: ₹5,80,00,000 < ₹6,40,60,541 → Continue
```

**Year 15 (Age 50):**
```
Cumulative wealth ≈ ₹7,25,00,000
FI Target (Year 15) = ₹12,00,000 × (1.06)¹⁵ × 25 = ₹7,19,58,074
Check: ₹7,25,00,000 >= ₹7,19,58,074 → FIRE ACHIEVED! 🎉
```

### Result:
- **FIRE Age:** 50 years
- **Time to FI:** 15 years
- **Net Worth at FI:** ₹7.25 Cr
- **Status:** On Track ✓

---

## Notes & Disclaimers

1. **Simplified Model:** This calculator uses simplified assumptions for planning purposes. Real-life returns vary year-to-year.

2. **Sequence of Returns Risk:** Not modeled. Early negative returns can significantly impact FIRE timeline.

3. **Tax Implications:** Not included. Actual post-tax returns and withdrawals will differ.

4. **Healthcare Costs:** May increase faster than general inflation, especially in later years.

5. **Currency Risk:** All calculations in INR. Foreign exchange fluctuations not considered.

6. **Emergency Fund:** Should maintain 6-12 months expenses separate from FIRE corpus.

7. **Annual Compounding:** Model uses annual compounding; monthly compounding would give slightly different results.

8. **Indian Context:** Model tailored for Indian financial planning with Lakhs/Crores formatting.

---

**Document Version:** 1.0
**Last Updated:** 2025-12-21
**Application:** IntelliWealth MVP - FIRE Calculator
