// Common/result types for FD calculations
export interface FDCoreResult {
  principal: number;
  annualRate: number;
  tenure: number;
  totalInterest: number;
  maturityAmount: number;
  effectiveRate: number;
}

export interface SimpleFDResult extends FDCoreResult {
  interestType: 'Simple Interest';
}

export interface CompoundFDResult extends FDCoreResult {
  compoundingFrequency: number;
  compoundingType: string;
  interestType: 'Compound Interest';
}

export type FDResult = SimpleFDResult | CompoundFDResult;


// Summary type for investment comparison items returned by compareFDInvestments
export interface InvestmentComparisonItem {
  name: string;
  rate: number;
  maturityAmount: number;
  totalInterest: number;
  effectiveRate: number;
  taxable: boolean;
  liquidity: string;
  rank: number;
};


interface FDLadderDetail {
    fdNumber: number;
    principal: number;
    rate: number;
    tenure: number;
    maturityAmount: number;
    interest: number;
    maturityYear: number;
  }
  
  interface FDLadderResult {
    totalInvestment: number;
    numberOfFDs: number;
    amountPerFD: number;
    totalMaturityAmount: number;
    totalInterest: number;
    averageRate: number;
    fdDetails: FDLadderDetail[];
    strategy: string;
  }

  interface RateSlab {
    minTenure: number;
    maxTenure: number;
    rate: number;
  }
  
  interface TenureCalculation {
    tenureRange: string;
    averageTenure: number;
    rate: number;
    maturityAmount: number;
    totalInterest: number;
    annualizedReturn: number;
    effectiveRate: number;
  }
  
  interface OptimalTenureResult {
    principal: number;
    optimalChoice: TenureCalculation;
    allOptions: TenureCalculation[];
    recommendation: string;
  }
export const calculateSimpleFD = (principal: number, annualRate: number, tenure: number): SimpleFDResult => {
    if (principal <= 0 || annualRate < 0 || tenure <= 0) {
      throw new Error('Principal and tenure must be positive, rate must be non-negative');
    }
  
    const simpleInterest = (principal * annualRate * tenure) / 100;
    const maturityAmount = principal + simpleInterest;
  
    return {
      principal,
      annualRate,
      tenure,
      interestType: 'Simple Interest',
      totalInterest: Math.round(simpleInterest * 100) / 100,
      maturityAmount: Math.round(maturityAmount * 100) / 100,
      effectiveRate: annualRate
    };
  };
  
  
  export const calculateCompoundFD = (principal: number, annualRate: number, tenure: number, compoundingFrequency: number = 4): CompoundFDResult => {
    if (principal <= 0 || annualRate < 0 || tenure <= 0 || compoundingFrequency <= 0) {
      throw new Error('All parameters must be positive, rate must be non-negative');
    }
  
    const rate = annualRate / 100;
    const maturityAmount = principal * Math.pow(1 + (rate / compoundingFrequency), compoundingFrequency * tenure);
    const totalInterest = maturityAmount - principal;
    
    // Calculate effective annual rate
    const effectiveRate = (Math.pow(1 + (rate / compoundingFrequency), compoundingFrequency) - 1) * 100;
  
    const frequencyMap: Record<number, string> = {
      1: 'Annually',
      2: 'Half-yearly', 
      4: 'Quarterly',
      12: 'Monthly',
      365: 'Daily'
    };
  
    return {
      principal,
      annualRate,
      tenure,
      compoundingFrequency,
      compoundingType: frequencyMap[compoundingFrequency] || `${compoundingFrequency} times per year`,
      interestType: 'Compound Interest',
      totalInterest: Math.round(totalInterest * 100) / 100,
      maturityAmount: Math.round(maturityAmount * 100) / 100,
      effectiveRate: Math.round(effectiveRate * 100) / 100
    };
  };
  
 
  export const calculateFDWithTDS = (
    principal: number, 
    annualRate: number, 
    tenure: number, 
    taxRate: number = 10, 
    isCompound: boolean = true, 
    compoundingFrequency: number = 4
  ): (FDResult & {
    annualInterest: number;
    tdsThreshold: number;
    isTDSApplicable: boolean;
    tdsRate: number;
    annualTDS: number;
    totalTDS: number;
    netInterest: number;
    netMaturityAmount: number;
    grossMaturityAmount: number;
  }) => {
    if (principal <= 0 || annualRate < 0 || tenure <= 0 || taxRate < 0) {
      throw new Error('Principal and tenure must be positive, rates must be non-negative');
    }
  
    let fdResult: FDResult;
    if (isCompound) {
      fdResult = calculateCompoundFD(principal, annualRate, tenure, compoundingFrequency);
    } else {
      fdResult = calculateSimpleFD(principal, annualRate, tenure);
    }
  
    const totalInterest = fdResult.totalInterest;
    const annualInterest = totalInterest / tenure;
    
    const tdsThreshold = 40000;
    const isTDSApplicable = annualInterest > tdsThreshold;
    
    let tdsAmount = 0;
    let totalTDS = 0;
    
    if (isTDSApplicable) {
      tdsAmount = (annualInterest * taxRate) / 100;
      totalTDS = tdsAmount * tenure;
    }
  
    const netInterest = totalInterest - totalTDS;
    const netMaturityAmount = principal + netInterest;
  
    return {
      ...fdResult,
      annualInterest: Math.round(annualInterest * 100) / 100,
      tdsThreshold,
      isTDSApplicable,
      tdsRate: taxRate,
      annualTDS: Math.round(tdsAmount * 100) / 100,
      totalTDS: Math.round(totalTDS * 100) / 100,
      netInterest: Math.round(netInterest * 100) / 100,
      netMaturityAmount: Math.round(netMaturityAmount * 100) / 100,
      grossMaturityAmount: fdResult.maturityAmount
    };
  };
  
 
  export const calculateFDLadder = (totalAmount: number, numberOfFDs: number, interestRates: Array<number>, tenures: Array<number>): FDLadderResult => {
    if (totalAmount <= 0 || numberOfFDs <= 0) {
      throw new Error('Total amount and number of FDs must be positive');
    }
  
    if (interestRates.length !== numberOfFDs || tenures.length !== numberOfFDs) {
      throw new Error('Interest rates and tenures arrays must match number of FDs');
    }
  
    const amountPerFD = totalAmount / numberOfFDs;
    const fdDetails: FDLadderDetail[] = [];
    let totalMaturityAmount = 0;
    let totalInterest = 0;
  
    for (let i = 0; i < numberOfFDs; i++) {
      const fdResult = calculateCompoundFD(amountPerFD, interestRates[i], tenures[i]);
      fdDetails.push({
        fdNumber: i + 1,
        principal: amountPerFD,
        rate: interestRates[i],
        tenure: tenures[i],
        maturityAmount: fdResult.maturityAmount,
        interest: fdResult.totalInterest,
        maturityYear: tenures[i]
      });
      
      totalMaturityAmount += fdResult.maturityAmount;
      totalInterest += fdResult.totalInterest;
    }
  
    fdDetails.sort((a, b) => a.maturityYear - b.maturityYear);
  
    const averageRate = totalInterest / totalAmount * 100 / (fdDetails.reduce((sum, fd) => sum + fd.tenure, 0) / numberOfFDs);
  
    return {
      totalInvestment: totalAmount,
      numberOfFDs,
      amountPerFD: Math.round(amountPerFD * 100) / 100,
      totalMaturityAmount: Math.round(totalMaturityAmount * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      averageRate: Math.round(averageRate * 100) / 100,
      fdDetails,
      strategy: 'FD Ladder'
    };
  };
  
  
  export const compareFDInvestments = (
    amount: number,
    tenure: number,
    options: {
      fdRate?: number;
      savingsRate?: number;
      ppfRate?: number;
      nscRate?: number;
      kviRate?: number;
    } = {}
  ): Array<InvestmentComparisonItem> => {
    if (amount <= 0 || tenure <= 0) {
      throw new Error('Amount and tenure must be positive');
    }

    const {
      fdRate = 7,
      savingsRate = 4,
      ppfRate = 7.1,
      nscRate = 6.8,
      kviRate = 7.5
    } = options;

    const investments = [
      { name: 'Fixed Deposit', rate: fdRate, result: calculateCompoundFD(amount, fdRate, tenure, 4), taxable: true, liquidity: 'Medium' },
      { name: 'Savings Account', rate: savingsRate, result: calculateCompoundFD(amount, savingsRate, tenure, 12), taxable: true, liquidity: 'High' },
      { name: 'PPF', rate: ppfRate, result: calculateCompoundFD(amount, ppfRate, tenure, 1), taxable: false, liquidity: 'Low' },
      { name: 'NSC', rate: nscRate, result: calculateCompoundFD(amount, nscRate, tenure, 1), taxable: true, liquidity: 'Low' },
      { name: 'KVP', rate: kviRate, result: calculateCompoundFD(amount, kviRate, tenure, 1), taxable: true, liquidity: 'Medium' }
    ];

    const comparisons: Array<InvestmentComparisonItem> = investments.map(inv => ({
      name: inv.name,
      rate: inv.rate,
      maturityAmount: Math.round(inv.result.maturityAmount * 100) / 100,
      totalInterest: Math.round(inv.result.totalInterest * 100) / 100,
      effectiveRate: Math.round(inv.result.effectiveRate * 100) / 100,
      taxable: inv.taxable,
      liquidity: inv.liquidity,
      rank: 0
    }));

    comparisons.sort((a, b) => b.maturityAmount - a.maturityAmount);
    comparisons.forEach((item, idx) => { item.rank = idx + 1; });

    return comparisons;
  };
  
  
  export const calculateOptimalFDTenure = (principal: number, rateSlabs: RateSlab[]): OptimalTenureResult => {
    if (principal <= 0) {
      throw new Error('Principal must be positive');
    }
  
    if (!Array.isArray(rateSlabs) || rateSlabs.length === 0) {
      throw new Error('Rate slabs must be a non-empty array');
    }
  
    const calculations = rateSlabs.map(slab => {
      const { minTenure, maxTenure, rate } = slab;
      const avgTenure = (minTenure + maxTenure) / 2;
      
      const result = calculateCompoundFD(principal, rate, avgTenure);
      const annualizedReturn = Math.pow(result.maturityAmount / principal, 1 / avgTenure) - 1;
      
      return {
        tenureRange: `${minTenure} - ${maxTenure} years`,
        averageTenure: avgTenure,
        rate,
        maturityAmount: result.maturityAmount,
        totalInterest: result.totalInterest,
        annualizedReturn: Math.round(annualizedReturn * 100 * 100) / 100,
        effectiveRate: result.effectiveRate
      };
    });
  
    calculations.sort((a, b) => b.annualizedReturn - a.annualizedReturn);
  
    return {
      principal,
      optimalChoice: calculations[0],
      allOptions: calculations,
      recommendation: `Choose ${calculations[0].tenureRange} tenure for best annualized returns`
    };
  };

  export const calculateRD = (monthlyDeposit: number, annualRate: number, tenure: number): object => {
    if (monthlyDeposit <= 0 || annualRate < 0 || tenure <= 0) {
      throw new Error("Monthly deposit and tenure must be positive, rate must be non-negative");
    }
  
    const monthlyRate = annualRate / 100 / 12;
    const totalMonths = tenure * 12;
    const totalPrincipal = monthlyDeposit * totalMonths;
  
    let maturityAmount;
    if (monthlyRate === 0) {
      maturityAmount = totalPrincipal;
    } else {
      maturityAmount = monthlyDeposit * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);
    }
  
    const totalInterest = maturityAmount - totalPrincipal;
  
    return {
      monthlyDeposit,
      annualRate,
      tenure,
      totalMonths,
      totalPrincipal: Math.round(totalPrincipal * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      maturityAmount: Math.round(maturityAmount * 100) / 100,
      effectiveRate: totalPrincipal > 0 ? Math.round((totalInterest / totalPrincipal) * 100 * 100) / 100 : 0,
    };
  };
  
  export const calculatePrematureWithdrawal = (
    principal: number,
    originalRate: number,
    originalTenure: number,
    actualTenure: number,
    penaltyRate = 1,
  ): object => {
    if (principal <= 0 || originalRate < 0 || originalTenure <= 0 || actualTenure <= 0) {
      throw new Error("All parameters must be positive, rate must be non-negative");
    }
  
    if (actualTenure >= originalTenure) {
      throw new Error("Actual tenure must be less than original tenure for premature withdrawal");
    }
  
    const normalMaturity = calculateCompoundFD(principal, originalRate, actualTenure);
    const penalizedRate = Math.max(0, originalRate - penaltyRate);
    const penalizedMaturity = calculateCompoundFD(principal, penalizedRate, actualTenure);
    const penaltyAmount = normalMaturity.maturityAmount - penalizedMaturity.maturityAmount;
    const interestLoss = (principal * originalRate * (originalTenure - actualTenure)) / 100;
  
    return {
      principal,
      originalRate,
      originalTenure,
      actualTenure,
      penaltyRate,
      penalizedRate,
      normalMaturityAmount: normalMaturity.maturityAmount,
      penalizedMaturityAmount: penalizedMaturity.maturityAmount,
      penaltyAmount: Math.round(penaltyAmount * 100) / 100,
      estimatedInterestLoss: Math.round(interestLoss * 100) / 100,
      totalLoss: Math.round((penaltyAmount + interestLoss) * 100) / 100,
      netAmount: penalizedMaturity.maturityAmount,
    };
  };