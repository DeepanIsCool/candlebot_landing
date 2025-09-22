// Type definitions
interface LumpSumReturns {
    futureValue: number;
    totalGains: number;
    absoluteReturn: number;
    annualizedReturn: number;
    initialInvestment: number;
}
  
interface ReturnsWithExpenses {
    grossFutureValue: number;
    netFutureValue: number;
    netReturn: number;
    expenseImpact: number;
    totalExpenses: number;
}

interface NAVReturns {
    initialInvestment: number;
    currentValue: number;
    capitalGains: number;
    dividendsReceived: number;
    totalReturns: number;
    returnPercentage: number;
    unitsHeld: number;
}
  
interface TaxAdjustedReturns {
    preTaxValue: number;
    capitalGains: number;
    taxType: string;
    applicableTaxRate: number | string;
    taxLiability: number;
    postTaxValue: number;
    postTaxReturns: number;
    postTaxReturnPercentage: number;
}
  
interface FundInput {
    name: string;
    investment: number;
    returns: number;
    expenseRatio?: number;
    years: number;
}
  
interface FundComparison {
    name: string;
    investment: number;
    grossReturn: number;
    expenseRatio: number;
    netReturn: number;
    futureValue: number;
    totalGains: number;
    absoluteReturn: number;
    years: number;
}
  
interface PerformanceMetrics {
    annualizedReturn: number;
    annualizedVolatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
    totalPeriods: number;
    avgMonthlyReturn: number;
}
  
type FundType = 'equity' | 'debt' | 'other';
  
/**
 * @description **Frontend UI Feature**
 * Calculate mutual fund lump sum returns.
 * @param {number} investment - Initial investment amount
 * @param {number} annualRate - Annual rate of return (as percentage)
 * @param {number} years - Investment period in years
 * @returns {LumpSumReturns} Object containing future value, total gains, and annualized returns
 */
export const calculateLumpSumReturns = (investment: number, annualRate: number, years: number): LumpSumReturns => {
    if (investment <= 0 || annualRate < 0 || years <= 0) {
      throw new Error('Investment and years must be positive, rate must be non-negative');
    }
  
    const futureValue = investment * Math.pow(1 + (annualRate / 100), years);
    const totalGains = futureValue - investment;
    const absoluteReturn = ((futureValue - investment) / investment) * 100;
  
    return {
      futureValue: Math.round(futureValue * 100) / 100,
      totalGains: Math.round(totalGains * 100) / 100,
      absoluteReturn: Math.round(absoluteReturn * 100) / 100,
      annualizedReturn: annualRate,
      initialInvestment: investment
    };
};
  
/**
 * @description **Helper Function**
 * Calculate CAGR (Compound Annual Growth Rate).
 * @param {number} initialValue - Initial investment amount
 * @param {number} finalValue - Final value after period
 * @param {number} years - Investment period in years
 * @returns {number} CAGR percentage
 */
export const calculateCAGR = (initialValue: number, finalValue: number, years: number): number => {
    if (initialValue <= 0 || finalValue <= 0 || years <= 0) {
      throw new Error('All values must be positive');
    }
  
    const cagr = (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100;
    return Math.round(cagr * 100) / 100;
};
  
/**
 * @description **Frontend UI Feature**
 * Calculate mutual fund returns with expense ratio.
 * @param {number} investment - Initial investment amount
 * @param {number} grossReturn - Gross annual return (as percentage)
 * @param {number} expenseRatio - Annual expense ratio (as percentage, e.g., 1.5 for 1.5%)
 * @param {number} years - Investment period in years
 * @returns {ReturnsWithExpenses} Object containing net returns after expenses
 */
export const calculateReturnsWithExpenses = (
    investment: number,
    grossReturn: number,
    expenseRatio: number,
    years: number,
): ReturnsWithExpenses => {
    if (investment <= 0 || grossReturn < 0 || expenseRatio < 0 || years <= 0) {
      throw new Error("Investment and years must be positive, returns and expense ratio must be non-negative");
    }
  
    const netReturn = grossReturn - expenseRatio;
    const grossFutureValue = investment * Math.pow(1 + grossReturn / 100, years);
    const netFutureValue = investment * Math.pow(1 + netReturn / 100, years);
    const expenseImpact = grossFutureValue - netFutureValue;
  
    return {
      grossFutureValue: Math.round(grossFutureValue * 100) / 100,
      netFutureValue: Math.round(netFutureValue * 100) / 100,
      netReturn: Math.round(netReturn * 100) / 100,
      expenseImpact: Math.round(expenseImpact * 100) / 100,
      totalExpenses: Math.round((expenseImpact + (investment * expenseRatio * years) / 100) * 100) / 100,
    };
};
  
/**
 * @description **Frontend UI Feature**
 * Calculate mutual fund NAV-based returns.
 * @param {number} unitsHeld - Number of units held
 * @param {number} purchaseNAV - NAV at time of purchase
 * @param {number} currentNAV - Current NAV
 * @param {number} dividendsReceived - Total dividends received (optional)
 * @returns {NAVReturns} Object containing return calculations
 */
export const calculateNAVReturns = (
    unitsHeld: number,
    purchaseNAV: number,
    currentNAV: number,
    dividendsReceived = 0,
): NAVReturns => {
    if (unitsHeld <= 0 || purchaseNAV <= 0 || currentNAV <= 0) {
      throw new Error("Units, purchase NAV, and current NAV must be positive");
    }
  
    const initialInvestment = unitsHeld * purchaseNAV;
    const currentValue = unitsHeld * currentNAV;
    const capitalGains = currentValue - initialInvestment;
    const totalReturns = capitalGains + dividendsReceived;
    const returnPercentage = (totalReturns / initialInvestment) * 100;
  
    return {
      initialInvestment: Math.round(initialInvestment * 100) / 100,
      currentValue: Math.round(currentValue * 100) / 100,
      capitalGains: Math.round(capitalGains * 100) / 100,
      dividendsReceived: dividendsReceived,
      totalReturns: Math.round(totalReturns * 100) / 100,
      returnPercentage: Math.round(returnPercentage * 100) / 100,
      unitsHeld: unitsHeld,
    };
};
  
/**
 * @description **Frontend UI Feature**
 * Calculate mutual fund returns with tax implications based on latest Indian tax laws.
 * @param {number} investment - Initial investment amount
 * @param {number} currentValue - Current value of investment
 * @param {number} holdingPeriod - Holding period in years
 * @param {FundType} fundType - 'equity' or 'debt'
 * @param {number} incomeSlabRate - Applicable tax rate for debt funds (as percentage, e.g., 30 for 30%)
 * @returns {TaxAdjustedReturns} Object containing post-tax returns
 */
export const calculateTaxAdjustedReturns = (
    investment: number,
    currentValue: number,
    holdingPeriod: number,
    fundType: FundType = "equity",
    incomeSlabRate?: number,
): TaxAdjustedReturns => {
    if (investment <= 0 || currentValue <= 0 || holdingPeriod < 0) {
      throw new Error("Investment and current value must be positive, holding period must be non-negative");
    }
  
    const capitalGains = currentValue - investment;
    if (capitalGains <= 0) {
      return {
        preTaxValue: Math.round(currentValue * 100) / 100,
        capitalGains: 0,
        taxType: "No Tax",
        applicableTaxRate: 0,
        taxLiability: 0,
        postTaxValue: Math.round(currentValue * 100) / 100,
        postTaxReturns: 0,
        postTaxReturnPercentage: 0,
      };
    }
  
    let applicableTaxRate: number | string;
    let taxType = "";
    let taxLiability = 0;
  
    if (fundType.toLowerCase() === "equity") {
      if (holdingPeriod >= 1) {
        applicableTaxRate = "12.5% on gains over ₹1.25L";
        taxType = "Long Term Capital Gains (LTCG)";
        const taxableGain = Math.max(0, capitalGains - 125000);
        taxLiability = taxableGain * 0.125;
      } else {
        applicableTaxRate = 20;
        taxType = "Short Term Capital Gains (STCG)";
        taxLiability = capitalGains * 0.20;
      }
    } else if (fundType.toLowerCase() === "debt") {
      applicableTaxRate = "Slab Rate";
      taxType = "Short Term Capital Gains (STCG) - Taxed at slab rate";
      if (incomeSlabRate === undefined) {
        throw new Error("For debt funds, incomeSlabRate must be provided.");
      }
      taxLiability = capitalGains * (incomeSlabRate / 100);
    } else { // 'other' funds like hybrid etc.
      applicableTaxRate = "Slab Rate";
      taxType = "Taxed as per Slab Rate";
      if (incomeSlabRate === undefined) {
          throw new Error("For this fund type, incomeSlabRate must be provided.");
      }
      taxLiability = capitalGains * (incomeSlabRate / 100);
    }
  
    const postTaxValue = currentValue - taxLiability;
    const postTaxReturns = postTaxValue - investment;
    const postTaxReturnPercentage = (postTaxReturns / investment) * 100;
  
    return {
      preTaxValue: Math.round(currentValue * 100) / 100,
      capitalGains: Math.round(capitalGains * 100) / 100,
      taxType: taxType,
      applicableTaxRate: applicableTaxRate,
      taxLiability: Math.round(taxLiability * 100) / 100,
      postTaxValue: Math.round(postTaxValue * 100) / 100,
      postTaxReturns: Math.round(postTaxReturns * 100) / 100,
      postTaxReturnPercentage: Math.round(postTaxReturnPercentage * 100) / 100,
    };
};
  
/**
 * @description **Frontend UI Feature**
 * Compare multiple mutual funds.
 * @param {FundInput[]} funds - Array of fund objects with {name, investment, returns, expenseRatio, years}
 * @returns {FundComparison[]} Sorted array of funds with calculated metrics
 */
export const compareFunds = (funds: FundInput[]): FundComparison[] => {
    if (!Array.isArray(funds) || funds.length === 0) {
      throw new Error('Funds must be a non-empty array');
    }
  
    const comparedFunds = funds.map(fund => {
      const { name, investment, returns, expenseRatio = 0, years } = fund;
      
      if (!name || investment <= 0 || returns < 0 || years <= 0) {
        throw new Error('Each fund must have valid name, investment, returns, and years');
      }
  
      const netReturn = returns - expenseRatio;
      const futureValue = investment * Math.pow(1 + (netReturn / 100), years);
      const totalGains = futureValue - investment;
      const absoluteReturn = ((futureValue - investment) / investment) * 100;
  
      return {
        name,
        investment,
        grossReturn: returns,
        expenseRatio,
        netReturn: Math.round(netReturn * 100) / 100,
        futureValue: Math.round(futureValue * 100) / 100,
        totalGains: Math.round(totalGains * 100) / 100,
        absoluteReturn: Math.round(absoluteReturn * 100) / 100,
        years
      };
    });
  
    return comparedFunds.sort((a, b) => b.totalGains - a.totalGains);
};
  
/**
 * @description **Helper Function**
 * Calculate fund performance metrics.
 * @param {number[]} monthlyNAVs - Array of monthly NAV values
 * @param {number} riskFreeRate - Risk-free rate (as percentage, optional)
 * @returns {PerformanceMetrics} Object containing various performance metrics
 */
export const calculatePerformanceMetrics = (monthlyNAVs: number[], riskFreeRate = 6): PerformanceMetrics => {
    if (!Array.isArray(monthlyNAVs) || monthlyNAVs.length < 2) {
      throw new Error("Monthly NAVs must be an array with at least 2 values");
    }
  
    const monthlyReturns = [];
    for (let i = 1; i < monthlyNAVs.length; i++) {
      const monthlyReturn = ((monthlyNAVs[i] - monthlyNAVs[i - 1]) / monthlyNAVs[i - 1]) * 100;
      monthlyReturns.push(monthlyReturn);
    }
  
    const avgMonthlyReturn = monthlyReturns.reduce((sum, ret) => sum + ret, 0) / monthlyReturns.length;
    const annualizedReturn = (Math.pow(1 + avgMonthlyReturn / 100, 12) - 1) * 100;
    const variance =
      monthlyReturns.reduce((sum, ret) => {
        return sum + Math.pow(ret - avgMonthlyReturn, 2);
      }, 0) / monthlyReturns.length;
    const monthlyVolatility = Math.sqrt(variance);
    const annualizedVolatility = monthlyVolatility * Math.sqrt(12);
    const excessReturn = annualizedReturn - riskFreeRate;
    const sharpeRatio = annualizedVolatility !== 0 ? excessReturn / annualizedVolatility : 0;
    let maxDrawdown = 0;
    let peak = monthlyNAVs[0];
  
    for (let i = 1; i < monthlyNAVs.length; i++) {
      if (monthlyNAVs[i] > peak) {
        peak = monthlyNAVs[i];
      }
      const drawdown = ((peak - monthlyNAVs[i]) / peak) * 100;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }
  
    return {
      annualizedReturn: Math.round(annualizedReturn * 100) / 100,
      annualizedVolatility: Math.round(annualizedVolatility * 100) / 100,
      sharpeRatio: Math.round(sharpeRatio * 100) / 100,
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      totalPeriods: monthlyNAVs.length,
      avgMonthlyReturn: Math.round(avgMonthlyReturn * 100) / 100,
    };
};