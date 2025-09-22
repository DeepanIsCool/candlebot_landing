// Define interfaces for better type safety
interface SIPResult {
  futureValue: number;
  totalInvested: number;
  wealthGained: number;
  lumpSumContribution: number;
  sipContribution: number;
  taxableGains: number;
  taxAmount: number;
  netFutureValue: number;
  effectiveReturns: number;
}

interface StepUpSIPResult {
  futureValue: number;
  totalInvested: number;
  wealthGained: number;
  taxableGains?: number;
  taxAmount?: number;
  netFutureValue?: number;
  effectiveReturns?: number;
  yearWiseBreakdown?: {
    year: number;
    sipAmount: number;
    yearlyInvestment: number;
    cumulativeInvestment: number;
    yearEndValue: number;
  }[];
}

export interface TaxConfig {
  investmentType: 'equity' | 'debt' | 'hybrid';
  taxSlab: number; 
  indexationBenefit?: boolean; 
}

/**
 * Calculates the future value of a SIP (Systematic Investment Plan) with optional lump sum
 * @param principal - Initial lump sum investment (default: 0)
 * @param monthlyInvestment - Monthly SIP amount
 * @param annualRate - Expected annual rate of return (percentage)
 * @param years - Investment duration in years
 * @param taxConfig - Optional tax configuration for Indian market
 * @returns SIPResult object with calculated values
 */
export const calculateSIPFutureValue = (
  principal = 0,
  monthlyInvestment: number,
  annualRate: number,
  years: number,
  taxConfig?: TaxConfig
): SIPResult => {
  // Input validation
  if (monthlyInvestment < 0 || annualRate < 0 || years < 0 || principal < 0) {
    throw new Error("All parameters must be non-negative numbers")
  }

  if (monthlyInvestment === 0 && principal === 0) {
    throw new Error("Either monthly investment or principal must be greater than 0")
  }

  // Handle edge case of zero years
  if (years === 0) {
    return {
      futureValue: principal,
      totalInvested: principal,
      wealthGained: 0,
      lumpSumContribution: principal,
      sipContribution: 0,
      taxableGains: 0,
      taxAmount: 0,
      netFutureValue: principal,
      effectiveReturns: 0,
    }
  }

  const monthlyRate = annualRate / 100 / 12
  const totalMonths = years * 12

  // Calculate future value of lump sum investment
  const lumpSumFV = principal > 0 ? principal * Math.pow(1 + monthlyRate, totalMonths) : 0

  // Calculate future value of SIP investments
  let sipFV = 0
  if (monthlyInvestment > 0 && monthlyRate > 0) {
    sipFV = (monthlyInvestment * (Math.pow(1 + monthlyRate, totalMonths) - 1)) / monthlyRate
  } else if (monthlyInvestment > 0 && monthlyRate === 0) {
    sipFV = monthlyInvestment * totalMonths
  }

  const totalFutureValue = lumpSumFV + sipFV
  const totalInvested = principal + monthlyInvestment * totalMonths
  const wealthGained = totalFutureValue - totalInvested

  // Calculate tax implications if config provided
  let taxableGains = 0
  let taxAmount = 0
  let netFutureValue = totalFutureValue

  if (taxConfig && wealthGained > 0) {
    const { taxableAmount, tax } = calculateIndianCapitalGainsTax(
      wealthGained,
      years,
      taxConfig,
      totalInvested
    )
    taxableGains = taxableAmount
    taxAmount = tax
    netFutureValue = totalFutureValue - taxAmount
  }

  // Calculate effective returns (post-tax CAGR)
  const effectiveReturns = years > 0 
    ? (Math.pow(netFutureValue / totalInvested, 1 / years) - 1) * 100 
    : 0

  // Round all values for consistency
  return {
    futureValue: Math.round(totalFutureValue * 100) / 100,
    totalInvested: Math.round(totalInvested * 100) / 100,
    wealthGained: Math.round(wealthGained * 100) / 100,
    lumpSumContribution: Math.round(lumpSumFV * 100) / 100,
    sipContribution: Math.round(sipFV * 100) / 100,
    taxableGains: Math.round(taxableGains * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    netFutureValue: Math.round(netFutureValue * 100) / 100,
    effectiveReturns: Math.round(effectiveReturns * 100) / 100,
  }
}

/**
 * Updated Indian Capital Gains Tax calculation with latest rules (as of 2024-25)
 */
const calculateIndianCapitalGainsTax = (
  gains: number,
  holdingPeriod: number,
  taxConfig: TaxConfig,
  totalInvested: number
): { taxableAmount: number; tax: number } => {
  const { investmentType, taxSlab, indexationBenefit = false } = taxConfig

  switch (investmentType) {
    case 'equity':
      if (holdingPeriod >= 1) {
        // Long-term capital gains (LTCG) - 12.5% on gains > ₹1.25 lakh (Budget 2024)
        const exemptAmount = 125000 // ₹1.25 lakh exemption (updated)
        const taxableAmount = Math.max(0, gains - exemptAmount)
        const tax = taxableAmount * 0.125 // 12.5% LTCG tax (updated from 10%)
        return { taxableAmount, tax }
      } else {
        // Short-term capital gains (STCG) - 20% (updated from 15%)
        const tax = gains * 0.20
        return { taxableAmount: gains, tax }
      }

    case 'debt':
      // New rules: All debt mutual fund gains taxed as per tax slab (no indexation from April 2023)
      const tax = gains * (taxSlab / 100)
      return { taxableAmount: gains, tax }

    case 'hybrid':
      // Equity-oriented hybrid funds (>65% equity): Treated as equity
      // Debt-oriented hybrid funds: Treated as debt
      // Assuming debt-oriented for conservative calculation
      const hybridTax = gains * (taxSlab / 100)
      return { taxableAmount: gains, tax: hybridTax }

    default:
      return { taxableAmount: 0, tax: 0 }
  }
}

/**
 * Enhanced tax-optimized SIP calculator with updated rules
 */
export const calculateTaxOptimizedSIP = (
  monthlyInvestment: number,
  annualRate: number,
  years: number,
  taxSlab: number
): {
  equityAllocation: SIPResult;
  debtAllocation: SIPResult;
  combinedResult: SIPResult;
  recommendations: string[];
} => {
  // Dynamic allocation based on time horizon and age
  const equityPercentage = Math.min(90, Math.max(50, 100 - years * 1.5))
  const debtPercentage = 100 - equityPercentage

  const equityInvestment = (monthlyInvestment * equityPercentage) / 100
  const debtInvestment = (monthlyInvestment * debtPercentage) / 100

  // More realistic return assumptions
  const equityRate = annualRate
  const debtRate = Math.max(6, annualRate * 0.55) // Minimum 6% for debt

  const equityResult = calculateSIPFutureValue(
    0, equityInvestment, equityRate, years, 
    { investmentType: 'equity', taxSlab }
  )

  const debtResult = calculateSIPFutureValue(
    0, debtInvestment, debtRate, years, 
    { investmentType: 'debt', taxSlab, indexationBenefit: false }
  )

  const combinedResult: SIPResult = {
    futureValue: equityResult.futureValue + debtResult.futureValue,
    totalInvested: equityResult.totalInvested + debtResult.totalInvested,
    wealthGained: equityResult.wealthGained + debtResult.wealthGained,
    lumpSumContribution: 0,
    sipContribution: equityResult.sipContribution + debtResult.sipContribution,
    taxableGains: equityResult.taxableGains + debtResult.taxableGains,
    taxAmount: equityResult.taxAmount + debtResult.taxAmount,
    netFutureValue: equityResult.netFutureValue + debtResult.netFutureValue,
    effectiveReturns: years > 0 
      ? (Math.pow((equityResult.netFutureValue + debtResult.netFutureValue) / 
          (equityResult.totalInvested + debtResult.totalInvested), 1 / years) - 1) * 100 
      : 0,
  }

  const recommendations = [
    `Optimal allocation: ${equityPercentage}% equity, ${debtPercentage}% debt`,
    years >= 10 ? "Consider ELSS for Section 80C tax benefits (₹1.5L limit)" : "Short-term: Focus on liquid/ultra-short funds",
    years >= 15 ? "Add international equity exposure (10-20%)" : "Stick to domestic funds",
    "Rebalance portfolio annually or when allocation deviates by >10%",
    taxSlab >= 30 ? "Consider tax-free bonds, PPF, or NPS for debt allocation" : "Regular debt mutual funds suitable",
    "Review and increase SIP amount annually by 10-15%"
  ]

  return {
    equityAllocation: equityResult,
    debtAllocation: debtResult,
    combinedResult,
    recommendations
  }
}

/**
 * Calculates the required monthly SIP to achieve a target amount
 * @param targetAmount - Desired final amount
 * @param principal - Initial lump sum investment (default: 0)
 * @param annualRate - Expected annual rate of return (percentage)
 * @param years - Investment duration in years
 * @returns Required monthly SIP amount
 */
export const calculateRequiredSIP = (
  targetAmount: number,
  principal = 0,
  annualRate: number,
  years: number,
): number => {
  if (targetAmount <= 0 || annualRate < 0 || years <= 0 || principal < 0) {
    throw new Error("Target amount and years must be positive, rate and principal must be non-negative")
  }

  // Handle edge case of zero years
  if (years === 0) {
    if (targetAmount <= principal) {
      return 0
    }
    throw new Error("Cannot achieve target amount with zero investment duration")
  }

  const monthlyRate = annualRate / 100 / 12
  const totalMonths = years * 12

  // Calculate future value of existing lump sum
  const lumpSumFV = principal > 0 ? principal * Math.pow(1 + monthlyRate, totalMonths) : 0
  const remainingTarget = targetAmount - lumpSumFV

  if (remainingTarget <= 0) {
    return 0
  }

  let requiredSIP
  if (monthlyRate > 0) {
    requiredSIP = (remainingTarget * monthlyRate) / (Math.pow(1 + monthlyRate, totalMonths) - 1)
  } else {
    requiredSIP = remainingTarget / totalMonths
  }

  // Ensure non-negative result
  return Math.max(0, Math.round(requiredSIP * 100) / 100)
}

/**
 * Enhanced Step-up SIP calculator with corrected formula and detailed breakdown
 * @param initialSIP - Starting monthly SIP amount
 * @param stepUpPercentage - Annual percentage increase in SIP amount
 * @param principal - Initial lump sum investment (default: 0)
 * @param annualRate - Expected annual rate of return (percentage)
 * @param years - Investment duration in years
 * @param taxConfig - Optional tax configuration
 * @returns Enhanced StepUpSIPResult with year-wise breakdown
 */
export const calculateStepUpSIP = (
  initialSIP: number,
  stepUpPercentage: number,
  principal = 0,
  annualRate: number,
  years: number,
  taxConfig?: TaxConfig
): StepUpSIPResult => {
  if (initialSIP < 0 || stepUpPercentage < 0 || annualRate < 0 || years < 0 || principal < 0) {
    throw new Error("All parameters must be non-negative")
  }

  if (years === 0) {
    return {
      futureValue: principal,
      totalInvested: principal,
      wealthGained: 0,
      yearWiseBreakdown: []
    }
  }

  if (initialSIP === 0 && principal === 0) {
    throw new Error("Either initial SIP or principal must be greater than 0")
  }

  const monthlyRate = annualRate / 100 / 12
  const stepUpRate = stepUpPercentage / 100

  let totalInvested = principal
  let currentSIP = initialSIP
  let futureValue = 0
  const yearWiseBreakdown = []

  // Calculate lump sum growth
  if (principal > 0) {
    futureValue = principal * Math.pow(1 + monthlyRate, years * 12)
  }

  // Calculate step-up SIP with corrected formula
  for (let year = 1; year <= years; year++) {
    const yearlyInvestment = currentSIP * 12
    totalInvested += yearlyInvestment

    // Calculate future value for this year's investments
    const remainingYears = years - year
    const remainingMonths = remainingYears * 12

    let yearContribution = 0
    if (monthlyRate > 0) {
      // Future value of annuity for this year
      const sipAnnuityFV = (currentSIP * (Math.pow(1 + monthlyRate, 12) - 1)) / monthlyRate
      // Compound for remaining years
      yearContribution = sipAnnuityFV * Math.pow(1 + monthlyRate, remainingMonths)
    } else {
      yearContribution = yearlyInvestment
    }

    futureValue += yearContribution

    // Track year-wise data
    yearWiseBreakdown.push({
      year: year,
      sipAmount: Math.round(currentSIP),
      yearlyInvestment: Math.round(yearlyInvestment),
      cumulativeInvestment: Math.round(totalInvested),
      yearEndValue: Math.round(futureValue)
    })

    // Step up for next year
    currentSIP = currentSIP * (1 + stepUpRate)
  }

  const wealthGained = futureValue - totalInvested

  // Calculate tax if config provided
  let taxableGains = 0
  let taxAmount = 0
  let netFutureValue = futureValue

  if (taxConfig && wealthGained > 0) {
    const { taxableAmount, tax } = calculateIndianCapitalGainsTax(
      wealthGained,
      years,
      taxConfig,
      totalInvested
    )
    taxableGains = taxableAmount
    taxAmount = tax
    netFutureValue = futureValue - taxAmount
  }

  const effectiveReturns = years > 0 
    ? (Math.pow(netFutureValue / totalInvested, 1 / years) - 1) * 100 
    : 0

  return {
    futureValue: Math.round(futureValue * 100) / 100,
    totalInvested: Math.round(totalInvested * 100) / 100,
    wealthGained: Math.round(wealthGained * 100) / 100,
    taxableGains: Math.round(taxableGains * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    netFutureValue: Math.round(netFutureValue * 100) / 100,
    effectiveReturns: Math.round(effectiveReturns * 100) / 100,
    yearWiseBreakdown
  }
}

/**
 * NEW: Goal-based SIP calculator for specific financial goals
 * @param goalAmount - Target amount needed for the goal
 * @param currentAge - Current age of investor
 * @param goalAge - Age when goal is needed
 * @param riskProfile - 'conservative' | 'moderate' | 'aggressive'
 * @param existingSavings - Current savings towards this goal
 * @returns Goal-specific investment recommendation
 */
export const calculateGoalBasedSIP = (
  goalAmount: number,
  currentAge: number,
  goalAge: number,
  riskProfile: 'conservative' | 'moderate' | 'aggressive',
  existingSavings = 0
): {
  requiredSIP: number;
  recommendedRate: number;
  assetAllocation: { equity: number; debt: number };
  inflationAdjustedGoal: number;
  recommendations: string[];
} => {
  const years = goalAge - currentAge
  if (years <= 0) {
    throw new Error("Goal age must be greater than current age")
  }

  // Inflation adjustment (assuming 6% inflation)
  const inflationRate = 0.06
  const inflationAdjustedGoal = goalAmount * Math.pow(1 + inflationRate, years)

  // Risk-based asset allocation and expected returns
  let assetAllocation: { equity: number; debt: number }
  let recommendedRate: number

  switch (riskProfile) {
    case 'conservative':
      assetAllocation = { equity: Math.max(20, 100 - currentAge), debt: Math.min(80, currentAge) }
      recommendedRate = 8.5
      break
    case 'moderate':
      assetAllocation = { equity: Math.max(40, 120 - currentAge), debt: Math.min(60, currentAge - 20) }
      recommendedRate = 10.5
      break
    case 'aggressive':
      assetAllocation = { equity: Math.max(70, 130 - currentAge), debt: Math.min(30, currentAge - 50) }
      recommendedRate = 12.5
      break
    default:
      assetAllocation = { equity: 60, debt: 40 }
      recommendedRate = 10.5
  }

  const requiredSIP = calculateRequiredSIP(inflationAdjustedGoal, existingSavings, recommendedRate, years)

  const recommendations = [
    `Asset Allocation: ${assetAllocation.equity}% Equity, ${assetAllocation.debt}% Debt`,
    years > 15 ? "Long-term goal: Focus on equity for wealth creation" : "Medium-term: Balanced approach recommended",
    years < 5 ? "Short-term goal: Prioritize capital preservation" : "Consider step-up SIP (10% annually)",
    "Review and adjust every 2-3 years based on goal progress",
    "Consider tax-saving options like ELSS if applicable"
  ]

  return {
    requiredSIP: Math.round(requiredSIP),
    recommendedRate,
    assetAllocation,
    inflationAdjustedGoal: Math.round(inflationAdjustedGoal),
    recommendations
  }
}

/**
 * NEW: SIP vs Lump Sum comparison calculator
 * @param amount - Total amount to invest
 * @param annualRate - Expected annual return
 * @param years - Investment duration
 * @returns Comparison between SIP and lump sum investment
 */
export const compareSIPvsLumpSum = (
  amount: number,
  annualRate: number,
  years: number
): {
  lumpSumResult: { futureValue: number; totalReturns: number };
  sipResult: { futureValue: number; totalReturns: number };
  difference: number;
  recommendation: string;
} => {
  // Lump sum investment
  const lumpSumFV = amount * Math.pow(1 + annualRate / 100, years)
  const lumpSumReturns = lumpSumFV - amount

  // SIP investment (monthly)
  const monthlySIP = amount / (years * 12)
  const sipResult = calculateSIPFutureValue(0, monthlySIP, annualRate, years)

  const difference = lumpSumFV - sipResult.futureValue
  const differencePercent = ((lumpSumFV - sipResult.futureValue) / sipResult.futureValue) * 100

  let recommendation: string
  if (Math.abs(differencePercent) < 5) {
    recommendation = "Both strategies yield similar results. SIP offers better risk management through rupee cost averaging."
  } else if (difference > 0) {
    recommendation = `Lump sum investment yields ${differencePercent.toFixed(1)}% higher returns, but SIP reduces timing risk and offers better discipline.`
  } else {
    recommendation = `SIP strategy performs better in this scenario, providing ${Math.abs(differencePercent).toFixed(1)}% higher returns with lower risk.`
  }

  return {
    lumpSumResult: {
      futureValue: Math.round(lumpSumFV * 100) / 100,
      totalReturns: Math.round(lumpSumReturns * 100) / 100
    },
    sipResult: {
      futureValue: sipResult.futureValue,
      totalReturns: sipResult.wealthGained
    },
    difference: Math.round(Math.abs(difference) * 100) / 100,
    recommendation
  }
}