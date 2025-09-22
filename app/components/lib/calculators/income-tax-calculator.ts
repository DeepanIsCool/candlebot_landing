// Shared types
type Deductions = Partial<
  Record<
    "section80C" | "section80D" | "section80E" | "section80G" | "section24B" | "standardDeduction" | "otherDeductions",
    number
  >
>

type TaxBreakdownEntry = {
  range: string
  rate: number
  taxableAmount: number
  tax: number
}

interface NewRegimeResult {
  annualIncome: number
  taxRegime: "New"
  grossTax: number
  rebateU87A: number
  taxAfterRebate: number
  cess: number
  totalTax: number
  effectiveRate: number
  taxBreakdown: TaxBreakdownEntry[]
  netIncome: number
}

type DeductionBreakdown = {
  section80C: number
  section80D: number
  section80E: number
  section80G: number
  section24B: number
  standardDeduction: number
  otherDeductions: number
}

interface OldRegimeResult {
  annualIncome: number
  taxRegime: "Old"
  totalDeductions: number
  taxableIncome: number
  basicExemption: number
  grossTax: number
  cess: number
  totalTax: number
  effectiveRate: number
  taxBreakdown: TaxBreakdownEntry[]
  netIncome: number
  deductionBreakdown: DeductionBreakdown
}

export const calculateNewTaxRegime = (annualIncome: number, isResident = true, age = 30): NewRegimeResult => {
  if (annualIncome < 0) {
    throw new Error("Annual income must be non-negative")
  }

  // New regime tax slabs for FY 2024-25 (AY 2025-26)
  const taxSlabs = [
    { min: 0, max: 300000, rate: 0 },
    { min: 300000, max: 700000, rate: 5 },
    { min: 700000, max: 1000000, rate: 10 },
    { min: 1000000, max: 1200000, rate: 15 },
    { min: 1200000, max: 1500000, rate: 20 },
    { min: 1500000, max: Number.POSITIVE_INFINITY, rate: 30 },
  ]

  let tax = 0
  const taxBreakdown = []

  for (const slab of taxSlabs) {
    if (annualIncome > slab.min) {
      const taxableInThisSlab = Math.min(annualIncome, slab.max) - slab.min
      const taxInThisSlab = (taxableInThisSlab * slab.rate) / 100
      tax += taxInThisSlab

      if (taxableInThisSlab > 0) {
        taxBreakdown.push({
          range: `₹${slab.min.toLocaleString()} - ${slab.max === Number.POSITIVE_INFINITY ? "Above" : "₹" + slab.max.toLocaleString()}`,
          rate: slab.rate,
          taxableAmount: taxableInThisSlab,
          tax: taxInThisSlab,
        })
      }
    }
  }

  // Health and Education Cess (4%)
  const cess = tax * 0.04
  const totalTax = tax + cess

  // Tax rebate under Section 87A (for income up to ₹7 lakh)
  let rebate = 0
  if (annualIncome <= 700000) {
    rebate = Math.min(tax, 25000) // Max rebate ₹25,000 or tax amount, whichever is lower
  }

  const taxAfterRebate = Math.max(0, tax - rebate)
  const finalTax = taxAfterRebate + taxAfterRebate * 0.04 // Cess on tax after rebate

  return {
    annualIncome,
    taxRegime: "New",
    grossTax: Math.round(tax * 100) / 100,
    rebateU87A: Math.round(rebate * 100) / 100,
    taxAfterRebate: Math.round(taxAfterRebate * 100) / 100,
    cess: Math.round(taxAfterRebate * 0.04 * 100) / 100,
    totalTax: Math.round(finalTax * 100) / 100,
    effectiveRate: annualIncome > 0 ? Math.round((finalTax / annualIncome) * 100 * 100) / 100 : 0,
    taxBreakdown,
    netIncome: annualIncome - finalTax,
  }
}

/**
 * Calculate income tax under Old Tax Regime with deductions
 * @param {number} annualIncome - Annual gross income
 * @param {object} deductions - Object containing various deductions
 * @param {boolean} isResident - Whether taxpayer is resident
 * @param {number} age - Age of taxpayer
 * @returns {object} Tax calculation details
 */
export const calculateOldTaxRegime = (
  annualIncome: number,
  deductions: Deductions = {},
  isResident = true,
  age = 30,
): OldRegimeResult => {
  if (annualIncome < 0) {
    throw new Error("Annual income must be non-negative")
  }

  const {
    section80C = 0,
    section80D = 0,
    section80E = 0,
    section80G = 0,
    section24B = 0,
    standardDeduction = 50000,
    otherDeductions = 0,
  } = deductions

  // Calculate taxable income after deductions
  const totalDeductions =
    Math.min(section80C, 150000) +
    Math.min(section80D, age >= 60 ? 50000 : 25000) +
    section80E +
    section80G +
    section24B +
    standardDeduction +
    otherDeductions

  const taxableIncome = Math.max(0, annualIncome - totalDeductions)

  // Old regime tax slabs
  let basicExemption = 250000
  if (age >= 80) basicExemption = 500000
  else if (age >= 60) basicExemption = 300000

  const taxSlabs = [
    { min: 0, max: basicExemption, rate: 0 },
    { min: basicExemption, max: 500000, rate: 5 },
    { min: 500000, max: 1000000, rate: 20 },
    { min: 1000000, max: Number.POSITIVE_INFINITY, rate: 30 },
  ]

  let tax = 0
  const taxBreakdown = []

  for (const slab of taxSlabs) {
    if (taxableIncome > slab.min) {
      const taxableInThisSlab = Math.min(taxableIncome, slab.max) - slab.min
      const taxInThisSlab = (taxableInThisSlab * slab.rate) / 100
      tax += taxInThisSlab

      if (taxableInThisSlab > 0) {
        taxBreakdown.push({
          range: `₹${slab.min.toLocaleString()} - ${slab.max === Number.POSITIVE_INFINITY ? "Above" : "₹" + slab.max.toLocaleString()}`,
          rate: slab.rate,
          taxableAmount: taxableInThisSlab,
          tax: taxInThisSlab,
        })
      }
    }
  }

  // Health and Education Cess (4%)
  const cess = tax * 0.04
  const totalTax = tax + cess

  return {
    annualIncome,
    taxRegime: "Old",
    totalDeductions: Math.round(totalDeductions * 100) / 100,
    taxableIncome: Math.round(taxableIncome * 100) / 100,
    basicExemption,
    grossTax: Math.round(tax * 100) / 100,
    cess: Math.round(cess * 100) / 100,
    totalTax: Math.round(totalTax * 100) / 100,
    effectiveRate: annualIncome > 0 ? Math.round((totalTax / annualIncome) * 100 * 100) / 100 : 0,
    taxBreakdown,
    netIncome: annualIncome - totalTax,
    deductionBreakdown: {
      section80C: Math.min(section80C, 150000),
      section80D: Math.min(section80D, age >= 60 ? 50000 : 25000),
      section80E,
      section80G,
      section24B,
      standardDeduction,
      otherDeductions,
    },
  }
}

/**
 * Compare both tax regimes and suggest the better option
 * @param {number} annualIncome - Annual income
 * @param {object} deductions - Deductions for old regime
 * @param {number} age - Age of taxpayer
 * @returns {object} Comparison of both regimes
 */
export const compareTaxRegimes = (
  annualIncome: number,
  deductions: Deductions = {},
  age = 30,
): {
  newRegime: NewRegimeResult
  oldRegime: OldRegimeResult
  taxSavings: number
  betterRegime: "New" | "Old"
  recommendation: string
  percentageSavings: number
} => {
  const newRegime = calculateNewTaxRegime(annualIncome, true, age)
  const oldRegime = calculateOldTaxRegime(annualIncome, deductions, true, age)

  const savings = oldRegime.totalTax - newRegime.totalTax
  const betterRegime = savings > 0 ? "New" : "Old"

  return {
    newRegime,
    oldRegime,
    taxSavings: Math.abs(Math.round(savings * 100) / 100),
    betterRegime,
    recommendation:
      betterRegime === "New"
        ? `New regime saves ₹${Math.abs(savings).toLocaleString()}`
        : `Old regime saves ₹${Math.abs(savings).toLocaleString()}`,
    percentageSavings: annualIncome > 0 ? Math.round((Math.abs(savings) / annualIncome) * 100 * 100) / 100 : 0,
  }
}

/**
 * Calculate TDS on salary (monthly)
 * @param {number} monthlySalary - Monthly gross salary
 * @param {number} annualIncome - Total annual income
 * @param {object} deductions - Annual deductions
 * @param {string} regime - 'new' or 'old'
 * @returns {object} TDS calculation
 */
export const calculateTDS = (
  monthlySalary: number,
  annualIncome: number,
  deductions: Deductions = {},
  regime = "new",
): {
  monthlySalary: number
  annualTax: number
  monthlyTDS: number
  netMonthlySalary: number
  netAnnualSalary: number
  tdsPercentage: number
} => {
  if (monthlySalary < 0 || annualIncome < 0) {
    throw new Error("Salary and income must be non-negative")
  }

  let annualTax

  if (regime.toLowerCase() === "new") {
    const result = calculateNewTaxRegime(annualIncome)
    annualTax = result.totalTax
  } else {
    const result = calculateOldTaxRegime(annualIncome, deductions)
    annualTax = result.totalTax
  }

  const monthlyTDS = annualTax / 12
  const netMonthlySalary = monthlySalary - monthlyTDS

  return {
    monthlySalary,
    annualTax: Math.round(annualTax * 100) / 100,
    monthlyTDS: Math.round(monthlyTDS * 100) / 100,
    netMonthlySalary: Math.round(netMonthlySalary * 100) / 100,
    netAnnualSalary: Math.round(netMonthlySalary * 12 * 100) / 100,
    tdsPercentage: monthlySalary > 0 ? Math.round((monthlyTDS / monthlySalary) * 100 * 100) / 100 : 0,
  }
}

/**
 * Calculate advance tax quarterly payments
 * @param {number} annualTax - Total annual tax liability
 * @param {number} tdsDeducted - TDS already deducted (optional)
 * @returns {object} Advance tax payment schedule
 */
export const calculateAdvanceTax = (annualTax: number, tdsDeducted = 0): object => {
  if (annualTax < 0) {
    throw new Error("Annual tax must be non-negative")
  }

  const netTaxLiability = annualTax - tdsDeducted

  // Advance tax is applicable if tax liability > ₹10,000
  if (netTaxLiability <= 10000) {
    return {
      advanceTaxRequired: false,
      message: "Advance tax not required as liability is ≤ ₹10,000",
      netTaxLiability: Math.round(netTaxLiability * 100) / 100,
    }
  }

  // Advance tax payment schedule
  const quarters = [
    { period: "Q1 (By June 15)", percentage: 15 },
    { period: "Q2 (By Sept 15)", percentage: 45 }, // Cumulative 45%
    { period: "Q3 (By Dec 15)", percentage: 75 }, // Cumulative 75%
    { period: "Q4 (By March 15)", percentage: 100 }, // Cumulative 100%
  ]

  const schedule = quarters.map((quarter, index) => {
    const cumulativeAmount = (netTaxLiability * quarter.percentage) / 100
    const previousCumulative = index > 0 ? (netTaxLiability * quarters[index - 1].percentage) / 100 : 0
    const quarterlyAmount = cumulativeAmount - previousCumulative

    return {
      period: quarter.period,
      cumulativePercentage: quarter.percentage,
      quarterlyAmount: Math.round(quarterlyAmount * 100) / 100,
      cumulativeAmount: Math.round(cumulativeAmount * 100) / 100,
    }
  })

  return {
    advanceTaxRequired: true,
    annualTax: Math.round(annualTax * 100) / 100,
    tdsDeducted: Math.round(tdsDeducted * 100) / 100,
    netTaxLiability: Math.round(netTaxLiability * 100) / 100,
    paymentSchedule: schedule,
  }
}

/**
 * Calculate capital gains tax
 * @param {number} salePrice - Sale price of asset
 * @param {number} purchasePrice - Purchase price of asset
 * @param {number} holdingPeriod - Holding period in years
 * @param {string} assetType - 'equity', 'debt', 'property', 'gold'
 * @param {number} indexedPurchasePrice - Indexed purchase price (for LTCG on property/debt)
 * @returns {object} Capital gains tax calculation
 */
export const calculateCapitalGainsTax = (
  salePrice: number,
  purchasePrice: number,
  holdingPeriod: number,
  assetType: string,
  indexedPurchasePrice?: number,
): object => {
  if (salePrice < 0 || purchasePrice < 0 || holdingPeriod < 0) {
    throw new Error("All values must be non-negative")
  }

  const capitalGain = salePrice - purchasePrice
  let taxRate = 0
  let gainType = ""
  let exemptionLimit = 0
  let taxableGain = capitalGain

  switch (assetType.toLowerCase()) {
    case "equity":
      if (holdingPeriod >= 1) {
        gainType = "Long Term"
        exemptionLimit = 100000
        taxRate = 10
        taxableGain = Math.max(0, capitalGain - exemptionLimit)
      } else {
        gainType = "Short Term"
        taxRate = 15
      }
      break

    case "debt":
      if (holdingPeriod >= 3) {
        gainType = "Long Term"
        taxRate = 20
        // Use indexed cost if provided
        if (indexedPurchasePrice != null) {
          taxableGain = salePrice - indexedPurchasePrice
        }
      } else {
        gainType = "Short Term"
        taxRate = 30 // As per tax slab
      }
      break

    case "property":
      if (holdingPeriod >= 2) {
        gainType = "Long Term"
        taxRate = 20
        if (indexedPurchasePrice != null) {
          taxableGain = salePrice - indexedPurchasePrice
        }
      } else {
        gainType = "Short Term"
        taxRate = 30
      }
      break

    case "gold":
      if (holdingPeriod >= 3) {
        gainType = "Long Term"
        taxRate = 20
        if (indexedPurchasePrice != null) {
          taxableGain = salePrice - indexedPurchasePrice
        }
      } else {
        gainType = "Short Term"
        taxRate = 30
      }
      break

    default:
      throw new Error("Invalid asset type. Use: equity, debt, property, or gold")
  }

  const tax = (taxableGain * taxRate) / 100
  const netGain = capitalGain - tax

  return {
    salePrice,
    purchasePrice,
    capitalGain: Math.round(capitalGain * 100) / 100,
    gainType,
    holdingPeriod,
    assetType: assetType.toLowerCase(),
    exemptionUsed: exemptionLimit > 0 ? Math.min(capitalGain, exemptionLimit) : 0,
    taxableGain: Math.round(Math.max(0, taxableGain) * 100) / 100,
    taxRate,
    tax: Math.round(Math.max(0, tax) * 100) / 100,
    netGain: Math.round(netGain * 100) / 100,
  }
}
