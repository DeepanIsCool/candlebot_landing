// Define interfaces for better type safety
interface SIPResult {
  futureValue: number;
  totalInvested: number;
  wealthGained: number;
  lumpSumContribution: number;
  sipContribution: number;
}

interface StepUpSIPResult {
  futureValue: number;
  totalInvested: number;
  wealthGained: number;
}

/**
 * Calculates the future value of a SIP (Systematic Investment Plan) with optional lump sum
 * @param principal - Initial lump sum investment (default: 0)
 * @param monthlyInvestment - Monthly SIP amount
 * @param annualRate - Expected annual rate of return (percentage)
 * @param years - Investment duration in years
 * @returns SIPResult object with calculated values
 */
export const calculateSIPFutureValue = (
  principal = 0,
  monthlyInvestment: number,
  annualRate: number,
  years: number,
): SIPResult => {
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

  // Round all values for consistency
  return {
    futureValue: Math.round(totalFutureValue * 100) / 100,
    totalInvested: Math.round(totalInvested * 100) / 100,
    wealthGained: Math.round(wealthGained * 100) / 100,
    lumpSumContribution: Math.round(lumpSumFV * 100) / 100,
    sipContribution: Math.round(sipFV * 100) / 100,
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
 * Calculates future value of SIP with annual step-up increases
 * @param initialSIP - Starting monthly SIP amount
 * @param stepUpPercentage - Annual percentage increase in SIP amount
 * @param principal - Initial lump sum investment (default: 0)
 * @param annualRate - Expected annual rate of return (percentage)
 * @param years - Investment duration in years
 * @returns StepUpSIPResult object with calculated values
 */
export const calculateStepUpSIP = (
  initialSIP: number,
  stepUpPercentage: number,
  principal = 0,
  annualRate: number,
  years: number,
): StepUpSIPResult => {
  if (initialSIP < 0 || stepUpPercentage < 0 || annualRate < 0 || years < 0 || principal < 0) {
    throw new Error("All parameters must be non-negative")
  }

  if (years === 0) {
    return {
      futureValue: principal,
      totalInvested: principal,
      wealthGained: 0,
    }
  }

  if (initialSIP === 0 && principal === 0) {
    throw new Error("Either initial SIP or principal must be greater than 0")
  }

  const monthlyRate = annualRate / 100 / 12
  const stepUpRate = stepUpPercentage / 100

  let totalInvested = principal
  let currentSIP = initialSIP
  let futureValue = principal

  // More accurate calculation for step-up SIP
  for (let year = 1; year <= years; year++) {
    const monthsInvestment = currentSIP * 12
    totalInvested += monthsInvestment

    // Calculate how much this year's SIP will grow
    const remainingYears = years - year
    const remainingMonths = remainingYears * 12

    if (monthlyRate > 0) {
      // Calculate the future value of current year's monthly investments
      const yearSIPFV = (currentSIP * (Math.pow(1 + monthlyRate, 12) - 1)) / monthlyRate
      // Compound this amount for the remaining years
      futureValue += yearSIPFV * Math.pow(1 + monthlyRate, remainingMonths)
    } else {
      // If no returns, just add the investment amount
      futureValue += monthsInvestment
    }

    // Increase SIP for next year
    currentSIP = currentSIP * (1 + stepUpRate)
  }

  const wealthGained = futureValue - totalInvested

  return {
    futureValue: Math.round(futureValue * 100) / 100,
    totalInvested: Math.round(totalInvested * 100) / 100,
    wealthGained: Math.round(wealthGained * 100) / 100,
  }
}
