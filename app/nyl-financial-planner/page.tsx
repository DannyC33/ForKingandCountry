'use client';
import { useState, useMemo } from 'react';

// ── Constants ─────────────────────────────────────────────────────────────────
const DISCOUNT_RATE   = 0.055;
const INFLATION       = 0.03;
const SS_COLA         = 0.025;
const SS_WAGE_BASE    = 176100; // 2025
const STD_DED_SINGLE  = 15000;  // 2025
const STD_DED_MARRIED = 30000;  // 2025
const K401_LIMIT      = 23500;  // 2025 employee limit

const INVESTMENT_RETURNS: Record<string, number> = {
  low: 0.045, medium: 0.077, high: 0.11,
};
const MORTGAGE_RATES: Record<string, number> = {
  low: 0.0825, medium: 0.0699, high: 0.0625,
};

// Property tax base rate (% of assessed home value / year)
const STATE_PROP_TAX: Record<string, number> = {
  AZ: 0.0063, CA: 0.0076, CO: 0.0051, FL: 0.0083,
  GA: 0.0091, IL: 0.0221, IN: 0.0085, MA: 0.0111,
  MD: 0.0109, MI: 0.0146, MO: 0.0099, NC: 0.0085,
  NJ: 0.0245, NY: 0.0172, OH: 0.0140, PA: 0.0153,
  TN: 0.0056, TX: 0.0180, WA: 0.0092, WI: 0.0173,
};

// Annual property tax growth rate by state (historical assessment trends)
// CA capped ~2% (Prop 13); TX/NJ historically higher; most ~2-3%
const STATE_PROP_TAX_GROWTH: Record<string, number> = {
  AZ: 0.030, CA: 0.020, CO: 0.025, FL: 0.025,
  GA: 0.025, IL: 0.025, IN: 0.020, MA: 0.025,
  MD: 0.025, MI: 0.020, MO: 0.020, NC: 0.025,
  NJ: 0.030, NY: 0.025, OH: 0.020, PA: 0.020,
  TN: 0.025, TX: 0.035, WA: 0.025, WI: 0.020,
};

// Approximate effective state income tax rates (middle-income)
// No-income-tax states: FL, TN, TX, WA
const STATE_INCOME_TAX: Record<string, number> = {
  AZ: 0.025, CA: 0.093, CO: 0.044, FL: 0.000,
  GA: 0.055, IL: 0.0495, IN: 0.0323, MA: 0.050,
  MD: 0.0550, MI: 0.0425, MO: 0.054, NC: 0.0475,
  NJ: 0.0637, NY: 0.0685, OH: 0.040, PA: 0.0307,
  TN: 0.000, TX: 0.000, WA: 0.000, WI: 0.0565,
};

const STATES        = Object.keys(STATE_PROP_TAX).sort();
const CHILD_MONTHLY = 500;
const MARRIAGE_BOOST = 200;

// ── Types ─────────────────────────────────────────────────────────────────────
type Risk         = 'low' | 'medium' | 'high';
type Credit       = 'low' | 'medium' | 'high';
type EventType    = 'mortgage' | 'car' | 'marriage' | 'child' | 'death';
type FilingStatus = 'single' | 'married';

interface LifeEvent {
  id: string; type: EventType; label: string; startYear: number;
  homePrice?: number; downPct?: number; creditRating?: Credit;
  mortgageYears?: number; state?: string;
  carPrice?: number; loanYears?: number;
}

type BumpType = 'salary' | 'home_value' | 'withdrawal' | 'expense' | 'insurance';

interface FinancialBump {
  id: string; type: BumpType; year: number;
  newSalary?: number;
  mortgageEventId?: string; newHomeValue?: number;
  amount?: number; taxFree?: boolean; taxFreeReason?: string;
  newExpenses?: number;
  insurancePremium?: number; insuranceCoverage?: number;
}

interface IncomeBreakpoint {
  fromMonth: number;
  afterTaxIncome: number;
  monthly401kEmp: number;
  monthly401kMatch: number;
}

type SavingsGoalType = 'house' | 'car' | 'other';

interface SavingsGoalEvent {
  id: string; type: SavingsGoalType; label: string;
  targetAmount: number; targetYear: number;
  usePortfolio: boolean;
}

interface YearRow {
  month: number; year: number; age: number;
  needed: number; afterTaxIncome: number; ssOffset: number;
  portfolioValue: number; portfolioContribs: number; portfolioGrowth: number;
  annualContrib: number;
  monthly401kEmp: number; monthly401kMatch: number;
  mortgagePnI: number; mortgagePropTax: number;
  monthlySavingsPayments: number;
  retirementWithdrawal: number;
  debtBalance: number;
  events: string[];
}

interface TaxDetail {
  gross: number; federal: number; state: number; fica: number;
  contrib401k: number; employerMatch: number; takeHome: number;
}

// ── Finance helpers ───────────────────────────────────────────────────────────
function calcFederalTax(taxable: number, filing: FilingStatus): number {
  if (taxable <= 0) return 0;
  const b: [number, number][] = filing === 'married'
    ? [[0.10,23850],[0.12,96950],[0.22,206700],[0.24,394600],[0.32,501050],[0.35,751600],[0.37,Infinity]]
    : [[0.10,11925],[0.12,48475],[0.22,103350],[0.24,197300],[0.32,250525],[0.35,626350],[0.37,Infinity]];
  let tax = 0, prev = 0;
  for (const [rate, cap] of b) {
    const band = Math.min(taxable, cap === Infinity ? taxable : cap) - prev;
    if (band <= 0) break;
    tax += band * rate;
    prev = cap === Infinity ? taxable : cap;
    if (taxable <= cap) break;
  }
  return tax;
}

function calcTaxDetail(
  annualGross: number,
  filing: FilingStatus,
  resState: string,
  contrib401kPct: number,
  matchPct: number,
  matchCapPct: number
): TaxDetail {
  const emp401k = Math.min(annualGross * contrib401kPct / 100, K401_LIMIT);
  const matchable = Math.min(contrib401kPct, matchCapPct);
  const empMatch  = annualGross * (matchable / 100) * (matchPct / 100);

  const stdDed     = filing === 'married' ? STD_DED_MARRIED : STD_DED_SINGLE;
  const fedTaxable = Math.max(0, annualGross - emp401k - stdDed);
  const federal    = calcFederalTax(fedTaxable, filing);

  const stateRate  = STATE_INCOME_TAX[resState] ?? 0;
  const stateTax   = Math.max(0, annualGross - emp401k) * stateRate;

  const ss      = Math.min(annualGross, SS_WAGE_BASE) * 0.062;
  const medicare = annualGross * 0.0145 + Math.max(0, annualGross - 200000) * 0.009;
  const fica     = ss + medicare;

  const takeHome = Math.max(0, annualGross - emp401k - federal - stateTax - fica);
  return {
    gross: annualGross / 12, federal: federal / 12, state: stateTax / 12,
    fica: fica / 12, contrib401k: emp401k / 12, employerMatch: empMatch / 12,
    takeHome: takeHome / 12,
  };
}

function calcMortgagePmt(principal: number, annualRate: number, years: number) {
  const r = annualRate / 12, n = years * 12;
  return r === 0 ? principal / n : (principal * r * Math.pow(1+r,n)) / (Math.pow(1+r,n) - 1);
}
function calcCarPmt(price: number, down: number, years: number) {
  const p = price - down, r = 0.065/12, n = years*12;
  return (p * r * Math.pow(1+r,n)) / (Math.pow(1+r,n) - 1);
}
function npv(cashflows: number[], annualRate: number) {
  const r = annualRate / 12;
  return cashflows.reduce((s, cf, i) => s + cf / Math.pow(1+r, i+1), 0);
}
function fmt(n: number) { return '$' + Math.round(n).toLocaleString('en-US'); }
function pct(n: number) { return (n * 100).toFixed(2) + '%'; }

// ── Social Security estimator ─────────────────────────────────────────────────
// Reconstructs a career earnings history, derives AIME, applies 2025 PIA bend
// points, then adjusts for the chosen claiming age (FRA = 67).
function estimateSSBenefit(
  currentAge: number,
  annualGross: number,
  bumps: FinancialBump[],
  workEndAge: number,  // stop counting earnings here (retirement age)
  ssAge: number        // claiming age (affects reduction / delay credit)
): number {
  const START_WORK = 22;
  const ANNUAL_RAISE = 0.03;         // 3 %/yr between bumps
  const SS_WAGE_BASE = 176_100;      // 2025 taxable maximum
  const nowYear = new Date().getFullYear();

  // Back-project entry salary from current salary assuming 3 %/yr compound growth
  const yearsHistory = Math.max(0, currentAge - START_WORK);
  const entrySalary = annualGross / Math.pow(1 + ANNUAL_RAISE, yearsHistory);

  // Future salary bumps sorted ascending
  const futureBumps = bumps
    .filter(b => b.type === 'salary' && (b.newSalary ?? 0) > 0)
    .sort((a, b) => a.year - b.year);

  const earnings: number[] = [];

  for (let age = START_WORK; age < Math.max(workEndAge, START_WORK + 1); age++) {
    const calYear = nowYear + (age - currentAge);
    let salary: number;

    if (age < currentAge) {
      // Historical: smooth 3 %/yr growth from entry level
      salary = entrySalary * Math.pow(1 + ANNUAL_RAISE, age - START_WORK);
    } else {
      // Future: find the most recent bump at or before this calendar year,
      // then compound 3 %/yr from that bump's salary (or from current gross)
      const prior = futureBumps.filter(b => b.year <= calYear);
      if (prior.length > 0) {
        const last = prior[prior.length - 1];
        salary = last.newSalary! * Math.pow(1 + ANNUAL_RAISE, calYear - last.year);
      } else {
        salary = annualGross * Math.pow(1 + ANNUAL_RAISE, calYear - nowYear);
      }
    }

    earnings.push(Math.min(salary, SS_WAGE_BASE));
  }

  // AIME: 35 highest-earning years / 420 months
  const top35 = [...earnings].sort((a, b) => b - a).slice(0, 35);
  const aime = top35.reduce((s, v) => s + v, 0) / 420;

  // 2025 PIA bend points
  const pia =
    Math.min(aime, 1_226) * 0.90 +
    Math.max(0, Math.min(aime - 1_226, 7_391 - 1_226)) * 0.32 +
    Math.max(0, aime - 7_391) * 0.15;

  // Claiming age adjustment — FRA is 67 for anyone born after 1960
  const FRA = 67;
  let factor: number;
  if (ssAge < FRA) {
    const monthsEarly = (FRA - ssAge) * 12;
    const first36 = Math.min(monthsEarly, 36);
    const beyond36 = Math.max(0, monthsEarly - 36);
    factor = 1 - (first36 * (5 / 9) / 100) - (beyond36 * (5 / 12) / 100);
  } else {
    // Delay credits cap at age 70 (3 yrs × 8 % = +24 % max)
    factor = 1 + (Math.min(ssAge, 70) - FRA) * 0.08;
  }

  return Math.max(0, Math.round(pia * factor));
}

// ── Timeline builder ──────────────────────────────────────────────────────────
function buildTimeline(
  currentAge: number,
  incomeBreakpoints: IncomeBreakpoint[],
  baseExpenses: number,
  investBal: number, investRisk: Risk,
  ssMonthly: number, ssAge: number,
  events: LifeEvent[],
  bumps: FinancialBump[],
  savingsGoals: SavingsGoalEvent[],
  retirementAge: number | '',
  lifeInsurancePremium: number,
  lifeInsuranceCoverage: number
): YearRow[] {
  const totalMonths  = (90 - currentAge) * 12;
  const startYear    = new Date().getFullYear();
  const investReturn = INVESTMENT_RETURNS[investRisk];
  const retirementMonth = (retirementAge !== '' && +retirementAge > currentAge)
    ? Math.round((+retirementAge - currentAge) * 12)
    : -1;
  const deathEvent  = events.find(e => e.type === 'death');
  const deathMonth  = deathEvent ? Math.max(0, Math.round((deathEvent.startYear - startYear) * 12)) : -1;
  // Surviving spouse or dependents → SS survivor benefit continues after death
  const hasSpouse   = events.some(e => e.type === 'marriage' || e.type === 'child');
  const paidOffMortgages = new Set<string>();
  const expenseBumps   = bumps.filter(b => b.type === 'expense').sort((a, b) => a.year - b.year);
  const insuranceBumps = bumps.filter(b => b.type === 'insurance').sort((a, b) => a.year - b.year);

  let portfolioValue   = investBal;
  let portfolioContribs = investBal;
  let debtBalance      = 0;
  const DEBT_RATE      = 0.27 / 12; // 27% APR compounded monthly
  const rows: YearRow[] = [];

  for (let m = 0; m < totalMonths; m++) {
    const fracYear = m / 12;
    const age      = currentAge + fracYear;
    const calYear  = startYear + fracYear;
    const inflFactor = Math.pow(1 + INFLATION/12, m);

    const isRetired       = retirementMonth >= 0 && m >= retirementMonth;
    const isDeceased      = deathMonth >= 0 && m >= deathMonth;
    const isStoppedWorking = isRetired || isDeceased;

    // Find current income breakpoint (most recent one at or before this month)
    const bp = [...incomeBreakpoints].reverse().find(b => b.fromMonth <= m) ?? incomeBreakpoints[0];
    const monthlyContrib = isStoppedWorking ? 0 : (bp.monthly401kEmp + bp.monthly401kMatch);
    const activeAfterTaxIncome = isStoppedWorking ? 0 : bp.afterTaxIncome;

    const activeEvents: string[] = [];

    if (isRetired && m === retirementMonth)
      activeEvents.push('Retired — portfolio liquidation begins');

    // At the moment of death: add insurance payout then begin immediate liquidation
    if (m === deathMonth) {
      let totalInsurancePayout = lifeInsuranceCoverage;
      if (lifeInsuranceCoverage > 0)
        activeEvents.push(`Death — ${fmt(lifeInsuranceCoverage)} main policy payout`);
      for (const ins of insuranceBumps.filter(b => calYear >= b.year)) {
        const cov = ins.insuranceCoverage ?? 0;
        if (cov > 0) { totalInsurancePayout += cov; activeEvents.push(`Insurance policy payout — ${fmt(cov)}`); }
      }
      if (totalInsurancePayout > 0) {
        portfolioValue += totalInsurancePayout;
      } else {
        activeEvents.push('Death — immediate portfolio liquidation begins');
      }
    }

    // Flag salary bumps (only while working) and manual withdrawals
    const salaryBump = bumps.find(b => b.type === 'salary' && Math.round((b.year - startYear) * 12) === m);
    if (salaryBump && !isStoppedWorking) activeEvents.push(`Salary → ${fmt(salaryBump.newSalary ?? 0)}/yr`);

    const withdrawalBump = bumps.find(b => b.type === 'withdrawal' && Math.round((b.year - startYear) * 12) === m);
    if (withdrawalBump) {
      portfolioValue = Math.max(0, portfolioValue - (withdrawalBump.amount ?? 0));
      activeEvents.push(`Withdrawal ${fmt(withdrawalBump.amount ?? 0)}${withdrawalBump.taxFree ? ' (tax-free)' : ''}`);
    }

    // Portfolio: stopped working → grow then systematic PMT drawdown; working → add contribs then grow
    let retirementWithdrawal = 0;
    if (isStoppedWorking) {
      const remainingMonths = totalMonths - m;
      const r = investReturn / 12;
      const grownValue = portfolioValue * (1 + r);
      if (remainingMonths > 0 && portfolioValue > 0) {
        const pmt = r > 0
          ? portfolioValue * r / (1 - Math.pow(1 + r, -remainingMonths))
          : portfolioValue / remainingMonths;
        retirementWithdrawal = Math.min(pmt, grownValue);
      }
      portfolioValue = Math.max(0, grownValue - retirementWithdrawal);
    } else {
      portfolioValue  = (portfolioValue + monthlyContrib) * (1 + investReturn/12);
      portfolioContribs += monthlyContrib;
    }
    const portfolioGrowth = Math.max(0, portfolioValue - portfolioContribs);

    const activeExpBump = [...expenseBumps].reverse().find(b => calYear >= b.year);
    const effectiveBase = activeExpBump ? (activeExpBump.newExpenses ?? baseExpenses) : baseExpenses;
    let needed = effectiveBase * inflFactor;
    let mortgagePnI = 0, mortgagePropTax = 0;

    for (const ev of events) {
      const mOffset = Math.round((calYear - ev.startYear) * 12);

      if (ev.type === 'mortgage') {
        if (paidOffMortgages.has(ev.id)) continue;
        const mortYrs = ev.mortgageYears ?? 30;
        if (mOffset >= 0 && mOffset < mortYrs * 12) {
          const principal = (ev.homePrice ?? 400000) * (1 - (ev.downPct ?? 0.2));
          const rate = MORTGAGE_RATES[ev.creditRating ?? 'medium'];
          const pmt  = calcMortgagePmt(principal, rate, mortYrs);
          const taxGrowth = STATE_PROP_TAX_GROWTH[ev.state ?? 'NJ'] ?? INFLATION;
          const hvBump = bumps.find(b => b.type === 'home_value' && b.mortgageEventId === ev.id && calYear >= b.year);
          let tax: number;
          if (hvBump?.newHomeValue) {
            const baseTaxBumped = (hvBump.newHomeValue * (STATE_PROP_TAX[ev.state ?? 'NJ'] ?? 0.018)) / 12;
            const monthsSinceBump = Math.max(0, (calYear - hvBump.year) * 12);
            tax = baseTaxBumped * Math.pow(1 + taxGrowth, monthsSinceBump / 12);
            if (Math.round((hvBump.year - startYear) * 12) === m)
              activeEvents.push(`Home → ${fmt(hvBump.newHomeValue)}`);
          } else {
            const baseTax = ((ev.homePrice ?? 400000) * (STATE_PROP_TAX[ev.state ?? 'NJ'] ?? 0.018)) / 12;
            tax = baseTax * Math.pow(1 + taxGrowth, mOffset / 12);
          }
          if (m === deathMonth) {
            // Pay off remaining loan balance immediately from the portfolio payout
            const remaining = mortYrs * 12 - mOffset;
            const mr = rate / 12;
            const remainBal = remaining > 0 && mr > 0
              ? pmt * (1 - Math.pow(1 + mr, -remaining)) / mr
              : pmt * remaining;
            portfolioValue = Math.max(0, portfolioValue - Math.round(remainBal));
            activeEvents.push(`Mortgage paid off at death — ${fmt(Math.round(remainBal))}`);
            paidOffMortgages.add(ev.id);
          } else {
            mortgagePnI  += pmt;
            mortgagePropTax += tax;
            needed += pmt + tax;
            if (mOffset === 0) activeEvents.push('Bought Home');
          }
        }
      }
      if (ev.type === 'car') {
        const loanYrs = ev.loanYears ?? 5;
        if (mOffset >= 0 && mOffset < loanYrs * 12) {
          needed += calcCarPmt(ev.carPrice ?? 30000, (ev.carPrice ?? 30000) * 0.15, loanYrs);
          if (mOffset === 0) activeEvents.push('Bought Car');
        }
      }
      if (ev.type === 'marriage' && mOffset >= 0) {
        needed += MARRIAGE_BOOST * inflFactor;
        if (mOffset === 0) activeEvents.push('Married');
      }
      if (ev.type === 'child' && mOffset >= 0 && mOffset < 18 * 12) {
        needed += CHILD_MONTHLY * inflFactor;
        if (mOffset === 0) activeEvents.push('Child Born');
      }
      // 'death' event is handled above (payout + mortgage payoff) — no expense addition needed
    }

    // Life insurance premium — paid while alive
    if (lifeInsurancePremium > 0 && !isDeceased) {
      needed += lifeInsurancePremium;
    }
    // Insurance bump policies — premiums start in their specified year
    if (!isDeceased) {
      for (const ins of insuranceBumps.filter(b => calYear >= b.year)) {
        needed += ins.insurancePremium ?? 0;
      }
    }

    // After death: 40% expense reduction (one earner gone, spending contracts)
    if (isDeceased) {
      needed *= 0.6;
    }

    const ssYearsActive = Math.max(0, age - ssAge);
    // SS stops at death (personal benefit ceases)
    // SS: personal benefit while alive; survivor benefit continues if spouse/children exist
    const ssOffset = ((!isDeceased || hasSpouse) && age >= ssAge)
      ? ssMonthly * Math.pow(1 + SS_COLA/12, ssYearsActive * 12)
      : 0;

    // Savings goals: portfolio deductions at target year; monthly payments otherwise
    let monthlySavingsPayments = 0;
    for (const sg of savingsGoals) {
      const targetMonth = Math.round((sg.targetYear - startYear) * 12);
      if (sg.usePortfolio) {
        if (m === targetMonth) {
          // Deduct only what the portfolio can cover; any shortfall was spread monthly below
          const portfolioCoverage = Math.min(portfolioValue, sg.targetAmount);
          portfolioValue = Math.max(0, portfolioValue - portfolioCoverage);
          activeEvents.push(`Savings goal: ${sg.label} ${fmt(portfolioCoverage)} from portfolio`);
        } else if (m < targetMonth) {
          // Only add monthly savings for the excess the current portfolio cannot cover
          const excessOverPortfolio = Math.max(0, sg.targetAmount - portfolioValue);
          if (excessOverPortfolio > 0) {
            const monthlyShortfall = excessOverPortfolio / (targetMonth - m);
            monthlySavingsPayments += monthlyShortfall;
            needed += monthlyShortfall;
          }
        }
      } else {
        // Spread cost as monthly payments from now until target month
        if (targetMonth > 0 && m < targetMonth) {
          const monthlyPayment = sg.targetAmount / targetMonth;
          monthlySavingsPayments += monthlyPayment;
          needed += monthlyPayment;
        }
      }
    }

    // Every penny saved compounds — savings goal payments go into the portfolio
    if (!isStoppedWorking && monthlySavingsPayments > 0) {
      portfolioValue  += monthlySavingsPayments;
      portfolioContribs += monthlySavingsPayments;
    }

    // Debt: only accumulate when income can't cover necessary expenses AND portfolio is exhausted
    const totalIncome     = activeAfterTaxIncome + ssOffset + retirementWithdrawal;
    const necessaryNeeded = needed - monthlySavingsPayments;
    const expenseGap      = totalIncome - necessaryNeeded;
    debtBalance *= (1 + DEBT_RATE); // compound existing balance first
    if (expenseGap < 0) {
      const shortfall      = -expenseGap;
      const portfolioDraw  = Math.min(portfolioValue, shortfall); // drain portfolio first
      portfolioValue       = Math.max(0, portfolioValue - portfolioDraw);
      const uncovered      = shortfall - portfolioDraw;
      if (uncovered > 0) debtBalance += uncovered;              // only what portfolio can't cover
    } else if (debtBalance > 0) {
      debtBalance = Math.max(0, debtBalance - expenseGap);      // surplus pays down debt
    }

    rows.push({
      month: m, year: Math.floor(calYear), age: Math.floor(age),
      needed: Math.round(needed), afterTaxIncome: Math.round(activeAfterTaxIncome),
      ssOffset: Math.round(ssOffset),
      portfolioValue: Math.round(portfolioValue),
      portfolioContribs: Math.round(portfolioContribs),
      portfolioGrowth: Math.round(portfolioGrowth),
      annualContrib: Math.round(monthlyContrib * 12),
      monthly401kEmp: Math.round(isStoppedWorking ? 0 : bp.monthly401kEmp),
      monthly401kMatch: Math.round(isStoppedWorking ? 0 : bp.monthly401kMatch),
      mortgagePnI: Math.round(mortgagePnI),
      mortgagePropTax: Math.round(mortgagePropTax),
      monthlySavingsPayments: Math.round(monthlySavingsPayments),
      retirementWithdrawal: Math.round(retirementWithdrawal),
      debtBalance: Math.round(debtBalance),
      events: activeEvents,
    });
  }
  return rows;
}

// ── Chart ─────────────────────────────────────────────────────────────────────
function TimelineChart({ data, income }: { data: YearRow[]; income: number }) {
  const yearly: YearRow[] = [];
  for (let i = 0; i < data.length; i += 12) yearly.push(data[i]);
  if (!yearly.length) return null;

  const maxNeeded = Math.max(...yearly.map(r => r.needed));
  const ceiling   = Math.max(income, maxNeeded) * 1.15;
  const W = 100, H = 60;
  const toY = (v: number) => H - (v / ceiling) * H;

  const neededPts = yearly.map((r,i) =>
    `${((i/(yearly.length-1))*W).toFixed(1)},${toY(r.needed).toFixed(1)}`
  ).join(' ');
  const incomeLine = toY(income);
  const evMarkers  = yearly.flatMap((r,i) =>
    r.events.map(() => ({ x: (i/(yearly.length-1))*W, y: toY(r.needed) }))
  );
  const ssStart   = yearly.find(r => r.ssOffset > 0);
  const ssX       = ssStart ? (yearly.indexOf(ssStart)/(yearly.length-1))*W : null;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H+12}`} className="w-full h-72" preserveAspectRatio="none">
        <polyline points={`0,${H} ${neededPts} ${W},${H}`} fill="#0066CC15" stroke="none" />
        <line x1="0" y1={incomeLine} x2={W} y2={incomeLine} stroke="#FBBF24" strokeWidth="0.5" strokeDasharray="1.2,0.8" />
        <polyline points={neededPts} fill="none" stroke="#0066CC" strokeWidth="0.9" />
        {ssX !== null && <line x1={ssX} y1="0" x2={ssX} y2={H} stroke="#16A34A" strokeWidth="0.5" strokeDasharray="1,1" />}
        {evMarkers.map((ev,i) => <circle key={i} cx={ev.x} cy={ev.y} r="1.3" fill="#C8291C" />)}
        {yearly.filter((_,i) => i % 5 === 0).map((r) => {
          const idx = yearly.indexOf(r);
          const x = (idx/(yearly.length-1))*W;
          return <text key={idx} x={x} y={H+8} fontSize="2.5" textAnchor="middle" fill="#718096">Age {r.age}</text>;
        })}
      </svg>
      <div className="flex flex-wrap gap-4 mt-2 text-xs text-[#718096]">
        <span className="flex items-center gap-1.5"><span className="w-5 border-t-2 border-[#0066CC] inline-block" />Monthly Needed</span>
        <span className="flex items-center gap-1.5"><span className="w-5 border-t-2 border-dashed border-[#FBBF24] inline-block" />Take-Home Income</span>
        <span className="flex items-center gap-1.5"><span className="w-5 border-t-2 border-dashed border-[#16A34A] inline-block" />SS Starts</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#C8291C] inline-block" />Life Event</span>
      </div>
    </div>
  );
}

// ── Small shared UI ───────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-[10px] font-bold uppercase tracking-widest text-[#4A5568] mb-1">{children}</label>;
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="w-full border border-[#C0D8F0] rounded-md px-3 py-2 text-sm text-[#1A202C] focus:outline-none focus:border-[#0066CC] transition-colors bg-white" />;
}
function Sel({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className="w-full border border-[#C0D8F0] rounded-md px-3 py-2 text-sm text-[#1A202C] focus:outline-none focus:border-[#0066CC] bg-white transition-colors">
      {children}
    </select>
  );
}
function Card({ title, children, accent = '#0066CC' }: { title: string; children: React.ReactNode; accent?: string }) {
  return (
    <div className="bg-white rounded-xl border border-[#C8DCF7] shadow-sm p-5 h-full">
      <h3 className="text-[11px] font-black uppercase tracking-widest mb-4" style={{ color: accent }}>{title}</h3>
      {children}
    </div>
  );
}
function StatTile({ label, value, sub, dark }: { label: string; value: string; sub?: string; dark?: boolean }) {
  return (
    <div className={`rounded-xl p-4 ${dark ? 'bg-[#0066CC] text-white' : 'bg-white border border-[#C8DCF7]'}`}>
      <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${dark ? 'text-blue-300' : 'text-[#718096]'}`}>{label}</p>
      <p className={`text-xl font-black ${dark ? 'text-white' : 'text-[#0066CC]'}`}>{value}</p>
      {sub && <p className={`text-[11px] mt-0.5 ${dark ? 'text-blue-300' : 'text-[#718096]'}`}>{sub}</p>}
    </div>
  );
}
function TaxRow({ label, value, color = '#718096', bold }: { label: string; value: string; color?: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className={`text-[11px] ${bold ? 'font-black' : ''}`} style={{ color }}>{label}</span>
      <span className={`text-[11px] font-bold`} style={{ color }}>{value}</span>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function NYLFinancialPlanner() {
  // Profile
  const [currentAge,    setCurrentAge]    = useState<number|''>('');
  const [residenceState,setResidenceState]= useState('NJ');
  const [filingStatus,  setFilingStatus]  = useState<FilingStatus>('single');
  const [baseExpenses,  setBaseExpenses]  = useState<number|''>('');
  // Income
  const [salary,      setSalary]      = useState<number|''>(0);
  const [w2Extra,     setW2Extra]     = useState<number|''>(0);
  const [contractInc, setContractInc] = useState<number|''>(0);
  // 401k
  const [contrib401kPct, setContrib401kPct] = useState(3);
  const [matchPct,       setMatchPct]       = useState(100);
  const [matchCapPct,    setMatchCapPct]    = useState(3);
  // Investments
  const [investBal,      setInvestBal]      = useState<number|''>(0);
  const [currentSavings, setCurrentSavings] = useState<number|''>(0);
  const [investRisk,     setInvestRisk]     = useState<Risk>('medium');
  // SS
  const [ssAge, setSsAge] = useState<65|72>(65);
  // Retirement
  const [retirementAge, setRetirementAge] = useState<number|''>('');
  // Life insurance
  const [lifeInsurancePremium,  setLifeInsurancePremium]  = useState<number|''>('');
  const [lifeInsuranceCoverage, setLifeInsuranceCoverage] = useState<number|''>('');
  // Life events
  const [events,    setEvents]    = useState<LifeEvent[]>([]);
  const [showModal, setShowModal] = useState(false);
  // New-event form state
  const [newType,       setNewType]       = useState<EventType>('mortgage');
  const [newYear,       setNewYear]       = useState(new Date().getFullYear() + 3);
  const [homePrice,     setHomePrice]     = useState(450000);
  const [downPct,       setDownPct]       = useState(20);
  const [creditRating,  setCreditRating]  = useState<Credit>('medium');
  const [mortgageYrs,   setMortgageYrs]   = useState(30);
  const [propState,     setPropState]     = useState('NJ');
  const [carPrice,      setCarPrice]      = useState(35000);
  const [loanYrs,       setLoanYrs]       = useState(5);
  // Table toggles
  const [showMortgageDetail,   setShowMortgageDetail]   = useState(false);
  const [showPortfolioDetail,  setShowPortfolioDetail]  = useState(false);
  const [showMortgageOverview, setShowMortgageOverview] = useState(false);
  const [showSavingsCard,      setShowSavingsCard]      = useState(false);
  const [storyMode,            setStoryMode]            = useState<'ideal' | 'difficult' | 'death' | null>(null);
  // Financial Bumps
  const [bumps,          setBumps]          = useState<FinancialBump[]>([]);
  const [showBumpModal,  setShowBumpModal]  = useState(false);
  const [bumpType,       setBumpType]       = useState<BumpType>('salary');
  const [bumpYear,       setBumpYear]       = useState(new Date().getFullYear() + 2);
  const [bumpNewSalary,  setBumpNewSalary]  = useState<number|''>(0);
  const [bumpEventId,    setBumpEventId]    = useState('');
  const [bumpHomeValue,  setBumpHomeValue]  = useState<number|''>(500000);
  const [bumpAmount,     setBumpAmount]     = useState<number|''>(10000);
  const [bumpTaxFree,    setBumpTaxFree]    = useState(false);
  const [bumpTaxFreeReason,     setBumpTaxFreeReason]     = useState('First-time home purchase');
  const [bumpNewExpenses,       setBumpNewExpenses]       = useState<number|''>('');
  const [bumpInsurancePremium,  setBumpInsurancePremium]  = useState<number|''>('');
  const [bumpInsuranceCoverage, setBumpInsuranceCoverage] = useState<number|''>('');
  // Financial Savings Goals
  const [savingsGoalEvents, setSavingsGoalEvents] = useState<SavingsGoalEvent[]>([]);
  const [showSavingsModal,  setShowSavingsModal]  = useState(false);
  const [sgType,            setSgType]            = useState<SavingsGoalType>('house');
  const [sgLabel,           setSgLabel]           = useState('');
  const [sgAmount,          setSgAmount]          = useState<number|''>(0);
  const [sgYear,            setSgYear]            = useState(new Date().getFullYear() + 5);
  const [sgUsePortfolio,    setSgUsePortfolio]    = useState(false);
  const [sgTotalValue,      setSgTotalValue]      = useState<number|''>('');
  const [sgDownPct,         setSgDownPct]         = useState(20);

  // ── Derived ──────────────────────────────────────────────────────────────
  const annualGross = (+salary||0) + (+w2Extra||0) + (+contractInc||0);

  const taxDetail = useMemo(
    () => calcTaxDetail(annualGross, filingStatus, residenceState, contrib401kPct, matchPct, matchCapPct),
    [annualGross, filingStatus, residenceState, contrib401kPct, matchPct, matchCapPct]
  );

  const ready = currentAge !== '' && baseExpenses !== '';

  const incomeBreakpoints = useMemo<IncomeBreakpoint[]>(() => {
    const startYr = new Date().getFullYear();

    // Marriage event changes filing status from current → 'married' at the event year
    const marriageEv    = events.find(ev => ev.type === 'marriage');
    const marriageMonth = marriageEv ? Math.round((marriageEv.startYear - startYr) * 12) : Infinity;
    const filingAt = (month: number): FilingStatus =>
      (isFinite(marriageMonth) && month >= marriageMonth) ? 'married' : filingStatus;

    const base: IncomeBreakpoint = {
      fromMonth: 0,
      afterTaxIncome: taxDetail.takeHome,
      monthly401kEmp: taxDetail.contrib401k,
      monthly401kMatch: taxDetail.employerMatch,
    };

    const bps: IncomeBreakpoint[] = [base];

    // Insert a breakpoint at the marriage month so take-home jumps to MFJ rates
    if (isFinite(marriageMonth) && marriageMonth > 0) {
      const currentGross = taxDetail.gross * 12;
      const lastPreBump = [...bumps]
        .filter(b => b.type === 'salary' && (b.newSalary ?? 0) > 0 && b.year <= marriageEv!.startYear)
        .sort((a, b) => b.year - a.year)[0];
      const grossAtMarriage = lastPreBump
        ? (lastPreBump.newSalary ?? 0) + (+w2Extra||0) + (+contractInc||0)
        : currentGross;
      const d = calcTaxDetail(grossAtMarriage, 'married', residenceState, contrib401kPct, matchPct, matchCapPct);
      bps.push({ fromMonth: marriageMonth, afterTaxIncome: d.takeHome, monthly401kEmp: d.contrib401k, monthly401kMatch: d.employerMatch });
    }

    // Salary bumps — use whichever filing status is in effect at that month
    bumps
      .filter(b => b.type === 'salary' && (b.newSalary ?? 0) > 0)
      .sort((a, bv) => a.year - bv.year)
      .forEach(b => {
        const bumpMonth = Math.round((b.year - startYr) * 12);
        const newGross  = (b.newSalary ?? 0) + (+w2Extra||0) + (+contractInc||0);
        const d = calcTaxDetail(newGross, filingAt(bumpMonth), residenceState, contrib401kPct, matchPct, matchCapPct);
        bps.push({ fromMonth: bumpMonth, afterTaxIncome: d.takeHome, monthly401kEmp: d.contrib401k, monthly401kMatch: d.employerMatch });
      });

    return bps.sort((a, b) => a.fromMonth - b.fromMonth);
  }, [taxDetail, bumps, w2Extra, contractInc, filingStatus, residenceState, contrib401kPct, matchPct, matchCapPct, events]);

  const estimatedSSMonthly = useMemo(() => {
    if (currentAge === '' || annualGross <= 0) return 0;
    const nowYear = new Date().getFullYear();
    const deathEv = events.find(e => e.type === 'death');
    const deathAge = deathEv ? Math.round(+currentAge + (deathEv.startYear - nowYear)) : Infinity;
    const plannedEnd = retirementAge !== '' ? +retirementAge : 67;
    const workEnd = isFinite(deathAge) ? Math.min(plannedEnd, deathAge) : plannedEnd;
    return estimateSSBenefit(+currentAge, +annualGross, bumps, workEnd, ssAge);
  }, [currentAge, annualGross, bumps, retirementAge, ssAge, events]);

  const timeline = useMemo(() => {
    if (!ready) return [];
    return buildTimeline(
      +currentAge, incomeBreakpoints, +baseExpenses,
      (+investBal||0) + (+currentSavings||0), investRisk,
      estimatedSSMonthly, ssAge,
      events, bumps, savingsGoalEvents, retirementAge,
      +lifeInsurancePremium||0, +lifeInsuranceCoverage||0
    );
  }, [ready, currentAge, incomeBreakpoints, baseExpenses, investBal, currentSavings, investRisk, estimatedSSMonthly, ssAge, events, bumps, savingsGoalEvents, retirementAge, lifeInsurancePremium, lifeInsuranceCoverage]);

  const annual = useMemo(() => {
    const rows = [];
    for (let i = 0; i < timeline.length; i += 12) rows.push(timeline[i]);
    return rows;
  }, [timeline]);

  const goals = useMemo(() => {
    if (!timeline.length) return null;
    const snap = (m: number) => timeline[m]?.needed ?? 0;
    const now  = timeline[0].needed;
    const lifeNpv      = Math.round(npv(timeline.map(r => r.needed), DISCOUNT_RATE));
    const ssNpv        = Math.round(npv(timeline.map(r => r.ssOffset), DISCOUNT_RATE));
    const netLifeNpv   = Math.max(0, lifeNpv - ssNpv);
    const lifetimeAvg  = Math.round(timeline.reduce((s,r) => s + r.needed, 0) / timeline.length);
    const lifetimeAvgTakeHome  = Math.round(timeline.reduce((s,r) => s + r.afterTaxIncome, 0) / timeline.length);
    const lifetimeAvgSS        = Math.round(timeline.reduce((s,r) => s + r.ssOffset, 0) / timeline.length);
    const lifetimeAvgPortDraw  = Math.round(timeline.reduce((s,r) => s + r.retirementWithdrawal, 0) / timeline.length);
    const lifetimeAvgIncome    = lifetimeAvgTakeHome + lifetimeAvgSS + lifetimeAvgPortDraw;
    const lifetimeAvgGap = lifetimeAvgIncome - lifetimeAvg;
    // Salary snapshot at year 5 and 10 (take-home only, mirrors the salary in the monthly chart)
    const snap5Income  = timeline[60]?.afterTaxIncome  ?? 0;
    const snap10Income = timeline[120]?.afterTaxIncome ?? 0;
    // Average portfolio draw during retirement months only (non-zero rows)
    const retRows = timeline.filter(r => r.retirementWithdrawal > 0);
    const avgRetirementDraw = retRows.length
      ? Math.round(retRows.reduce((s, r) => s + r.retirementWithdrawal, 0) / retRows.length)
      : 0;
    return { now, snap5: snap(60), snap10: snap(120), snap20: snap(240), lifeNpv, ssNpv, netLifeNpv, lifetimeAvg, lifetimeAvgTakeHome, lifetimeAvgSS, lifetimeAvgPortDraw, lifetimeAvgIncome, lifetimeAvgGap, snap5Income, snap10Income, avgRetirementDraw, shortfall: Math.max(0, now - taxDetail.takeHome) };
  }, [timeline, taxDetail]);

  const savingsGoals = useMemo(() => {
    const nowYear = new Date().getFullYear();
    const liquidAssets = (+investBal||0) + (+currentSavings||0);
    // Allocate liquid assets across goals proportionally (first-come, first-served)
    let remainingAssets = liquidAssets;
    return events
      .filter(ev => ev.type === 'mortgage' || ev.type === 'car')
      .sort((a,b) => a.startYear - b.startYear)
      .map(ev => {
        const monthsUntil = Math.max(1, (ev.startYear - nowYear) * 12);
        let target = 0, label = '';
        if (ev.type === 'mortgage') {
          target = (ev.homePrice ?? 400000) * (ev.downPct ?? 0.2);
          label  = `Home Down Payment — ${ev.state ?? ''} (${ev.startYear})`;
        } else {
          target = (ev.carPrice ?? 30000) * 0.15;
          label  = `Car Down Payment (${ev.startYear})`;
        }
        const covered = Math.min(remainingAssets, target);
        remainingAssets = Math.max(0, remainingAssets - covered);
        const stillNeeded = Math.max(0, target - covered);
        const monthlyToSave = stillNeeded > 0 ? Math.ceil(stillNeeded / monthsUntil) : 0;
        // How much extra 401k contribution would hit this in time (pre-tax value)
        const extra401kPct = annualGross > 0 ? Math.min(100, Math.ceil((monthlyToSave * 12 / annualGross) * 100)) : 0;
        return { label, target, covered, stillNeeded, monthlyToSave, monthsUntil, extra401kPct, onTrack: stillNeeded === 0 };
      });
  }, [events, investBal, currentSavings, annualGross]);

  // Mortgage preview for modal
  const mortPreview = useMemo(() => {
    const p   = homePrice * (1 - downPct/100);
    const r   = MORTGAGE_RATES[creditRating];
    const pmt = calcMortgagePmt(p, r, mortgageYrs);
    const baseTax = (homePrice * (STATE_PROP_TAX[propState] ?? 0.018)) / 12;
    const growth  = STATE_PROP_TAX_GROWTH[propState] ?? INFLATION;
    return { pmt: Math.round(pmt), baseTax: Math.round(baseTax), rate: pct(r), taxGrowth: pct(growth) };
  }, [homePrice, downPct, creditRating, mortgageYrs, propState]);

  function addEvent() {
    const id = Date.now().toString();
    if (newType === 'mortgage')
      setEvents(p => [...p, { id, type:'mortgage', label:'Buy Home', startYear:newYear, homePrice, downPct:downPct/100, creditRating, mortgageYears:mortgageYrs, state:propState }]);
    else if (newType === 'car')
      setEvents(p => [...p, { id, type:'car', label:'Buy Car', startYear:newYear, carPrice, loanYears:loanYrs }]);
    else if (newType === 'marriage')
      setEvents(p => [...p, { id, type:'marriage', label:'Marriage', startYear:newYear }]);
    else if (newType === 'child')
      setEvents(p => [...p, { id, type:'child', label:'Child', startYear:newYear }]);
    else
      setEvents(p => [...p, { id, type:'death', label:'Death', startYear:newYear }]);
    setShowModal(false);
  }

  // When user opens the mortgage modal, pre-fill with residence state
  function openModal() {
    setPropState(residenceState);
    setShowModal(true);
  }

  function addBump() {
    const id = Date.now().toString();
    if (bumpType === 'salary')
      setBumps(p => [...p, { id, type: 'salary', year: bumpYear, newSalary: +bumpNewSalary || 0 }]);
    else if (bumpType === 'home_value')
      setBumps(p => [...p, { id, type: 'home_value', year: bumpYear, mortgageEventId: bumpEventId, newHomeValue: +bumpHomeValue || 0 }]);
    else if (bumpType === 'expense')
      setBumps(p => [...p, { id, type: 'expense', year: bumpYear, newExpenses: +bumpNewExpenses || 0 }]);
    else if (bumpType === 'insurance')
      setBumps(p => [...p, { id, type: 'insurance', year: bumpYear, insurancePremium: +bumpInsurancePremium || 0, insuranceCoverage: +bumpInsuranceCoverage || 0 }]);
    else
      setBumps(p => [...p, { id, type: 'withdrawal', year: bumpYear, amount: +bumpAmount || 0, taxFree: bumpTaxFree, taxFreeReason: bumpTaxFree ? bumpTaxFreeReason : undefined }]);
    setShowBumpModal(false);
  }

  function addSavingsGoal() {
    const id = Date.now().toString();
    const autoLabel = sgType === 'house' ? 'House Purchase' : sgType === 'car' ? 'Car Purchase' : sgLabel || 'Custom Goal';
    setSavingsGoalEvents(p => [...p, { id, type: sgType, label: autoLabel, targetAmount: +sgAmount || 0, targetYear: sgYear, usePortfolio: sgUsePortfolio }]);
    setShowSavingsModal(false);
  }

  const gap      = goals ? taxDetail.takeHome - goals.now : 0;
  const gapGreen = gap >= 0;

  return (
    <div className="min-h-screen bg-[#F5F9FF]" style={{ fontFamily:'system-ui,sans-serif' }}>

      {/* Nav */}
      <nav className="bg-white border-b border-[#C8DCF7] px-6 py-3 flex items-center gap-3 sticky top-0 z-30 shadow-sm">
        <div className="w-8 h-8 bg-[#0066CC] rounded flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
            <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
          </svg>
        </div>
        <div>
          <p className="text-[#0066CC] font-black text-sm leading-tight">Financial Planning Tool</p>
          <p className="text-[#4A90D9] text-[10px] tracking-widest">Lifetime Income Projector</p>
        </div>
      </nav>

      <div className="max-w-screen-xl mx-auto px-4 py-8">

        {/* ═══ INPUTS ═════════════════════════════════════════════════════════ */}
        <div className="mb-2">
          <h2 className="text-lg font-black text-[#0066CC] mb-0.5">Financial Profile</h2>
          <p className="text-xs text-[#718096]">Fill in all sections below, then your lifetime projection will appear.</p>
        </div>

        {/* Row 1: 5 input cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4">

          {/* 1 · Profile */}
          <Card title="1 · Profile">
            <div className="space-y-3">
              <div>
                <Label>Current Age</Label>
                <Input type="number" min={18} max={89} placeholder="e.g. 35"
                  value={currentAge} onChange={e => setCurrentAge(e.target.value==='' ? '' : +e.target.value)} />
              </div>
              <div>
                <Label>State of Residence</Label>
                <Sel value={residenceState} onChange={e => setResidenceState(e.target.value)}>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </Sel>
                <p className="text-[10px] text-[#718096] mt-1">Used for state income tax &amp; property tax defaults.</p>
              </div>
              <div>
                <Label>Filing Status</Label>
                <Sel value={filingStatus} onChange={e => setFilingStatus(e.target.value as FilingStatus)}>
                  <option value="single">Single</option>
                  <option value="married">Married Filing Jointly</option>
                </Sel>
              </div>
              <div>
                <Label>Monthly Base Expenses ($)</Label>
                <Input type="number" placeholder="e.g. 4500"
                  value={baseExpenses} onChange={e => setBaseExpenses(e.target.value==='' ? '' : +e.target.value)} />
                <p className="text-[10px] text-[#718096] mt-1">Rent, food, utilities — not life events below.</p>
              </div>
              <div>
                <Label>Planned Retirement Age</Label>
                <Input type="number" placeholder="e.g. 65 — leave blank"
                  value={retirementAge} onChange={e => setRetirementAge(e.target.value==='' ? '' : +e.target.value)}
                  min={currentAge !== '' ? +currentAge + 1 : 40} max={89} />
                {retirementAge !== '' && (
                  <p className="text-[10px] text-[#0066CC] mt-1 font-bold">
                    {Math.max(0, 90 - +retirementAge)} yr portfolio drawdown to age 90
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* 2 · Income */}
          <Card title="2 · Annual Income">
            <div className="space-y-3">
              <div>
                <Label>Salary / Primary W2</Label>
                <Input type="number" placeholder="e.g. 95000"
                  value={salary} onChange={e => setSalary(e.target.value==='' ? '' : +e.target.value)} />
              </div>
              <div>
                <Label>Bonus / Secondary W2</Label>
                <Input type="number" placeholder="e.g. 10000"
                  value={w2Extra} onChange={e => setW2Extra(e.target.value==='' ? '' : +e.target.value)} />
              </div>
              <div>
                <Label>Contract / 1099</Label>
                <Input type="number" placeholder="e.g. 0"
                  value={contractInc} onChange={e => setContractInc(e.target.value==='' ? '' : +e.target.value)} />
              </div>
              <div className="bg-[#EBF4FF] rounded-lg px-3 py-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#718096]">Gross Annual</span>
                  <span className="font-bold text-[#0066CC]">{fmt(annualGross)}</span>
                </div>
                <div className="flex justify-between text-[11px] mt-0.5">
                  <span className="text-[#718096]">Est. Monthly Take-Home</span>
                  <span className="font-black text-[#0066CC]">{fmt(taxDetail.takeHome)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* 3 · 401k & Benefits */}
          <Card title="3 · 401k &amp; Benefits" accent="#B45309">
            <div className="space-y-3">
              <div>
                <Label>Your Contribution (%)</Label>
                <Input type="number" min={0} max={100} step={0.5} value={contrib401kPct}
                  onChange={e => setContrib401kPct(+e.target.value)} />
                <p className="text-[10px] text-[#718096] mt-1">
                  Pre-tax: {fmt(taxDetail.contrib401k)}/mo · IRS limit {fmt(K401_LIMIT)}/yr
                </p>
              </div>
              <div>
                <Label>Employer Match (%)</Label>
                <Input type="number" min={0} max={200} step={5} value={matchPct}
                  onChange={e => setMatchPct(+e.target.value)} />
                <p className="text-[10px] text-[#718096] mt-1">e.g. 50 = company matches 50¢ per $1 you contribute</p>
              </div>
              <div>
                <Label>Match Cap (% of salary)</Label>
                <Input type="number" min={0} max={20} step={0.5} value={matchCapPct}
                  onChange={e => setMatchCapPct(+e.target.value)} />
              </div>
              <div className="bg-[#FEF9EE] border border-[#FDE68A] rounded-lg px-3 py-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#92400E]">Your 401k /mo</span>
                  <span className="font-bold text-[#92400E]">{fmt(taxDetail.contrib401k)}</span>
                </div>
                <div className="flex justify-between text-[11px] mt-0.5">
                  <span className="text-[#92400E]">Employer Match /mo</span>
                  <span className="font-black text-[#92400E]">{fmt(taxDetail.employerMatch)}</span>
                </div>
                <div className="flex justify-between text-[11px] mt-0.5 pt-1 border-t border-[#FDE68A]">
                  <span className="font-black text-[#92400E]">Total to Portfolio /mo</span>
                  <span className="font-black text-[#92400E]">{fmt(taxDetail.contrib401k + taxDetail.employerMatch)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* 4 · Investments & Savings */}
          <Card title="4 · Investments &amp; Savings">
            <div className="space-y-3">
              <div>
                <Label>Current Portfolio Balance ($)</Label>
                <Input type="number" placeholder="e.g. 50000"
                  value={investBal} onChange={e => setInvestBal(e.target.value==='' ? '' : +e.target.value)} />
                <p className="text-[10px] text-[#718096] mt-1">Brokerage, IRA, etc. — not your 401k above.</p>
              </div>
              <div>
                <Label>Current Savings Total ($)</Label>
                <Input type="number" placeholder="e.g. 15000"
                  value={currentSavings} onChange={e => setCurrentSavings(e.target.value==='' ? '' : +e.target.value)} />
                <p className="text-[10px] text-[#718096] mt-1">Checking, HYSA, cash savings available for goals.</p>
              </div>
              <div>
                <Label>Investment Risk Profile</Label>
                <Sel value={investRisk} onChange={e => setInvestRisk(e.target.value as Risk)}>
                  <option value="low">Conservative — 4.5% avg</option>
                  <option value="medium">Moderate — 7.7% avg</option>
                  <option value="high">Aggressive — 11.0% avg</option>
                </Sel>
              </div>
              <div className="bg-[#EBF4FF] rounded-lg px-3 py-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#718096]">Liquid Assets Total</span>
                  <span className="font-black text-[#0066CC]">{fmt((+investBal||0) + (+currentSavings||0))}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* 5 · Social Security */}
          <Card title="5 · Social Security" accent="#16A34A">
            <div className="space-y-3">
              <div>
                <Label>Claim Age</Label>
                <Sel value={ssAge} onChange={e => setSsAge(+e.target.value as 65|72)}>
                  <option value={65}>Age 65 — Before FRA, reduced benefit</option>
                  <option value={72}>Age 72 — Delayed, maximum (+24% vs FRA)</option>
                </Sel>
              </div>
              <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg px-3 py-2">
                <p className="text-[10px] text-[#718096] mb-0.5">Estimated monthly benefit at age {ssAge}</p>
                <p className="text-xl font-black text-[#16A34A]">
                  {estimatedSSMonthly > 0 ? fmt(estimatedSSMonthly) + '/mo' : '—'}
                </p>
                {currentAge !== '' && annualGross > 0 && (
                  <p className="text-[10px] text-[#718096] mt-1 leading-relaxed">
                    Career modeled age 22 → retirement · 3 %/yr raises · salary bumps applied ·
                    AIME → PIA formula with age {ssAge} claim adjustment (FRA = 67)
                  </p>
                )}
              </div>
              <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg px-3 py-2 text-[10px] text-[#16A34A]">
                {ssAge === 72
                  ? 'Delaying past FRA 67 adds 8 %/yr up to age 70 (+24 % max). Benefits also grow 2.5 %/yr via COLA.'
                  : 'Claiming at 65 = 2 yrs before FRA 67, reducing your benefit ~13 %. More checks, smaller monthly amount.'}
              </div>
            </div>
          </Card>
        </div>

        {/* Row 2: Life Insurance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card title="6 · Life Insurance" accent="#C8291C">
            <div className="space-y-3">
              <div>
                <Label>Monthly Premium ($)</Label>
                <Input type="number" placeholder="e.g. 85"
                  value={lifeInsurancePremium}
                  onChange={e => setLifeInsurancePremium(e.target.value==='' ? '' : +e.target.value)} />
                <p className="text-[10px] text-[#718096] mt-1">Added to monthly expenses while alive.</p>
              </div>
              <div>
                <Label>Coverage Amount ($)</Label>
                <Input type="number" placeholder="e.g. 500000"
                  value={lifeInsuranceCoverage}
                  onChange={e => setLifeInsuranceCoverage(e.target.value==='' ? '' : +e.target.value)} />
                <p className="text-[10px] text-[#718096] mt-1">Paid out to portfolio at death. Add a Death life event below to trigger it.</p>
              </div>
              {lifeInsurancePremium !== '' && lifeInsuranceCoverage !== '' && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-[10px] text-red-700">
                  <strong>At death:</strong> {fmt(+lifeInsuranceCoverage)} payout added to portfolio · any mortgage paid off · expenses −40% · salary stops · immediate liquidation to age 90.
                </div>
              )}
            </div>
          </Card>
          <div className="hidden md:block" /> {/* spacer */}
        </div>

        {/* Row 3: Life Events */}
        <div className="bg-white rounded-xl border border-[#C8DCF7] shadow-sm p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-[#0066CC]">7 · Life Events</h3>
              <p className="text-[10px] text-[#718096] mt-0.5">Mortgage, car, marriage, children — each adds projected costs to your timeline. Property taxes default to your state of residence.</p>
            </div>
            <button onClick={openModal}
              className="bg-[#0066CC] hover:bg-[#0055B0] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shrink-0">
              + Add Event
            </button>
          </div>
          {events.length === 0
            ? <p className="text-xs text-[#718096] italic">No life events added yet.</p>
            : (
              <div className="flex flex-wrap gap-3">
                {events.map(ev => (
                  <div key={ev.id} className="flex items-center gap-3 bg-[#F5F9FF] border border-[#C8DCF7] rounded-lg px-4 py-2">
                    <div>
                      <p className="text-xs font-bold text-[#0066CC]">{ev.label}</p>
                      <p className="text-[10px] text-[#718096]">
                        {ev.startYear}
                        {ev.type==='mortgage' && ` · ${ev.state} · ${ev.creditRating} credit · ${pct(STATE_PROP_TAX_GROWTH[ev.state??'NJ']??INFLATION)} tax growth/yr`}
                        {ev.type==='car' && ` · ${fmt(ev.carPrice??0)}`}
                      </p>
                    </div>
                    <button onClick={() => setEvents(p => p.filter(x => x.id!==ev.id))} className="text-[#C8291C] text-base hover:opacity-70 ml-1 leading-none">&times;</button>
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* Row 3: Financial Bumps */}
        <div className="bg-white rounded-xl border border-[#C8DCF7] shadow-sm p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-[#16A34A]">7 · Financial Bumps</h3>
              <p className="text-[10px] text-[#718096] mt-0.5">Positive financial changes — salary increases, home value appreciation, or planned portfolio withdrawals. These update your timeline forward from the year you select.</p>
            </div>
            <button onClick={() => setShowBumpModal(true)}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shrink-0">
              + Add Bump
            </button>
          </div>
          {bumps.length === 0
            ? <p className="text-xs text-[#718096] italic">No financial bumps added yet.</p>
            : (
              <div className="flex flex-wrap gap-3">
                {bumps.map(b => {
                  const icon       = b.type === 'salary' ? '↑$' : b.type === 'home_value' ? '⌂' : b.type === 'expense' ? '📋' : b.type === 'insurance' ? '🛡️' : '↓$';
                  const color      = b.type === 'withdrawal' ? '#B45309' : b.type === 'expense' ? '#C8291C' : b.type === 'insurance' ? '#0066CC' : '#16A34A';
                  const bgColor    = b.type === 'withdrawal' ? '#FEF9EE' : b.type === 'expense' ? '#FEF2F2' : b.type === 'insurance' ? '#EBF4FF' : '#F0FDF4';
                  const borderColor = b.type === 'withdrawal' ? '#FDE68A' : b.type === 'expense' ? '#FECACA' : b.type === 'insurance' ? '#C8DCF7' : '#BBF7D0';
                  const label = b.type === 'salary'      ? `Salary → ${fmt(b.newSalary ?? 0)}/yr (${b.year})`
                    : b.type === 'home_value'  ? `Home Value → ${fmt(b.newHomeValue ?? 0)} (${b.year})`
                    : b.type === 'expense'     ? `Expenses → ${fmt(b.newExpenses ?? 0)}/mo from ${b.year}`
                    : b.type === 'insurance'   ? `Policy starts ${b.year} · ${fmt(b.insurancePremium ?? 0)}/mo · ${fmt(b.insuranceCoverage ?? 0)} coverage`
                    : `Withdrawal ${fmt(b.amount ?? 0)}${b.taxFree ? ' tax-free' : ''} (${b.year})`;
                  return (
                    <div key={b.id} className="flex items-center gap-3 rounded-lg px-4 py-2 border" style={{ background: bgColor, borderColor }}>
                      <span className="text-sm font-black" style={{ color }}>{icon}</span>
                      <div>
                        <p className="text-xs font-bold" style={{ color }}>{label}</p>
                        {b.type === 'withdrawal' && b.taxFreeReason && <p className="text-[10px] text-[#718096]">{b.taxFreeReason}</p>}
                        {b.type === 'home_value'  && <p className="text-[10px] text-[#718096]">{events.find(e => e.id === b.mortgageEventId)?.label ?? 'Property'} · reassessed value increases property tax</p>}
                        {b.type === 'salary'      && <p className="text-[10px] text-[#718096]">401k contributions + match scale with new salary</p>}
                        {b.type === 'expense'     && <p className="text-[10px] text-[#718096]">Replaces base monthly expenses from this year forward</p>}
                        {b.type === 'insurance'   && <p className="text-[10px] text-[#718096]">Premium added to monthly expenses · coverage paid out at death</p>}
                      </div>
                      <button onClick={() => setBumps(p => p.filter(x => x.id !== b.id))} className="text-[#C8291C] text-base hover:opacity-70 ml-1 leading-none">&times;</button>
                    </div>
                  );
                })}
              </div>
            )}
        </div>

        {/* Row 4: Financial Savings Goals */}
        <div className="bg-white rounded-xl border border-[#C8DCF7] shadow-sm p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-[#B45309]">8 · Financial Savings Goals</h3>
              <p className="text-[10px] text-[#718096] mt-0.5">Set specific savings targets with a deadline. Choose to fund from portfolio (deducted in target year) or save monthly (added to expenses until target date).</p>
            </div>
            <button onClick={() => setShowSavingsModal(true)}
              className="bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shrink-0">
              + Add Goal
            </button>
          </div>
          {savingsGoalEvents.length === 0
            ? <p className="text-xs text-[#718096] italic">No savings goals added yet.</p>
            : (
              <div className="flex flex-wrap gap-3">
                {savingsGoalEvents.map(sg => {
                  const nowYear = new Date().getFullYear();
                  const monthsUntil = Math.max(1, (sg.targetYear - nowYear) * 12);
                  const monthlyPayment = sg.usePortfolio ? 0 : Math.ceil(sg.targetAmount / monthsUntil);
                  return (
                    <div key={sg.id} className="flex items-center gap-3 bg-[#FEF9EE] border border-[#FDE68A] rounded-lg px-4 py-2">
                      <div>
                        <p className="text-xs font-bold text-[#B45309]">{sg.label} · {fmt(sg.targetAmount)} by {sg.targetYear}</p>
                        <p className="text-[10px] text-[#718096]">
                          {sg.usePortfolio
                            ? `Portfolio deduction in ${sg.targetYear}`
                            : `+${fmt(monthlyPayment)}/mo added to expenses until ${sg.targetYear}`}
                        </p>
                      </div>
                      <button onClick={() => setSavingsGoalEvents(p => p.filter(x => x.id !== sg.id))} className="text-[#C8291C] text-base hover:opacity-70 ml-1 leading-none">&times;</button>
                    </div>
                  );
                })}
              </div>
            )}
        </div>

        {/* ═══ RESULTS ════════════════════════════════════════════════════════ */}
        {!goals ? (
          <div className="text-center py-20 text-[#718096]">
            <div className="w-14 h-14 rounded-full bg-[#EBF4FF] flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#0066CC]" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v18h18M7 16l4-4 4 4 4-8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-sm font-bold text-[#0066CC]">Fill in <strong>Current Age</strong> and <strong>Monthly Base Expenses</strong> in Section 1 above to generate your lifetime projection.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-px flex-1 bg-[#E2E8F0]" />
              <h2 className="text-sm font-black text-[#0066CC] uppercase tracking-widest px-2">Your Financial Overview</h2>
              <div className="h-px flex-1 bg-[#E2E8F0]" />
            </div>

            {/* ── Scenario Story Buttons ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {([
                { key: 'ideal',     label: 'Financially Ideal Situation',     desc: 'High earning · on track · retirement secured', bg: '#16A34A', hbg: '#15803D', icon: '🚀' },
                { key: 'difficult', label: 'Financially Difficult Situation',  desc: 'Tight budget · income gaps · expenses climbing',  bg: '#B45309', hbg: '#92400E', icon: '⚠️' },
                { key: 'death',     label: 'Early Death Situation',            desc: 'Insurance payout · survivor benefits · legacy',   bg: '#0066CC', hbg: '#0055B0', icon: '🕊️' },
              ] as const).map(({ key, label, desc, bg, hbg, icon }) => (
                <button key={key}
                  onClick={() => setStoryMode(prev => prev === key ? null : key)}
                  className="w-full rounded-xl px-5 py-4 text-left text-white transition-all duration-150 shadow-sm"
                  style={{ background: storyMode === key ? hbg : bg, outline: storyMode === key ? `2px solid ${hbg}` : 'none', outlineOffset: 2 }}>
                  <span className="text-2xl block mb-1">{icon}</span>
                  <p className="font-black text-sm">{label}</p>
                  <p className="text-[11px] opacity-80 mt-0.5">{desc}</p>
                </button>
              ))}
            </div>

            {/* ── Ideal Story Section ── */}
            {storyMode === 'ideal' && (() => {
              const nowYear = new Date().getFullYear();
              const surplus = taxDetail.takeHome - goals.now;
              const houseGoal = savingsGoals.find(g => g.label.toLowerCase().includes('home'));
              const childEvents = events.filter(e => e.type === 'child').sort((a, b) => a.startYear - b.startYear);
              const firstBump = [...bumps].filter(b => b.type === 'salary' && (b.newSalary ?? 0) > 0).sort((a, b) => a.year - b.year)[0];
              const retMonth = retirementAge !== '' ? Math.round((+retirementAge - +currentAge) * 12) : -1;
              const retRow = retMonth >= 0 ? timeline[Math.min(retMonth, timeline.length - 1)] : null;
              const lifetimeAvgSpend = timeline.length ? Math.round(timeline.reduce((s, r) => s + r.needed, 0) / timeline.length) : 0;
              const firstGapRow = timeline.find(r => r.needed > r.afterTaxIncome && r.retirementWithdrawal === 0 && r.portfolioValue > 10_000);
              const chapters: { id: string; emoji: string; title: string; body: string; card: React.ReactNode }[] = [];

              chapters.push({
                id: 'liftoff', emoji: '🚀', title: 'Liftoff',
                body: `At ${currentAge}, our astronaut has just landed the job of a lifetime — a position at the very top of his field. The mission is clear, the trajectory is set. He's bringing home ${fmt(taxDetail.takeHome)}/mo after taxes on a ${fmt(taxDetail.gross)}/mo gross salary. After covering his essential monthly costs, he has ${fmt(Math.max(0, surplus))} left over each month to invest in the future — fuel for the long journey ahead.`,
                card: (
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Take-Home /mo', val: fmt(taxDetail.takeHome),  color: '#16A34A' },
                      { label: 'Expenses /mo',  val: fmt(goals.now),           color: '#B45309' },
                      { label: 'Gross /mo',     val: fmt(taxDetail.gross),     color: '#0066CC' },
                    ].map(({ label, val, color }) => (
                      <div key={label} className="text-center bg-[#F5F9FF] rounded-xl p-3 border border-[#C8DCF7]">
                        <p className="text-[10px] text-[#718096] uppercase font-bold mb-1">{label}</p>
                        <p className="text-lg font-black" style={{ color }}>{val}</p>
                      </div>
                    ))}
                  </div>
                ),
              });

              if (houseGoal) {
                const yrs = Math.round(houseGoal.monthsUntil / 12);
                chapters.push({
                  id: 'house', emoji: '🏠', title: 'A Home on the Horizon',
                  body: `Every astronaut needs a home base. He has his eyes set on a house — ${yrs} year${yrs !== 1 ? 's' : ''} from now — with a down payment target of ${fmt(houseGoal.target)}. He's already got ${fmt(houseGoal.covered)} saved toward it. ${houseGoal.onTrack ? `He's fully on track — no additional monthly savings required. The launchpad is funded.` : `Starting today, setting aside ${fmt(houseGoal.monthlyToSave)}/mo will get him there right on schedule.`}`,
                  card: (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: 'Down Payment Target', val: fmt(houseGoal.target),        color: '#0066CC' },
                        { label: 'Already Saved',       val: fmt(houseGoal.covered),       color: '#16A34A' },
                        { label: 'Still Needed',        val: fmt(houseGoal.stillNeeded),   color: houseGoal.onTrack ? '#16A34A' : '#B45309' },
                        { label: 'Save /mo',            val: houseGoal.onTrack ? 'On Track' : fmt(houseGoal.monthlyToSave), color: houseGoal.onTrack ? '#16A34A' : '#B45309' },
                      ].map(({ label, val, color }) => (
                        <div key={label} className="text-center bg-[#F5F9FF] rounded-xl p-3 border border-[#C8DCF7]">
                          <p className="text-[10px] text-[#718096] uppercase font-bold mb-1">{label}</p>
                          <p className="text-base font-black" style={{ color }}>{val}</p>
                        </div>
                      ))}
                    </div>
                  ),
                });
              }

              if (childEvents.length > 0) {
                const n = childEvents.length;
                const firstChildYr = childEvents[0].startYear;
                const monthlyCost = n * 500;
                chapters.push({
                  id: 'family', emoji: '👨‍👩‍👧‍👦', title: 'Mission: Family',
                  body: `He plans to fill that home with ${n === 1 ? 'a child' : `${n} children`} — the first arriving around ${firstChildYr}. With each child adding roughly $500/mo to the household, the mission budget grows by ${fmt(monthlyCost)}/mo as the crew expands. Every great explorer knows the mission is ultimately about what you leave behind.`,
                  card: (
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Crew Members',     val: `${n} child${n > 1 ? 'ren' : ''}`, color: '#0066CC' },
                        { label: 'First Arrival',    val: `${firstChildYr}`,                  color: '#16A34A' },
                        { label: 'Monthly Addition', val: fmt(monthlyCost),                   color: '#B45309' },
                      ].map(({ label, val, color }) => (
                        <div key={label} className="text-center bg-[#F5F9FF] rounded-xl p-3 border border-[#C8DCF7]">
                          <p className="text-[10px] text-[#718096] uppercase font-bold mb-1">{label}</p>
                          <p className="text-base font-black" style={{ color }}>{val}</p>
                        </div>
                      ))}
                    </div>
                  ),
                });
              }

              if (firstBump) {
                const raise = (firstBump.newSalary ?? 0) - (annualGross);
                chapters.push({
                  id: 'bonus', emoji: '🌙', title: 'Houston, He Made It to the Moon',
                  body: `In ${firstBump.year}, the mission was a resounding success — and the salary negotiation that followed reflected it. His annual compensation jumped to ${fmt((firstBump.newSalary ?? 0) / 12)}/mo gross, an increase of ${fmt(raise / 12)}/mo. In this field, performance pays. The trajectory just got steeper.`,
                  card: (
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'New Annual Salary', val: fmt(firstBump.newSalary ?? 0),  color: '#0066CC' },
                        { label: 'New Monthly Gross', val: fmt((firstBump.newSalary ?? 0) / 12), color: '#16A34A' },
                        { label: 'Salary Increase',   val: `+${fmt(raise)}`,               color: '#16A34A' },
                      ].map(({ label, val, color }) => (
                        <div key={label} className="text-center bg-[#F5F9FF] rounded-xl p-3 border border-[#C8DCF7]">
                          <p className="text-[10px] text-[#718096] uppercase font-bold mb-1">{label}</p>
                          <p className="text-base font-black" style={{ color }}>{val}</p>
                        </div>
                      ))}
                    </div>
                  ),
                });
              }

              chapters.push({
                id: 'trajectory', emoji: '📈', title: 'Lifetime Trajectory',
                body: `Pulling back to see the full arc of the mission: over his working and retirement years, the average monthly income across his entire life — take-home, Social Security, and portfolio draws combined — works out to ${fmt(goals.lifetimeAvgIncome)}/mo. His average monthly spending over the same period runs ${fmt(lifetimeAvgSpend)}/mo. That means a lifetime monthly surplus averaging ${fmt(goals.lifetimeAvgIncome - lifetimeAvgSpend)} — the financial equivalent of escape velocity.`,
                card: (
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Avg Monthly Income', val: fmt(goals.lifetimeAvgIncome),                             color: '#16A34A' },
                      { label: 'Avg Monthly Spend',  val: fmt(lifetimeAvgSpend),                                    color: '#B45309' },
                      { label: 'Avg Monthly Surplus', val: fmt(goals.lifetimeAvgIncome - lifetimeAvgSpend),         color: goals.lifetimeAvgIncome >= lifetimeAvgSpend ? '#16A34A' : '#C8291C' },
                    ].map(({ label, val, color }) => (
                      <div key={label} className="text-center bg-[#F5F9FF] rounded-xl p-3 border border-[#C8DCF7]">
                        <p className="text-[10px] text-[#718096] uppercase font-bold mb-1">{label}</p>
                        <p className="text-base font-black" style={{ color }}>{val}</p>
                      </div>
                    ))}
                  </div>
                ),
              });

              if (retRow && retirementAge !== '') {
                chapters.push({
                  id: 'retirement', emoji: '🏆', title: 'Retirement Secured',
                  body: `When he reaches retirement at age ${retirementAge}, the portfolio is worth approximately ${fmt(retRow.portfolioValue)}. Combined with an estimated Social Security benefit of ${fmt(estimatedSSMonthly)}/mo starting at age ${ssAge}, that portfolio can sustain a monthly draw of ${fmt(goals.avgRetirementDraw)}/mo — enough to maintain his lifestyle all the way through age 90. He stuck the landing.`,
                  card: (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: 'Portfolio at Retirement', val: fmt(retRow.portfolioValue),       color: '#0066CC' },
                        { label: 'Monthly Draw',            val: fmt(goals.avgRetirementDraw),     color: '#16A34A' },
                        { label: `SS at ${ssAge}`,          val: fmt(estimatedSSMonthly) + '/mo',  color: '#B45309' },
                        { label: 'Covered Through',         val: 'Age 90',                         color: '#16A34A' },
                      ].map(({ label, val, color }) => (
                        <div key={label} className="text-center bg-[#F5F9FF] rounded-xl p-3 border border-[#C8DCF7]">
                          <p className="text-[10px] text-[#718096] uppercase font-bold mb-1">{label}</p>
                          <p className="text-base font-black" style={{ color }}>{val}</p>
                        </div>
                      ))}
                    </div>
                  ),
                });
              }

              if (firstGapRow) {
                chapters.push({
                  id: 'squeeze', emoji: '🛡️', title: `The Squeeze — Age ${firstGapRow.age}`,
                  body: `In ${firstGapRow.year} (age ${firstGapRow.age}), monthly expenses of ${fmt(firstGapRow.needed)} push past take-home income of ${fmt(firstGapRow.afterTaxIncome)}. But this is precisely what he planned for. At that point his portfolio holds ${fmt(firstGapRow.portfolioValue)} — more than enough reserve to bridge the gap and keep the mission running without missing a beat. The reserves held.`,
                  card: (
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Year',              val: `${firstGapRow.year}`,              color: '#0066CC' },
                        { label: 'Expenses /mo',      val: fmt(firstGapRow.needed),            color: '#C8291C' },
                        { label: 'Portfolio Reserve', val: fmt(firstGapRow.portfolioValue),    color: '#16A34A' },
                      ].map(({ label, val, color }) => (
                        <div key={label} className="text-center bg-[#F5F9FF] rounded-xl p-3 border border-[#C8DCF7]">
                          <p className="text-[10px] text-[#718096] uppercase font-bold mb-1">{label}</p>
                          <p className="text-base font-black" style={{ color }}>{val}</p>
                        </div>
                      ))}
                    </div>
                  ),
                });
              }

              return (
                <div className="bg-white rounded-2xl border border-[#C8DCF7] shadow-sm overflow-hidden">
                  {/* Story header */}
                  <div className="bg-gradient-to-r from-[#0066CC] to-[#0055B0] px-6 py-5 text-white">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-1">Scenario Narrative</p>
                    <h3 className="text-xl font-black">The Financially Ideal Story</h3>
                    <p className="text-[12px] text-blue-200 mt-1">A high-achieving professional on an optimal financial trajectory — from liftoff to landing.</p>
                  </div>

                  <div className="divide-y divide-[#EBF4FF]">
                    {chapters.map((ch, i) => (
                      <div key={ch.id} className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="w-7 h-7 rounded-full bg-[#EBF4FF] flex items-center justify-center text-sm font-black text-[#0066CC] shrink-0">{i + 1}</span>
                          <span className="text-lg">{ch.emoji}</span>
                          <h4 className="font-black text-[#0066CC] text-base">{ch.title}</h4>
                        </div>
                        <p className="text-sm text-[#4A5568] leading-relaxed mb-4">{ch.body}</p>
                        {ch.card}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Placeholder banners for other story modes */}
            {storyMode === 'difficult' && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
                <p className="text-3xl mb-2">⚠️</p>
                <p className="font-black text-amber-800 text-lg">Financially Difficult Situation</p>
                <p className="text-sm text-amber-700 mt-1">Coming soon — narrative scenario for tight budgets and income shortfalls.</p>
              </div>
            )}
            {storyMode === 'death' && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
                <p className="text-3xl mb-2">🕊️</p>
                <p className="font-black text-[#0066CC] text-lg">Early Death Situation</p>
                <p className="text-sm text-blue-700 mt-1">Coming soon — narrative scenario covering insurance payout, survivor benefits, and estate legacy.</p>
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-[#FEF9EE] border border-[#FDE68A] rounded-xl px-4 py-3 text-[11px] text-[#92400E]">
              <strong>Disclaimer:</strong> All income figures are estimated post-tax take-home after federal income tax (2025 brackets, {filingStatus === 'married' ? '$30,000' : '$15,000'} standard deduction), {residenceState} state income tax (~{pct(STATE_INCOME_TAX[residenceState]??0)} effective rate), Social Security tax (6.2% up to {fmt(SS_WAGE_BASE)}), Medicare (1.45%), and your 401k pre-tax contribution. Expense projections are post-tax spending. Property taxes grow at {residenceState}&apos;s historical rate of ~{pct(STATE_PROP_TAX_GROWTH[residenceState]??0.025)}/yr. This tool is for illustrative purposes only and does not constitute financial, tax, or legal advice.
            </div>

            {/* ── Financial Overview Card ── */}
            <div className="bg-[#0066CC] rounded-2xl p-6 text-white">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-blue-300 mb-5">Financial Overview — Age {+currentAge} to 90</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Income column */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300 mb-2">Avg Monthly Income (Lifetime)</p>
                  <p className="text-3xl font-black text-white mb-3">{fmt(goals.lifetimeAvgIncome)}</p>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between text-blue-200">
                      <span>Salary take-home avg</span>
                      <span className="font-bold text-white">{fmt(goals.lifetimeAvgTakeHome)}</span>
                    </div>
                    {goals.lifetimeAvgSS > 0 && (
                      <div className="flex justify-between text-blue-200">
                        <span>Social Security avg (age {ssAge}+)</span>
                        <span className="font-bold text-[#4ADE80]">+{fmt(goals.lifetimeAvgSS)}</span>
                      </div>
                    )}
                    {goals.lifetimeAvgPortDraw > 0 && (
                      <div className="flex justify-between text-blue-200">
                        <span>Portfolio draw avg (retirement)</span>
                        <span className="font-bold text-[#93C5FD]">+{fmt(goals.lifetimeAvgPortDraw)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-blue-700 pt-1 mt-1">
                      <span className="font-black text-white">Total avg income /mo</span>
                      <span className="font-black text-[#FBBF24]">{fmt(goals.lifetimeAvgIncome)}</span>
                    </div>
                    <div className="h-px bg-blue-800 my-1.5" />
                    <div className="flex justify-between text-blue-300">
                      <span>Current salary take-home</span>
                      <span className="text-white">{fmt(taxDetail.takeHome)}</span>
                    </div>
                    {goals.snap5Income > 0 && (
                      <div className="flex justify-between text-blue-300">
                        <span>Take-home in 5 yrs</span>
                        <span className="text-white">{fmt(goals.snap5Income)}</span>
                      </div>
                    )}
                    {goals.snap10Income > 0 && (
                      <div className="flex justify-between text-blue-300">
                        <span>Take-home in 10 yrs</span>
                        <span className="text-white">{fmt(goals.snap10Income)}</span>
                      </div>
                    )}
                    {goals.avgRetirementDraw > 0 && (
                      <div className="flex justify-between text-blue-300">
                        <span>Avg draw in retirement</span>
                        <span className="text-[#93C5FD] font-bold">{fmt(goals.avgRetirementDraw)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Lifetime avg column */}
                <div>
                  {/* Title with hover tooltip */}
                  <div className="relative group inline-flex items-center gap-1.5 mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300">Average Monthly Lifetime Costs</p>
                    <span className="w-3.5 h-3.5 rounded-full bg-blue-700 text-blue-200 text-[9px] font-black flex items-center justify-center cursor-default shrink-0">?</span>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-[#0066CC] rounded-xl p-3 text-[11px] text-[#1A202C] leading-snug z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity shadow-xl pointer-events-none">
                      <p className="font-black text-[#0066CC] mb-1.5">How this is calculated</p>
                      <p className="mb-1">The arithmetic mean of every projected monthly expense from your current age to age 90 — <strong>{(90 - +currentAge)}</strong> years of monthly data points.</p>
                      <p className="mb-1"><strong className="text-[#B45309]">Inflation:</strong> Base expenses grow 3%/yr. Life event costs (mortgage, children, etc.) are layered in during active years.</p>
                      <p className="mb-1"><strong className="text-[#B45309]">SS offset:</strong> Social Security income reduces the needed amount from age {ssAge} onward (COLA 2.5%/yr).</p>
                      <p><strong className="text-[#B45309]">Gross NPV:</strong> All future expenses discounted to today at 5.5% — the lump sum needed to cover all spending. SS income is subtracted separately as revenue, not mixed into expenses, giving a <em>Net lifetime need</em> figure below it.</p>
                    </div>
                  </div>
                  <p className="text-3xl font-black text-white mb-3">{fmt(goals.lifetimeAvg)}</p>
                  <div className="space-y-1 text-[11px] text-blue-200">
                    <div className="flex justify-between">
                      <span>Today&apos;s expenses</span><span className="text-white font-bold">{fmt(goals.now)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Year 5 monthly expenses</span><span className="text-white">{fmt(goals.snap5)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Year 10 monthly expenses</span><span className="text-white">{fmt(goals.snap10)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Year 20 monthly expenses</span><span className="text-white">{fmt(goals.snap20)}</span>
                    </div>
                    <div className="flex justify-between border-t border-blue-700 pt-1 mt-1">
                      <span>Gross lifetime expenses NPV</span><span className="text-white">${(goals.lifeNpv/1_000_000).toFixed(2)}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#4ADE80]">− SS income PV (age {ssAge}+)</span><span className="text-[#4ADE80]">− ${(goals.ssNpv/1_000_000).toFixed(2)}M</span>
                    </div>
                    <div className="flex justify-between border-t border-blue-700 pt-1 mt-1">
                      <span className="font-black text-white">Net lifetime need (after SS)</span><span className="font-black text-[#FBBF24]">${(goals.netLifeNpv/1_000_000).toFixed(2)}M</span>
                    </div>
                  </div>
                </div>

                {/* Lifetime revenue vs expenses */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300 mb-2">Lifetime Revenue vs. Expenses</p>
                  <p className={`text-3xl font-black mb-1 ${goals.lifetimeAvgGap >= 0 ? 'text-[#4ADE80]' : 'text-[#F87171]'}`}>
                    {goals.lifetimeAvgGap >= 0 ? '+' : ''}{fmt(goals.lifetimeAvgGap)}
                    <span className="text-base font-normal text-blue-300">/mo avg</span>
                  </p>
                  <p className={`text-[10px] mb-3 ${goals.lifetimeAvgGap >= 0 ? 'text-[#4ADE80]' : 'text-[#F87171]'}`}>
                    {goals.lifetimeAvgGap >= 0 ? 'Lifetime surplus — on track' : 'Lifetime shortfall — plan adjustments needed'}
                  </p>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between text-blue-200">
                      <span>Take-home avg /mo</span>
                      <span className="text-white font-bold">{fmt(goals.lifetimeAvgTakeHome)}</span>
                    </div>
                    {goals.lifetimeAvgSS > 0 && (
                      <div className="flex justify-between text-blue-200">
                        <span>SS income avg /mo</span>
                        <span className="text-[#4ADE80] font-bold">+{fmt(goals.lifetimeAvgSS)}</span>
                      </div>
                    )}
                    {goals.lifetimeAvgPortDraw > 0 && (
                      <div className="flex justify-between text-blue-200">
                        <span>Portfolio draw avg /mo</span>
                        <span className="text-[#93C5FD] font-bold">+{fmt(goals.lifetimeAvgPortDraw)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-blue-700 pt-1 mt-1">
                      <span className="font-black text-white">Total avg income /mo</span>
                      <span className="text-white font-bold">{fmt(goals.lifetimeAvgIncome)}</span>
                    </div>
                    <div className="flex justify-between text-blue-200">
                      <span>Average monthly lifetime costs</span>
                      <span className="text-white font-bold">− {fmt(goals.lifetimeAvg)}</span>
                    </div>
                    <div className="flex justify-between border-t border-blue-700 pt-1 mt-1">
                      <span className="font-black text-white">Net monthly avg</span>
                      <span className={`font-black ${goals.lifetimeAvgGap >= 0 ? 'text-[#4ADE80]' : 'text-[#F87171]'}`}>
                        {goals.lifetimeAvgGap >= 0 ? '+' : ''}{fmt(goals.lifetimeAvgGap)}
                      </span>
                    </div>
                    <div className="flex justify-between text-blue-200 pt-1">
                      <span>Liquid assets</span>
                      <span className="text-white font-bold">{fmt((+investBal||0)+(+currentSavings||0))}</span>
                    </div>
                    <div className="flex justify-between border-t border-blue-700 pt-1 mt-1">
                      <span className="font-black text-white">Still to save for goals</span>
                      <span className={`font-black ${savingsGoals.some(g => !g.onTrack) ? 'text-[#FBBF24]' : 'text-[#4ADE80]'}`}>
                        {fmt(savingsGoals.reduce((s,g) => s+g.stillNeeded, 0))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 5-Year Near-Term Overview ── */}
            {(() => {
              const slice5 = timeline.slice(0, 60);
              if (!slice5.length) return null;
              const avg = (arr: number[]) => Math.round(arr.reduce((s,v) => s+v, 0) / arr.length);
              const avgIncome5   = avg(slice5.map(r => r.afterTaxIncome + r.ssOffset + r.retirementWithdrawal));
              const avgRetDraw5  = avg(slice5.map(r => r.retirementWithdrawal));
              const avgSavings5  = avg(slice5.map(r => r.monthlySavingsPayments));
              const avgCosts5    = avg(slice5.map(r => r.needed));
              const avgGap5      = avgIncome5 - avgCosts5;
              const gapColor5    = avgGap5 >= 0 ? '#16A34A' : '#C8291C';
              return (
                <div className="bg-white border border-[#C8DCF7] rounded-2xl p-6">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-[#0066CC] mb-5">5-Year Near-Term Snapshot — Next 5 Years</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Avg income */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#4A90D9] mb-2">Avg Monthly Income</p>
                      <p className="text-3xl font-black text-[#0066CC] mb-3">{fmt(avgIncome5)}</p>
                      <div className="space-y-1 text-[11px] text-[#64748B]">
                        <div className="flex justify-between"><span>Take-home avg</span><span className="text-[#1A202C] font-bold">{fmt(avg(slice5.map(r => r.afterTaxIncome)))}</span></div>
                        <div className="flex justify-between"><span>SS income avg</span><span className="text-[#16A34A] font-bold">+{fmt(avg(slice5.map(r => r.ssOffset)))}</span></div>
                        {avgRetDraw5 > 0 && <div className="flex justify-between"><span>Portfolio draw avg</span><span className="text-[#0066CC] font-bold">+{fmt(avgRetDraw5)}</span></div>}
                        <div className="flex justify-between border-t border-[#C8DCF7] pt-1 mt-1">
                          <span className="font-black text-[#0066CC]">Total avg revenue</span>
                          <span className="font-black text-[#0066CC]">{fmt(avgIncome5)}</span>
                        </div>
                      </div>
                    </div>
                    {/* Avg costs */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#4A90D9] mb-2">Avg Monthly Costs</p>
                      <p className="text-3xl font-black text-[#0066CC] mb-3">{fmt(avgCosts5)}</p>
                      <div className="space-y-1 text-[11px] text-[#64748B]">
                        <div className="flex justify-between"><span>Base + life events avg</span><span className="text-[#1A202C] font-bold">{fmt(avgCosts5 - avgSavings5)}</span></div>
                        {avgSavings5 > 0 && <div className="flex justify-between"><span>Desired savings /mo</span><span className="text-[#B45309] font-bold">+{fmt(avgSavings5)}</span></div>}
                        <div className="flex justify-between border-t border-[#C8DCF7] pt-1 mt-1">
                          <span className="font-black text-[#0066CC]">Total avg costs</span>
                          <span className="font-black text-[#1A202C]">{fmt(avgCosts5)}</span>
                        </div>
                      </div>
                    </div>
                    {/* Net */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#4A90D9] mb-2">5-Year Net Monthly</p>
                      <p className="text-3xl font-black mb-1" style={{ color: gapColor5 }}>
                        {avgGap5 >= 0 ? '+' : ''}{fmt(avgGap5)}
                        <span className="text-base font-normal text-[#64748B]">/mo</span>
                      </p>
                      <p className="text-[10px] mb-3" style={{ color: gapColor5 }}>
                        {avgGap5 >= 0 ? 'On track for next 5 years' : 'Budget gap — review expenses or income'}
                      </p>
                      <div className="space-y-1 text-[11px] text-[#64748B]">
                        <div className="flex justify-between"><span>Avg revenue</span><span className="text-[#1A202C] font-bold">{fmt(avgIncome5)}</span></div>
                        <div className="flex justify-between"><span>Avg costs</span><span className="text-[#1A202C] font-bold">− {fmt(avgCosts5)}</span></div>
                        <div className="flex justify-between border-t border-[#C8DCF7] pt-1 mt-1">
                          <span className="font-black text-[#0066CC]">Net /mo avg</span>
                          <span className="font-black" style={{ color: gapColor5 }}>{avgGap5 >= 0 ? '+' : ''}{fmt(avgGap5)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ── Savings Goals Card ── */}
            {savingsGoals.length > 0 && (
              <div className="bg-white rounded-xl border border-[#C8DCF7] shadow-sm p-5">
                <button onClick={() => setShowSavingsCard(v => !v)} className="flex items-center justify-between w-full text-left mb-0">
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-widest text-[#0066CC]">Savings Goals</h3>
                    {!showSavingsCard && <p className="text-[11px] text-[#718096] mt-0.5">How much you need to save (or add to 401k/savings) to fund each upcoming purchase event.</p>}
                  </div>
                  <span className="text-[#0066CC] text-lg leading-none shrink-0 ml-3">{showSavingsCard ? '−' : '+'}</span>
                </button>
                {showSavingsCard && <div className="space-y-4 mt-4">
                  {savingsGoals.map((g, i) => (
                    <div key={i} className={`rounded-xl border p-4 ${g.onTrack ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <p className="text-sm font-black text-[#0066CC]">{g.label}</p>
                          <p className="text-[11px] text-[#718096]">{Math.round(g.monthsUntil / 12)} yr {g.monthsUntil % 12} mo until event</p>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${g.onTrack ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {g.onTrack ? 'On Track' : 'Savings Needed'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="text-center bg-white rounded-lg p-2.5 border border-[#C8DCF7]">
                          <p className="text-[10px] text-[#718096] uppercase font-bold">Target</p>
                          <p className="text-base font-black text-[#0066CC]">{fmt(g.target)}</p>
                          <p className="text-[10px] text-[#718096]">down payment</p>
                        </div>
                        <div className="text-center bg-white rounded-lg p-2.5 border border-[#C8DCF7]">
                          <p className="text-[10px] text-[#718096] uppercase font-bold">Covered</p>
                          <p className="text-base font-black text-green-600">{fmt(g.covered)}</p>
                          <p className="text-[10px] text-[#718096]">from liquid assets</p>
                        </div>
                        <div className={`text-center rounded-lg p-2.5 border ${g.onTrack ? 'bg-green-100 border-green-200' : 'bg-amber-100 border-amber-200'}`}>
                          <p className="text-[10px] text-[#718096] uppercase font-bold">Still Needed</p>
                          <p className={`text-base font-black ${g.onTrack ? 'text-green-600' : 'text-amber-700'}`}>{g.onTrack ? '—' : fmt(g.stillNeeded)}</p>
                          <p className="text-[10px] text-[#718096]">to accumulate</p>
                        </div>
                        <div className={`text-center rounded-lg p-2.5 border ${g.onTrack ? 'bg-green-100 border-green-200' : 'bg-[#FEF9EE] border-[#FDE68A]'}`}>
                          <p className="text-[10px] text-[#718096] uppercase font-bold">Save Monthly</p>
                          <p className={`text-base font-black ${g.onTrack ? 'text-green-600' : 'text-[#B45309]'}`}>{g.onTrack ? '—' : fmt(g.monthlyToSave)}</p>
                          <p className="text-[10px] text-[#718096]">{g.onTrack ? 'fully covered' : `≈ ${g.extra401kPct}% salary to 401k/savings`}</p>
                        </div>
                      </div>
                      {!g.onTrack && (
                        <div className="mt-3 bg-white rounded-lg px-4 py-2.5 border border-[#C8DCF7] text-[11px] text-[#718096]">
                          <strong className="text-[#B45309]">Recommendation:</strong> Increase monthly savings by <strong className="text-[#0066CC]">{fmt(g.monthlyToSave)}</strong> — equivalent to adding ~{g.extra401kPct}% of your salary to a 401k or HYSA. With your current {contrib401kPct}% 401k contribution, target {contrib401kPct + g.extra401kPct}% total.
                        </div>
                      )}
                    </div>
                  ))}
                  {savingsGoals.every(g => g.onTrack) && (
                    <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
                      <strong>All savings goals fully covered</strong> by your current liquid assets. No additional contributions required for planned down payments.
                    </div>
                  )}
                </div>}
              </div>
            )}

            {/* Tax breakdown */}
            <div className="bg-white rounded-xl border border-[#C8DCF7] shadow-sm p-5">
              <h3 className="font-black text-sm uppercase tracking-widest text-[#0066CC] mb-4">Monthly Tax Breakdown</h3>
              <div className="space-y-0.5">
                <TaxRow label="Gross Monthly Income" value={fmt(taxDetail.gross)} color="#0066CC" bold />
                <div className="h-px bg-[#E2E8F0] my-1.5" />
                <TaxRow label={`Federal Income Tax (${filingStatus})`}  value={`- ${fmt(taxDetail.federal)}`}  color="#C8291C" />
                <TaxRow label={`${residenceState} State Income Tax (~${pct(STATE_INCOME_TAX[residenceState]??0)})`} value={`- ${fmt(taxDetail.state)}`} color="#C8291C" />
                <TaxRow label="FICA (SS 6.2% + Medicare 1.45%)"         value={`- ${fmt(taxDetail.fica)}`}    color="#C8291C" />
                <TaxRow label={`401k Contribution (${contrib401kPct}%)`} value={`- ${fmt(taxDetail.contrib401k)}`} color="#B45309" />
                <div className="h-px bg-[#E2E8F0] my-1.5" />
                <TaxRow label="Est. Monthly Take-Home" value={fmt(taxDetail.takeHome)} color="#16A34A" bold />
                <TaxRow label={`+ Employer 401k Match (${matchPct}% up to ${matchCapPct}% salary)`} value={`+ ${fmt(taxDetail.employerMatch)}`} color="#B45309" />
              </div>
            </div>

            {/* 5-year ramp */}
            <div className="bg-white rounded-xl border border-[#C8DCF7] shadow-sm p-5">
              <h3 className="font-black text-sm uppercase tracking-widest text-[#B45309] mb-1">5-Year Salary Goal Plan</h3>
              <p className="text-xs text-[#718096] mb-4">Gross income targets needed to cover all expenses after tax, by year. Green = current income covers it.</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[1,2,3,4,5].map(yr => {
                  const sl  = timeline.slice((yr-1)*12, yr*12);
                  const avg = sl.length ? Math.round(sl.reduce((s,r) => s+r.needed, 0)/sl.length) : 0;
                  const ok  = taxDetail.takeHome >= avg;
                  return (
                    <div key={yr} className={`rounded-xl p-3 text-center border ${ok ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                      <p className="text-[10px] font-bold uppercase text-[#718096]">Year {yr}</p>
                      <p className={`text-base font-black ${ok ? 'text-green-700' : 'text-red-700'}`}>{fmt(avg*12)}/yr</p>
                      <p className={`text-[10px] ${ok ? 'text-green-600' : 'text-red-600'}`}>{fmt(avg)}/mo</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mortgage detail card */}
            {events.some(e => e.type==='mortgage') && (
              <div className="bg-white rounded-xl border border-[#C8DCF7] shadow-sm p-5">
                <button onClick={() => setShowMortgageOverview(v => !v)} className="flex items-center justify-between w-full text-left mb-0">
                  <h3 className="font-black text-sm uppercase tracking-widest text-[#0066CC]">Mortgage Breakdown</h3>
                  <span className="text-[#0066CC] text-lg leading-none">{showMortgageOverview ? '−' : '+'}</span>
                </button>
                {showMortgageOverview && events.filter(e => e.type==='mortgage').map(ev => {
                  const p   = (ev.homePrice??400000) * (1-(ev.downPct??0.2));
                  const r   = MORTGAGE_RATES[ev.creditRating??'medium'];
                  const pmt = calcMortgagePmt(p, r, ev.mortgageYears??30);
                  const bt  = ((ev.homePrice??400000) * (STATE_PROP_TAX[ev.state??'NJ']??0.018)) / 12;
                  const gr  = STATE_PROP_TAX_GROWTH[ev.state??'NJ'] ?? INFLATION;
                  const tax10 = bt * Math.pow(1+gr, 10);
                  return (
                    <div key={ev.id} className="grid grid-cols-2 md:grid-cols-6 gap-3 bg-[#F5F9FF] rounded-xl p-4 mb-2">
                      {[
                        ['Home Price',       fmt(ev.homePrice??0)],
                        ['Down Pmt',         fmt((ev.homePrice??0)*(ev.downPct??0.2))],
                        ['Rate',             `${pct(r)} (${ev.creditRating})`],
                        ['P&I /mo',          fmt(Math.round(pmt))],
                        [`Year-1 Tax (${ev.state})`, fmt(Math.round(bt))],
                        [`Year-10 Tax (~${pct(gr)}/yr)`, fmt(Math.round(tax10))],
                      ].map(([label, val]) => (
                        <div key={label} className="text-center">
                          <p className="text-[10px] text-[#718096] uppercase font-bold">{label}</p>
                          <p className="text-sm font-black text-[#0066CC]">{val}</p>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}


            {/* Year-by-year table */}
            <div className="bg-white rounded-xl border border-[#C8DCF7] shadow-sm p-5">
              <h3 className="font-black text-sm uppercase tracking-widest text-[#0066CC] mb-4">Year-by-Year Projection</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs" style={{ minWidth: (showMortgageDetail ? 200 : 0) + (showPortfolioDetail ? 200 : 0) + 1100 + 'px' }}>
                  <thead>
                    <tr className="border-b border-[#C8DCF7]">
                      <th className="py-2 px-2 text-left text-[10px] font-bold uppercase text-[#718096] whitespace-nowrap">Age</th>
                      <th className="py-2 px-2 text-left text-[10px] font-bold uppercase text-[#718096] whitespace-nowrap">Year</th>
                      <th className="py-2 px-2 text-left text-[10px] font-bold uppercase text-[#C8291C] whitespace-nowrap">Necessary /mo</th>
                      <th className="py-2 px-2 text-left text-[10px] font-bold uppercase text-[#16A34A] whitespace-nowrap">Savings /mo</th>

                      {/* Mortgage column + toggle */}
                      <th className="py-2 px-2 text-left text-[10px] font-bold uppercase text-[#0066CC] whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          Mortgage Expense
                          <button onClick={() => setShowMortgageDetail(v => !v)}
                            title={showMortgageDetail ? 'Collapse' : 'Expand P&I + Tax'}
                            className="w-4 h-4 rounded-full bg-[#0066CC] text-white text-[9px] font-black flex items-center justify-center leading-none hover:bg-[#0055B0] shrink-0">
                            {showMortgageDetail ? '−' : '+'}
                          </button>
                        </span>
                      </th>
                      {showMortgageDetail && <>
                        <th className="py-2 px-2 text-left text-[10px] font-bold uppercase text-[#718096] bg-[#EBF4FF] whitespace-nowrap">P&amp;I /mo</th>
                        <th className="py-2 px-2 text-left text-[10px] font-bold uppercase text-[#718096] bg-[#EBF4FF] whitespace-nowrap">Prop Tax /mo</th>
                      </>}

                      <th className="py-2 px-2 text-left text-[10px] font-bold uppercase text-green-700 whitespace-nowrap">Take-Home /mo</th>
                      <th className="py-2 px-2 text-left text-[10px] font-bold uppercase text-[#718096] whitespace-nowrap">SS Offset /mo</th>
                      {retirementAge !== '' && <th className="py-2 px-2 text-left text-[10px] font-bold uppercase text-[#0066CC] whitespace-nowrap">Portfolio Draw /mo</th>}
                      <th className="py-2 px-2 text-left text-[10px] font-bold uppercase text-[#718096] whitespace-nowrap">Net Gap /mo</th>
                      <th className="py-2 px-2 text-left text-[10px] font-bold uppercase text-[#4A5568] whitespace-nowrap bg-[#F8FAFC]">Expense Gap</th>
                      <th className="py-2 px-2 text-left text-[10px] font-bold uppercase text-[#16A34A] whitespace-nowrap bg-[#F8FAFC]">Savings Gap</th>
                      <th className="py-2 px-2 text-left text-[10px] font-bold uppercase text-[#C8291C] whitespace-nowrap">Debt Balance</th>

                      {/* Savings & Portfolio column + toggle */}
                      <th className="py-2 px-2 text-left text-[10px] font-bold uppercase text-[#16A34A] whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          Savings &amp; Portfolio
                          <button onClick={() => setShowPortfolioDetail(v => !v)}
                            title={showPortfolioDetail ? 'Collapse' : 'Expand: interest vs annual contributions'}
                            className="w-4 h-4 rounded-full bg-[#16A34A] text-white text-[9px] font-black flex items-center justify-center leading-none hover:bg-[#15803D] shrink-0">
                            {showPortfolioDetail ? '−' : '+'}
                          </button>
                        </span>
                      </th>
                      {showPortfolioDetail && <>
                        <th className="py-2 px-2 text-left text-[10px] font-bold uppercase text-[#718096] bg-[#F0FDF4] whitespace-nowrap">Compounding Gains</th>
                        <th className="py-2 px-2 text-left text-[10px] font-bold uppercase text-[#718096] bg-[#F0FDF4] whitespace-nowrap">Added This Year</th>
                      </>}

                      <th className="py-2 px-2 text-left text-[10px] font-bold uppercase text-[#718096] whitespace-nowrap">Events</th>
                    </tr>
                  </thead>
                  <tbody>
                    {annual.map((row, i) => {
                      const totalInc  = row.afterTaxIncome + row.ssOffset + row.retirementWithdrawal;
                      const necessary = row.needed - row.monthlySavingsPayments;
                      const netGap    = totalInc - row.needed;
                      const expGap    = totalInc - necessary;
                      const savGap    = -row.monthlySavingsPayments;
                      const hasMort   = row.mortgagePnI > 0 || row.mortgagePropTax > 0;
                      const hasEvent  = row.events.length > 0;
                      return (
                        <tr key={i} className={`border-b border-[#F5F9FF] hover:bg-[#F5F9FF] ${hasEvent ? 'bg-[#FEF9EE]' : ''} ${row.debtBalance > 0 ? 'border-l-2 border-l-red-400' : ''}`}>
                          <td className="py-1.5 px-2 font-bold text-[#0066CC]">{row.age}</td>
                          <td className="py-1.5 px-2 text-[#718096]">{row.year}</td>
                          <td className="py-1.5 px-2 font-bold text-[#C8291C]">{fmt(necessary)}</td>
                          <td className="py-1.5 px-2 font-bold text-[#16A34A]">{row.monthlySavingsPayments > 0 ? fmt(row.monthlySavingsPayments) : '—'}</td>

                          <td className="py-1.5 px-2 font-bold text-[#0066CC]">
                            {hasMort ? fmt(row.mortgagePnI + row.mortgagePropTax) : '—'}
                          </td>
                          {showMortgageDetail && <>
                            <td className="py-1.5 px-2 text-[#0066CC] bg-[#F0F4FF]">{hasMort ? fmt(row.mortgagePnI) : '—'}</td>
                            <td className="py-1.5 px-2 text-[#718096] bg-[#F0F4FF]">{hasMort ? fmt(row.mortgagePropTax) : '—'}</td>
                          </>}

                          <td className="py-1.5 px-2 text-green-700 font-bold">{fmt(row.afterTaxIncome)}</td>
                          <td className="py-1.5 px-2 text-green-700 font-bold">{row.ssOffset > 0 ? fmt(row.ssOffset) : '—'}</td>
                          {retirementAge !== '' && <td className="py-1.5 px-2 text-[#0066CC] font-bold">{row.retirementWithdrawal > 0 ? fmt(row.retirementWithdrawal) : '—'}</td>}
                          <td className={`py-1.5 px-2 font-bold ${netGap >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {netGap >= 0 ? '+' : ''}{fmt(netGap)}
                          </td>
                          <td className={`py-1.5 px-2 font-bold text-[10px] bg-[#F8FAFC] ${expGap >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {expGap >= 0 ? '+' : ''}{fmt(expGap)}
                          </td>
                          <td className="py-1.5 px-2 text-[10px] bg-[#F8FAFC] text-[#16A34A] font-bold">
                            {savGap < 0 ? fmt(savGap) : '—'}
                          </td>
                          <td className={`py-1.5 px-2 font-bold ${row.debtBalance > 0 ? 'text-[#C8291C]' : 'text-[#718096]'}`}>
                            {row.debtBalance > 0 ? fmt(row.debtBalance) : '—'}
                          </td>

                          <td className="py-1.5 px-2 text-[#B45309] font-bold">{fmt(row.portfolioValue)}</td>
                          {showPortfolioDetail && <>
                            <td className="py-1.5 px-2 text-[#16A34A] font-bold bg-[#F0FDF4]">{fmt(row.portfolioGrowth)}</td>
                            <td className="py-1.5 px-2 text-[#718096] bg-[#F0FDF4]">{fmt(row.annualContrib)}</td>
                          </>}

                          <td className="py-1.5 px-2 text-[#C8291C] font-bold">{row.events.join(', ')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Methodology */}
            <div className="bg-white rounded-xl border border-[#C8DCF7] shadow-sm p-5">
              <h3 className="font-black text-[11px] uppercase tracking-widest text-[#718096] mb-3">Methodology &amp; Assumptions</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-1.5 text-[11px] text-[#718096]">
                {[
                  ['Discount Rate',      '5.5% (10-yr Treasury)'],
                  ['Debt Interest Rate', '27% APR compounded monthly (credit-card avg)'],
                  ['Inflation',          '3.0% annual on expenses'],
                  ['SS COLA',            '2.5% annual'],
                  ['Federal Std Ded.',   `${filingStatus==='married'?'$30,000 MFJ':'$15,000 Single'} (2025)`],
                  ['State Income Tax',   `${residenceState}: ~${pct(STATE_INCOME_TAX[residenceState]??0)} eff. rate`],
                  ['FICA',               '6.2% SS + 1.45% Medicare'],
                  [`${residenceState} Prop Tax Rate`, pct(STATE_PROP_TAX[residenceState]??0)],
                  [`${residenceState} Tax Growth`,    `${pct(STATE_PROP_TAX_GROWTH[residenceState]??0)}/yr (historical avg)`],
                  ['Mortgage — Low',     '8.25% (poor credit)'],
                  ['Mortgage — Medium',  '6.99% (avg credit)'],
                  ['Mortgage — High',    '6.25% (excellent)'],
                  ['Auto Loan Rate',     '6.5% avg'],
                  ['Child Cost',         `${fmt(CHILD_MONTHLY)}/mo for 18 yrs`],
                  ['Marriage Cost',      `${fmt(MARRIAGE_BOOST)}/mo ongoing`],
                ].map(([k,v]) => (
                  <div key={k} className="flex gap-1.5">
                    <span className="font-bold text-[#4A5568] shrink-0">{k}:</span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] italic text-[#A0AEC0] mt-3">State income tax rates are approximate effective rates. For exact calculations, consult a licensed CPA. This tool does not constitute financial, tax, or legal advice.</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Add Event Modal ─────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target===e.currentTarget) setShowModal(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-[#0066CC] text-lg">Add Life Event</h2>
              <button onClick={() => setShowModal(false)} className="text-[#718096] hover:text-[#1A202C] text-2xl leading-none">&times;</button>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Event Type</Label>
                <Sel value={newType} onChange={e => setNewType(e.target.value as EventType)}>
                  <option value="mortgage">Buy a Home</option>
                  <option value="car">Buy a Car</option>
                  <option value="marriage">Marriage</option>
                  <option value="child">Have a Child</option>
                  <option value="death">Death of Primary Earner</option>
                </Sel>
              </div>
              <div>
                <Label>Year</Label>
                <Input type="number" value={newYear} onChange={e => setNewYear(+e.target.value)}
                  min={new Date().getFullYear()} max={new Date().getFullYear()+50} />
              </div>

              {newType === 'mortgage' && <>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Home Price ($)</Label><Input type="number" value={homePrice} onChange={e => setHomePrice(+e.target.value)} /></div>
                  <div><Label>Down Payment (%)</Label><Input type="number" value={downPct} onChange={e => setDownPct(+e.target.value)} min={3} max={100} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Credit Rating</Label>
                    <Sel value={creditRating} onChange={e => setCreditRating(e.target.value as Credit)}>
                      <option value="low">Low — 8.25%</option>
                      <option value="medium">Medium — 6.99%</option>
                      <option value="high">Excellent — 6.25%</option>
                    </Sel>
                  </div>
                  <div>
                    <Label>Loan Term</Label>
                    <Sel value={mortgageYrs} onChange={e => setMortgageYrs(+e.target.value)}>
                      {[15,20,30].map(n => <option key={n} value={n}>{n} years</option>)}
                    </Sel>
                  </div>
                </div>
                <div>
                  <Label>Property State</Label>
                  <Sel value={propState} onChange={e => setPropState(e.target.value)}>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </Sel>
                </div>
                <div className="bg-[#EBF4FF] rounded-lg px-4 py-3 text-xs text-[#0066CC] space-y-1">
                  <div className="flex justify-between"><span>Rate:</span><strong>{mortPreview.rate}</strong></div>
                  <div className="flex justify-between"><span>P&amp;I /mo:</span><strong>{fmt(mortPreview.pmt)}</strong></div>
                  <div className="flex justify-between"><span>Year-1 property tax /mo:</span><strong>{fmt(mortPreview.baseTax)}</strong></div>
                  <div className="flex justify-between"><span>Tax grows ~{mortPreview.taxGrowth}/yr (historical {propState}):</span><strong>{fmt(mortPreview.baseTax * Math.pow(1+(STATE_PROP_TAX_GROWTH[propState]??INFLATION), 10))}/mo by yr 10</strong></div>
                  <div className="flex justify-between border-t border-[#C7D7F5] pt-1"><span>Year-1 total /mo:</span><strong>{fmt(mortPreview.pmt + mortPreview.baseTax)}</strong></div>
                </div>
              </>}

              {newType === 'car' && (
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Vehicle Price ($)</Label><Input type="number" value={carPrice} onChange={e => setCarPrice(+e.target.value)} /></div>
                  <div>
                    <Label>Loan Term</Label>
                    <Sel value={loanYrs} onChange={e => setLoanYrs(+e.target.value)}>
                      {[3,4,5,6,7].map(n => <option key={n} value={n}>{n} years</option>)}
                    </Sel>
                  </div>
                </div>
              )}

              {newType === 'child' && (
                <div className="bg-[#EBF4FF] rounded-lg px-4 py-3 text-xs text-[#0066CC]">
                  Estimated child cost: <strong>{fmt(CHILD_MONTHLY)}/mo</strong> for 18 years, inflation-adjusted.
                </div>
              )}
              {newType === 'marriage' && (
                <div className="bg-[#EBF4FF] rounded-lg px-4 py-3 text-xs text-[#0066CC]">
                  Estimated ongoing joint spending increase: <strong>{fmt(MARRIAGE_BOOST)}/mo</strong>, inflation-adjusted.
                </div>
              )}
              {newType === 'death' && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-xs text-red-700 space-y-1">
                  <p className="font-black">At the selected year:</p>
                  <p>· Salary income stops immediately</p>
                  <p>· Life insurance coverage ({lifeInsuranceCoverage !== '' ? fmt(+lifeInsuranceCoverage) : 'set in Life Insurance card'}) is added to the portfolio</p>
                  <p>· Any outstanding mortgage balance is paid off from the payout</p>
                  <p>· All expenses reduce by 40%</p>
                  <p>· Social Security ceases; portfolio liquidation begins immediately to age 90</p>
                </div>
              )}

              <button onClick={addEvent}
                className="w-full bg-[#0066CC] hover:bg-[#0055B0] text-white font-black py-3 rounded-xl text-sm transition-colors">
                Add to Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Financial Bump Modal ─────────────────────────────────────────── */}
      {showBumpModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target===e.currentTarget) setShowBumpModal(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-[#0066CC] text-lg">Add Financial Bump</h2>
              <button onClick={() => setShowBumpModal(false)} className="text-[#718096] hover:text-[#1A202C] text-2xl leading-none">&times;</button>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Bump Type</Label>
                <Sel value={bumpType} onChange={e => setBumpType(e.target.value as BumpType)}>
                  <option value="salary">Salary Increase</option>
                  <option value="expense">Expense Change</option>
                  <option value="insurance">Start Insurance Policy</option>
                  <option value="home_value">Home Value Appreciation</option>
                  <option value="withdrawal">Portfolio Withdrawal</option>
                </Sel>
              </div>
              <div>
                <Label>Year</Label>
                <Input type="number" value={bumpYear} onChange={e => setBumpYear(+e.target.value)}
                  min={new Date().getFullYear()} max={new Date().getFullYear()+50} />
              </div>

              {bumpType === 'salary' && (
                <div>
                  <Label>New Annual Salary ($)</Label>
                  <Input type="number" placeholder="e.g. 120000" value={bumpNewSalary || ''} onChange={e => setBumpNewSalary(e.target.value==='' ? '' : +e.target.value)} />
                  {(+bumpNewSalary||0) > 0 && annualGross > 0 && (
                    <p className="text-[11px] text-[#16A34A] mt-1 font-bold">
                      +{fmt(((+bumpNewSalary) - annualGross) / 12)}/mo gross increase
                    </p>
                  )}
                  <div className="bg-[#F0FDF4] rounded-lg px-4 py-3 text-xs text-[#16A34A] mt-2">
                    Your 401k contributions and employer match will scale with the new salary from this year forward.
                  </div>
                </div>
              )}

              {bumpType === 'expense' && (
                <div>
                  <Label>New Monthly Base Expenses ($)</Label>
                  <Input type="number" placeholder={`e.g. ${Math.round((+baseExpenses||3000) * 1.2)}`}
                    value={bumpNewExpenses||''} onChange={e => setBumpNewExpenses(e.target.value==='' ? '' : +e.target.value)} />
                  {(+bumpNewExpenses||0) > 0 && (+baseExpenses||0) > 0 && (
                    <p className={`text-[11px] mt-1 font-bold ${+bumpNewExpenses > +baseExpenses ? 'text-[#C8291C]' : 'text-[#16A34A]'}`}>
                      {+bumpNewExpenses > +baseExpenses ? '+' : ''}{fmt(+bumpNewExpenses - +baseExpenses)}/mo vs today&apos;s expenses
                    </p>
                  )}
                  <div className="bg-[#FEF2F2] rounded-lg px-4 py-3 text-xs text-[#C8291C] mt-2">
                    This replaces your base monthly expenses from the selected year forward. Life events (mortgage, children, marriage) still add on top of this new base.
                  </div>
                </div>
              )}

              {bumpType === 'insurance' && (
                <>
                  <div>
                    <Label>Monthly Premium ($)</Label>
                    <Input type="number" placeholder="e.g. 120"
                      value={bumpInsurancePremium||''} onChange={e => setBumpInsurancePremium(e.target.value==='' ? '' : +e.target.value)} />
                  </div>
                  <div>
                    <Label>Coverage Amount ($)</Label>
                    <Input type="number" placeholder="e.g. 500000"
                      value={bumpInsuranceCoverage||''} onChange={e => setBumpInsuranceCoverage(e.target.value==='' ? '' : +e.target.value)} />
                    {(+bumpInsurancePremium||0) > 0 && (+bumpInsuranceCoverage||0) > 0 && (
                      <p className="text-[11px] text-[#0066CC] mt-1 font-bold">
                        Coverage ratio: {Math.round(+bumpInsuranceCoverage / +bumpInsurancePremium / 12)}× annual premium
                      </p>
                    )}
                  </div>
                  <div className="bg-[#EBF4FF] rounded-lg px-4 py-3 text-xs text-[#0066CC]">
                    Monthly premium will be added to expenses from the selected year. The full coverage amount is paid into the portfolio at death (if after policy start).
                  </div>
                </>
              )}

              {bumpType === 'home_value' && (
                <>
                  <div>
                    <Label>Property</Label>
                    {events.filter(e => e.type==='mortgage').length === 0
                      ? <p className="text-xs text-[#C8291C] italic mt-1">Add a home purchase under Life Events first.</p>
                      : (
                        <Sel value={bumpEventId} onChange={e => setBumpEventId(e.target.value)}>
                          <option value="">— Select property —</option>
                          {events.filter(e => e.type==='mortgage').map(e => (
                            <option key={e.id} value={e.id}>{e.label} ({e.startYear}) · {e.state}</option>
                          ))}
                        </Sel>
                      )}
                  </div>
                  <div>
                    <Label>New Assessed Home Value ($)</Label>
                    <Input type="number" placeholder="e.g. 550000" value={bumpHomeValue || ''} onChange={e => setBumpHomeValue(e.target.value==='' ? '' : +e.target.value)} />
                  </div>
                  {bumpEventId && (+bumpHomeValue||0) > 0 && (() => {
                    const ev = events.find(e => e.id === bumpEventId);
                    if (!ev) return null;
                    const st = ev.state ?? 'NJ';
                    const origTax = ((ev.homePrice ?? 400000) * (STATE_PROP_TAX[st] ?? 0.018)) / 12;
                    const newTax  = ((+bumpHomeValue) * (STATE_PROP_TAX[st] ?? 0.018)) / 12;
                    return (
                      <div className="bg-[#FEF9EE] rounded-lg px-4 py-3 text-xs text-[#B45309] space-y-1">
                        <div className="flex justify-between"><span>Current monthly prop tax (year 1):</span><strong>{fmt(origTax)}</strong></div>
                        <div className="flex justify-between"><span>New monthly prop tax at {bumpYear}:</span><strong>{fmt(newTax)}</strong></div>
                        <div className="flex justify-between border-t border-[#FDE68A] pt-1"><span>Monthly increase:</span><strong>+{fmt(newTax - origTax)}</strong></div>
                      </div>
                    );
                  })()}
                </>
              )}

              {bumpType === 'withdrawal' && (
                <>
                  <div>
                    <Label>Withdrawal Amount ($)</Label>
                    <Input type="number" placeholder="e.g. 10000" value={bumpAmount || ''} onChange={e => setBumpAmount(e.target.value==='' ? '' : +e.target.value)} />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <input type="checkbox" id="taxFreeChk" checked={bumpTaxFree} onChange={e => setBumpTaxFree(e.target.checked)}
                      className="w-4 h-4 accent-[#16A34A]" />
                    <label htmlFor="taxFreeChk" className="text-sm text-[#1A202C] cursor-pointer">Qualifying tax-free / penalty-free event</label>
                  </div>
                  {bumpTaxFree && (
                    <div>
                      <Label>Qualifying Reason</Label>
                      <Sel value={bumpTaxFreeReason} onChange={e => setBumpTaxFreeReason(e.target.value)}>
                        <option>First-time home purchase</option>
                        <option>Qualified education expenses</option>
                        <option>Roth IRA contribution basis withdrawal</option>
                        <option>Disability</option>
                        <option>Substantially Equal Periodic Payments (SEPP / 72t)</option>
                      </Sel>
                    </div>
                  )}
                  <div className={`rounded-lg px-4 py-3 text-xs ${bumpTaxFree ? 'bg-[#F0FDF4] text-[#16A34A]' : 'bg-[#FEF2F2] text-[#C8291C]'}`}>
                    {bumpTaxFree
                      ? 'Qualifying events may waive the 10% early withdrawal penalty. Consult a CPA — rules vary by account type and circumstance.'
                      : 'Standard early withdrawal (before 59½): 10% penalty + ordinary income tax on the withdrawn amount. After 59½: no penalty, but still taxed as income.'}
                  </div>
                </>
              )}

              <button onClick={addBump}
                className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white font-black py-3 rounded-xl text-sm transition-colors">
                Add to Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Savings Goal Modal ───────────────────────────────────────────── */}
      {showSavingsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target===e.currentTarget) setShowSavingsModal(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-[#0066CC] text-lg">Add Savings Goal</h2>
              <button onClick={() => setShowSavingsModal(false)} className="text-[#718096] hover:text-[#1A202C] text-2xl leading-none">&times;</button>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Goal Type</Label>
                <Sel value={sgType} onChange={e => {
                  const t = e.target.value as SavingsGoalType;
                  setSgType(t);
                  setSgTotalValue('');
                  setSgDownPct(t === 'car' ? 15 : 20);
                  setSgAmount(0);
                }}>
                  <option value="house">House Purchase</option>
                  <option value="car">Car Purchase</option>
                  <option value="other">Other (custom)</option>
                </Sel>
              </div>
              {sgType === 'other' && (
                <div>
                  <Label>Goal Label</Label>
                  <Input type="text" placeholder="e.g. Emergency Fund, Wedding, Vacation" value={sgLabel} onChange={e => setSgLabel(e.target.value)} />
                </div>
              )}

              {/* Down payment calculator for house/car */}
              {(sgType === 'house' || sgType === 'car') && (
                <div className="bg-[#EBF4FF] rounded-xl p-4 space-y-3 border border-[#C8DCF7]">
                  <p className="text-[11px] font-black text-[#0066CC] uppercase tracking-wider">
                    {sgType === 'house' ? '🏠 Calculate from Home Value' : '🚗 Calculate from Vehicle Price'}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>{sgType === 'house' ? 'Total Home Value ($)' : 'Total Vehicle Price ($)'}</Label>
                      <Input type="number"
                        placeholder={sgType === 'house' ? 'e.g. 450000' : 'e.g. 35000'}
                        value={sgTotalValue||''}
                        onChange={e => {
                          const v = e.target.value === '' ? '' : +e.target.value;
                          setSgTotalValue(v);
                          if (v !== '') setSgAmount(Math.round(+v * sgDownPct / 100));
                        }} />
                    </div>
                    <div>
                      <Label>Down Payment %</Label>
                      <Input type="number" min={1} max={100}
                        value={sgDownPct}
                        onChange={e => {
                          const p = +e.target.value;
                          setSgDownPct(p);
                          if (sgTotalValue !== '') setSgAmount(Math.round(+sgTotalValue * p / 100));
                        }} />
                    </div>
                  </div>
                  {(+sgTotalValue||0) > 0 && (
                    <p className="text-[11px] text-[#0066CC] font-bold">
                      {sgDownPct}% of {fmt(+sgTotalValue)} = <span className="text-[#16A34A]">{fmt(Math.round(+sgTotalValue * sgDownPct / 100))}</span> down payment
                    </p>
                  )}
                </div>
              )}

              <div>
                <Label>Target Amount ($) {(sgType === 'house' || sgType === 'car') ? '— or enter manually' : ''}</Label>
                <Input type="number" placeholder="e.g. 25000" value={sgAmount || ''} onChange={e => { setSgAmount(e.target.value==='' ? '' : +e.target.value); setSgTotalValue(''); }} />
              </div>
              <div>
                <Label>Target Year</Label>
                <Input type="number" value={sgYear} onChange={e => setSgYear(+e.target.value)}
                  min={new Date().getFullYear()} max={new Date().getFullYear()+50} />
              </div>

              {/* Funding method */}
              <div>
                <Label>How to Fund This Goal</Label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <button
                    onClick={() => setSgUsePortfolio(false)}
                    className={`rounded-xl border-2 px-3 py-3 text-xs font-bold text-left transition-all ${!sgUsePortfolio ? 'border-[#B45309] bg-[#FEF9EE] text-[#B45309]' : 'border-[#C8DCF7] bg-white text-[#718096] hover:border-[#B45309]'}`}>
                    <p className="font-black mb-1">Save Monthly</p>
                    <p className="font-normal">Spread cost as monthly payments added to expenses until target date</p>
                  </button>
                  <button
                    onClick={() => setSgUsePortfolio(true)}
                    className={`rounded-xl border-2 px-3 py-3 text-xs font-bold text-left transition-all ${sgUsePortfolio ? 'border-[#16A34A] bg-[#F0FDF4] text-[#16A34A]' : 'border-[#C8DCF7] bg-white text-[#718096] hover:border-[#16A34A]'}`}>
                    <p className="font-black mb-1">Portfolio Money</p>
                    <p className="font-normal">Deduct lump sum from portfolio in target year — not added to expenses</p>
                  </button>
                </div>
              </div>

              {(+sgAmount||0) > 0 && sgYear > new Date().getFullYear() && (
                <div className={`rounded-lg px-4 py-3 text-xs space-y-1 ${sgUsePortfolio ? 'bg-[#F0FDF4] text-[#16A34A]' : 'bg-[#FEF9EE] text-[#B45309]'}`}>
                  {sgUsePortfolio ? (
                    <>
                      <div className="flex justify-between"><span>Portfolio deduction in {sgYear}:</span><strong>− {fmt(+sgAmount||0)}</strong></div>
                      <p className="mt-1 font-normal">Not included in monthly expenses — reduces your portfolio balance in that year.</p>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span>Monthly savings payment:</span>
                        <strong>+{fmt(Math.ceil((+sgAmount||0) / Math.max(1, (sgYear - new Date().getFullYear()) * 12)))}/mo</strong>
                      </div>
                      <p className="mt-1 font-normal">Added to your monthly expenses from now until {sgYear}.</p>
                    </>
                  )}
                </div>
              )}

              <button onClick={addSavingsGoal}
                className="w-full bg-[#B45309] hover:bg-[#92400E] text-white font-black py-3 rounded-xl text-sm transition-colors">
                Add Savings Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
