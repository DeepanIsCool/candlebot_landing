// Enhanced interfaces for Indian SWP calculations
interface SWPResult {
  finalBalance: number;
  totalWithdrawn: number;
  totalGrossWithdrawn: number;
  totalTaxDeducted: number;
  monthsUntilDepletion: number;
  yearsUntilDepletion: number;
  isPerpetual: boolean;
  averageMonthlyTax: number;
  effectiveWithdrawalRate: number;
  withdrawalHistory: WithdrawalRecord[];
}

interface WithdrawalRecord {
  month: number;
  year: number;
  balanceBeforeWithdrawal: number;
  grossWithdrawal: number;
  capitalGains: number;
  taxOnGains: number;
  netWithdrawal: number;
  balanceAfterWithdrawal: number;
  unitsRedeemed: number;
  nav: number;
  costBasis: number;
}

interface TaxConfig {
  investmentType: 'equity' | 'debt' | 'hybrid';
  taxSlab: number;
  indexationBenefit?: boolean;
}

interface StepUpSWPResult {
  finalBalance: number;
  totalWithdrawn: number;
  totalTaxDeducted: number;
  monthsCompleted: number;
  yearsCompleted: number;
  finalWithdrawalAmount: number;
  yearWiseBreakdown: {
    year: number;
    withdrawalAmount: number;
    totalTax: number;
    netWithdrawn: number;
    endBalance: number;
  }[];
}

/**
 * Enhanced SWP calculator with Indian tax implications using FIFO method
 * @param initialAmount - Initial investment corpus
 * @param monthlyWithdrawal - Desired monthly withdrawal (gross)
 * @param annualRate - Expected annual return rate (%)
 * @param years - Withdrawal period in years
 * @param taxConfig - Tax configuration for Indian market
 * @param expenseRatio - Annual expense ratio of the fund (default: 1.5%)
 * @param initialNAV - Starting NAV of the fund (default: 10)
 * @returns Enhanced SWP result with tax calculations
 */

// ADD TO FEATURES
export const calculateSWP = (
  initialAmount: number,
  monthlyWithdrawal: number,
  annualRate: number,
  years: number,
  taxConfig: TaxConfig,
  expenseRatio: number = 1.5,
  initialNAV: number = 10
): SWPResult => {
  // Input validation
  if (initialAmount <= 0 || monthlyWithdrawal <= 0 || annualRate < 0 || years <= 0) {
    throw new Error("Initial amount, withdrawal, and years must be positive; rate must be non-negative");
  }

  // Adjust return rate for expense ratio
  const netAnnualRate = Math.max(0, annualRate - expenseRatio);
  const monthlyRate = netAnnualRate / 100 / 12;
  const totalMonths = years * 12;

  // Initialize tracking variables
  let currentBalance = initialAmount;
  let currentNAV = initialNAV;
  let totalUnits = initialAmount / initialNAV;
  const withdrawalHistory: WithdrawalRecord[] = [];
  let totalWithdrawn = 0;
  let totalGrossWithdrawn = 0;
  let totalTaxDeducted = 0;
  let monthsUntilDepletion = 0;

  // FIFO cost basis tracking
  const purchaseBatches = [{
    units: totalUnits,
    costPerUnit: initialNAV,
    purchaseDate: new Date(),
    remainingUnits: totalUnits
  }];

  for (let month = 1; month <= totalMonths; month++) {
    const year = Math.ceil(month / 12);
    
    // Update NAV based on monthly growth
    currentNAV = currentNAV * (1 + monthlyRate);
    currentBalance = totalUnits * currentNAV;

    // Calculate units needed for withdrawal
    const unitsNeeded = monthlyWithdrawal / currentNAV;

    if (totalUnits >= unitsNeeded) {
      // Process withdrawal using FIFO
      const { capitalGains, averageCostBasis } = calculateCapitalGainsUsingFIFO(
        unitsNeeded,
        currentNAV,
        purchaseBatches,
        month
      );

      // Calculate tax on capital gains
      const taxAmount = calculateCapitalGainsTax(capitalGains, month, taxConfig);
      
      // Net withdrawal after tax
      const netWithdrawal = monthlyWithdrawal - taxAmount;

      // Update tracking
      totalUnits -= unitsNeeded;
      totalWithdrawn += netWithdrawal;
      totalGrossWithdrawn += monthlyWithdrawal;
      totalTaxDeducted += taxAmount;
      monthsUntilDepletion = month;

      // Record withdrawal
      withdrawalHistory.push({
        month: month,
        year: year,
        balanceBeforeWithdrawal: currentBalance,
        grossWithdrawal: monthlyWithdrawal,
        capitalGains: capitalGains,
        taxOnGains: taxAmount,
        netWithdrawal: netWithdrawal,
        balanceAfterWithdrawal: totalUnits * currentNAV,
        unitsRedeemed: unitsNeeded,
        nav: currentNAV,
        costBasis: averageCostBasis
      });

    } else {
      // Final withdrawal with remaining balance
      const remainingValue = totalUnits * currentNAV;
      const { capitalGains } = calculateCapitalGainsUsingFIFO(
        totalUnits,
        currentNAV,
        purchaseBatches,
        month
      );

      const taxAmount = calculateCapitalGainsTax(capitalGains, month, taxConfig);
      const finalNetWithdrawal = remainingValue - taxAmount;

      totalWithdrawn += finalNetWithdrawal;
      totalGrossWithdrawn += remainingValue;
      totalTaxDeducted += taxAmount;
      monthsUntilDepletion = month;

      withdrawalHistory.push({
        month: month,
        year: year,
        balanceBeforeWithdrawal: remainingValue,
        grossWithdrawal: remainingValue,
        capitalGains: capitalGains,
        taxOnGains: taxAmount,
        netWithdrawal: finalNetWithdrawal,
        balanceAfterWithdrawal: 0,
        unitsRedeemed: totalUnits,
        nav: currentNAV,
        costBasis: purchaseBatches[0]?.costPerUnit || initialNAV
      });

      totalUnits = 0;
      currentBalance = 0;
      break;
    }
  }

  const finalBalance = totalUnits * currentNAV;
  const averageMonthlyTax = totalTaxDeducted / monthsUntilDepletion;
  const effectiveWithdrawalRate = (totalWithdrawn / initialAmount) * 100;

  return {
    finalBalance: Math.round(finalBalance * 100) / 100,
    totalWithdrawn: Math.round(totalWithdrawn * 100) / 100,
    totalGrossWithdrawn: Math.round(totalGrossWithdrawn * 100) / 100,
    totalTaxDeducted: Math.round(totalTaxDeducted * 100) / 100,
    monthsUntilDepletion,
    yearsUntilDepletion: Math.round((monthsUntilDepletion / 12) * 100) / 100,
    isPerpetual: finalBalance > 0 && monthsUntilDepletion === totalMonths,
    averageMonthlyTax: Math.round(averageMonthlyTax * 100) / 100,
    effectiveWithdrawalRate: Math.round(effectiveWithdrawalRate * 100) / 100,
    withdrawalHistory: withdrawalHistory.slice(0, 24) // First 2 years sample
  };
};

/**
 * Calculate capital gains using FIFO method
 */
const calculateCapitalGainsUsingFIFO = (
  unitsToRedeem: number,
  currentNAV: number,
  purchaseBatches: any[],
  currentMonth: number
) => {
  let remainingUnits = unitsToRedeem;
  let totalCostBasis = 0;
  let totalSaleValue = unitsToRedeem * currentNAV;
  
  for (const batch of purchaseBatches) {
    if (remainingUnits <= 0) break;
    
    const unitsFromThisBatch = Math.min(remainingUnits, batch.remainingUnits);
    const costBasisFromBatch = unitsFromThisBatch * batch.costPerUnit;
    
    totalCostBasis += costBasisFromBatch;
    batch.remainingUnits -= unitsFromThisBatch;
    remainingUnits -= unitsFromThisBatch;
  }
  
  const capitalGains = Math.max(0, totalSaleValue - totalCostBasis);
  const averageCostBasis = totalCostBasis / unitsToRedeem;
  
  return { capitalGains, averageCostBasis };
};

/**
 * Calculate capital gains tax based on Indian rules
 */
const calculateCapitalGainsTax = (
  gains: number,
  holdingPeriodMonths: number,
  taxConfig: TaxConfig
): number => {
  if (gains <= 0) return 0;

  const { investmentType, taxSlab } = taxConfig;
  const holdingPeriodYears = holdingPeriodMonths / 12;

  switch (investmentType) {
    case 'equity':
      if (holdingPeriodYears >= 1) {
        // LTCG: 12.5% on gains above ₹1.25 lakh annually
        const annualExemption = 125000;
        const exemption = (annualExemption / 12) * Math.min(12, holdingPeriodMonths);
        const taxableGains = Math.max(0, gains - exemption);
        return taxableGains * 0.125;
      } else {
        // STCG: 20%
        return gains * 0.20;
      }

    case 'debt':
      // All debt fund gains taxed as per slab
      return gains * (taxSlab / 100);

    case 'hybrid':
      // Assume debt treatment for conservative calculation
      return gains * (taxSlab / 100);

    default:
      return 0;
  }
};

/**
 * Calculate sustainable withdrawal rate with tax considerations
 */

// ADD TO FEATURES
export const calculateSustainableWithdrawal = (
  initialAmount: number,
  annualRate: number,
  taxConfig: TaxConfig,
  years: number = 30,
  expenseRatio: number = 1.5
): {
  grossMonthlyWithdrawal: number;
  netMonthlyWithdrawal: number;
  sustainabilityRate: number;
  recommendations: string[];
} => {
  if (initialAmount <= 0 || annualRate < 0 || years <= 0) {
    throw new Error("All parameters must be positive, rate must be non-negative");
  }

  // Adjust for expense ratio
  const netRate = Math.max(0, annualRate - expenseRatio);
  const monthlyRate = netRate / 100 / 12;
  const totalMonths = years * 12;

  let grossMonthlyWithdrawal: number;
  if (monthlyRate === 0) {
    grossMonthlyWithdrawal = initialAmount / totalMonths;
  } else {
    // PMT formula for sustainable withdrawal
    grossMonthlyWithdrawal = (initialAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
  }

  // Estimate average tax impact (simplified)
  const avgTaxRate = estimateAverageTaxRate(taxConfig, 12); // 12 months holding
  const netMonthlyWithdrawal = grossMonthlyWithdrawal * (1 - avgTaxRate);
  
  const sustainabilityRate = (grossMonthlyWithdrawal * 12 / initialAmount) * 100;

  const recommendations = [
    `Sustainable withdrawal rate: ${sustainabilityRate.toFixed(2)}% annually`,
    taxConfig.investmentType === 'equity' ? 
      "Hold for >1 year to benefit from LTCG rates" : 
      "Consider equity funds for better tax efficiency",
    years >= 20 ? 
      "Long-term: Consider 4% rule with annual adjustments" : 
      "Medium-term: Conservative approach recommended",
    "Review withdrawal strategy every 2-3 years",
    "Maintain 6-month emergency fund separately"
  ];

  return {
    grossMonthlyWithdrawal: Math.round(grossMonthlyWithdrawal * 100) / 100,
    netMonthlyWithdrawal: Math.round(netMonthlyWithdrawal * 100) / 100,
    sustainabilityRate: Math.round(sustainabilityRate * 100) / 100,
    recommendations
  };
};

/**
 * Enhanced perpetual withdrawal calculator for Indian market
 */
// ADD TO FEATURES
export const calculatePerpetualWithdrawal = (
  initialAmount: number,
  annualRate: number,
  taxConfig: TaxConfig
): {
  standardOptions: Record<string, {
    grossAnnual: number;
    netAnnual: number;
    grossMonthly: number;
    netMonthly: number;
    taxImpact: number;
  }>;
  recommendations: string[];
} => {
  if (initialAmount <= 0 || annualRate < 0) {
    throw new Error("Initial amount must be positive, rate must be non-negative");
  }

  const safeRates = [3, 3.5, 4, 4.5, 5];
  const standardOptions: Record<string, any> = {};
  
  const avgTaxRate = estimateAverageTaxRate(taxConfig, 12);

  safeRates.forEach((rate) => {
    const grossAnnual = (initialAmount * rate) / 100;
    const taxImpact = grossAnnual * avgTaxRate;
    const netAnnual = grossAnnual - taxImpact;
    
    standardOptions[`${rate}%`] = {
      grossAnnual: Math.round(grossAnnual * 100) / 100,
      netAnnual: Math.round(netAnnual * 100) / 100,
      grossMonthly: Math.round((grossAnnual / 12) * 100) / 100,
      netMonthly: Math.round((netAnnual / 12) * 100) / 100,
      taxImpact: Math.round(taxImpact * 100) / 100
    };
  });

  const recommendations = [
    "4% rule is widely accepted for perpetual withdrawals",
    taxConfig.investmentType === 'equity' ? 
      "Equity funds: Better for long-term wealth preservation" :
      "Consider equity allocation for inflation protection",
    "Rebalance portfolio annually",
    "Monitor inflation impact and adjust withdrawal rates",
    "Consider staggered withdrawal across different fund types"
  ];

  return {
    standardOptions,
    recommendations
  };
};

/**
 * Enhanced step-up SWP with tax calculations
 */
// ADD TO FEATURES
export const calculateStepUpSWP = (
  initialAmount: number,
  initialWithdrawal: number,
  stepUpPercentage: number,
  annualRate: number,
  years: number,
  taxConfig: TaxConfig,
  expenseRatio: number = 1.5
): StepUpSWPResult => {
  if (initialAmount <= 0 || initialWithdrawal <= 0 || stepUpPercentage < 0 || 
      annualRate < 0 || years <= 0) {
    throw new Error("All parameters must be positive except step-up which can be zero");
  }

  const netRate = Math.max(0, annualRate - expenseRatio);
  const monthlyRate = netRate / 100 / 12;
  const stepUpRate = stepUpPercentage / 100;

  let currentBalance = initialAmount;
  let currentWithdrawal = initialWithdrawal;
  let totalWithdrawn = 0;
  let totalTaxDeducted = 0;
  let monthsCompleted = 0;
  const yearWiseBreakdown = [];

  for (let year = 1; year <= years; year++) {
    let yearlyTax = 0;
    let yearlyNetWithdrawn = 0;
    let yearStartBalance = currentBalance;

    for (let month = 1; month <= 12; month++) {
      monthsCompleted++;
      
      // Apply growth
      currentBalance = currentBalance * (1 + monthlyRate);

      if (currentBalance >= currentWithdrawal) {
        // Calculate tax on withdrawal
        const holdingMonths = monthsCompleted;
        const avgTaxRate = estimateAverageTaxRate(taxConfig, holdingMonths);
        const taxAmount = currentWithdrawal * avgTaxRate * 0.1; // Simplified tax on gains portion
        
        currentBalance -= currentWithdrawal;
        totalWithdrawn += (currentWithdrawal - taxAmount);
        totalTaxDeducted += taxAmount;
        yearlyTax += taxAmount;
        yearlyNetWithdrawn += (currentWithdrawal - taxAmount);
      } else {
        // Final withdrawal
        const avgTaxRate = estimateAverageTaxRate(taxConfig, monthsCompleted);
        const finalTax = currentBalance * avgTaxRate * 0.1;
        totalWithdrawn += (currentBalance - finalTax);
        totalTaxDeducted += finalTax;
        yearlyTax += finalTax;
        yearlyNetWithdrawn += (currentBalance - finalTax);
        currentBalance = 0;
        break;
      }
    }

    yearWiseBreakdown.push({
      year,
      withdrawalAmount: Math.round(currentWithdrawal * 100) / 100,
      totalTax: Math.round(yearlyTax * 100) / 100,
      netWithdrawn: Math.round(yearlyNetWithdrawn * 100) / 100,
      endBalance: Math.round(currentBalance * 100) / 100
    });

    if (currentBalance === 0) break;

    // Step up for next year
    currentWithdrawal = currentWithdrawal * (1 + stepUpRate);
  }

  return {
    finalBalance: Math.round(currentBalance * 100) / 100,
    totalWithdrawn: Math.round(totalWithdrawn * 100) / 100,
    totalTaxDeducted: Math.round(totalTaxDeducted * 100) / 100,
    monthsCompleted,
    yearsCompleted: Math.round((monthsCompleted / 12) * 100) / 100,
    finalWithdrawalAmount: Math.round(currentWithdrawal * 100) / 100,
    yearWiseBreakdown
  };
};

/**
 * Helper function to estimate average tax rate
 */
const estimateAverageTaxRate = (taxConfig: TaxConfig, holdingMonths: number): number => {
  const { investmentType, taxSlab } = taxConfig;
  const holdingYears = holdingMonths / 12;

  switch (investmentType) {
    case 'equity':
      return holdingYears >= 1 ? 0.05 : 0.15; // Simplified average considering exemptions
    case 'debt':
      return taxSlab / 100;
    case 'hybrid':
      return Math.min(0.15, taxSlab / 100);
    default:
      return 0.10;
  }
};

/**
 * NEW: SWP vs Fixed Deposit comparison
 */
// ADD TO FEATURES
export const compareSWPvsFD = (
  amount: number,
  monthlyIncome: number,
  swpRate: number,
  fdRate: number,
  taxSlab: number,
  years: number
): {
  swpResult: { totalIncome: number; finalCorpus: number; totalTax: number };
  fdResult: { totalIncome: number; totalTax: number };
  recommendation: string;
} => {
  // SWP calculation (simplified)
  const swpTaxConfig: TaxConfig = { investmentType: 'equity', taxSlab };
  const swpResult = calculateSWP(amount, monthlyIncome, swpRate, years, swpTaxConfig);
  
  // FD calculation
  const annualFDIncome = (amount * fdRate) / 100;
  const annualFDTax = annualFDIncome * (taxSlab / 100);
  const totalFDIncome = (annualFDIncome - annualFDTax) * years;
  
  let recommendation = "";
  if (swpResult.totalWithdrawn > totalFDIncome) {
    recommendation = `SWP provides ${((swpResult.totalWithdrawn / totalFDIncome - 1) * 100).toFixed(1)}% higher income with potential for corpus growth.`;
  } else {
    recommendation = `FD provides guaranteed returns but with higher tax burden. SWP offers tax efficiency and potential corpus preservation.`;
  }

  return {
    swpResult: {
      totalIncome: swpResult.totalWithdrawn,
      finalCorpus: swpResult.finalBalance,
      totalTax: swpResult.totalTaxDeducted
    },
    fdResult: {
      totalIncome: Math.round(totalFDIncome * 100) / 100,
      totalTax: Math.round((annualFDTax * years) * 100) / 100
    },
    recommendation
  };
};