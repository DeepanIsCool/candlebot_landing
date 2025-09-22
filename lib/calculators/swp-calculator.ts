export const calculateSWP = (initialAmount: number, monthlyWithdrawal: number, annualRate: number, years: number) => {
  // Input validation
  if (initialAmount <= 0 || monthlyWithdrawal <= 0 || annualRate < 0 || years <= 0) {
    throw new Error("Initial amount, withdrawal, and years must be positive; rate must be non-negative")
  }

  const monthlyRate = annualRate / 100 / 12
  const totalMonths = years * 12
  let currentBalance = initialAmount
  const withdrawalHistory = []
  let totalWithdrawn = 0
  let monthsUntilDepletion = 0

  for (let month = 1; month <= totalMonths; month++) {
    // Apply monthly return
    currentBalance = currentBalance * (1 + monthlyRate)

    // Check if withdrawal is possible
    if (currentBalance >= monthlyWithdrawal) {
      currentBalance -= monthlyWithdrawal
      totalWithdrawn += monthlyWithdrawal
      monthsUntilDepletion = month

      withdrawalHistory.push({
        month,
        balanceBeforeWithdrawal: currentBalance + monthlyWithdrawal,
        withdrawal: monthlyWithdrawal,
        balanceAfterWithdrawal: currentBalance,
      })
    } else {
      // Final partial withdrawal
      const finalWithdrawal = currentBalance
      totalWithdrawn += finalWithdrawal

      withdrawalHistory.push({
        month,
        balanceBeforeWithdrawal: currentBalance,
        withdrawal: finalWithdrawal,
        balanceAfterWithdrawal: 0,
      })

      currentBalance = 0
      monthsUntilDepletion = month
      break
    }
  }

  return {
    finalBalance: Math.round(currentBalance * 100) / 100,
    totalWithdrawn: Math.round(totalWithdrawn * 100) / 100,
    monthsUntilDepletion,
    yearsUntilDepletion: Math.round((monthsUntilDepletion / 12) * 100) / 100,
    isPerpetual: currentBalance > 0 && monthsUntilDepletion === totalMonths,
    withdrawalHistory: withdrawalHistory.slice(0, 12), // Return first 12 months as sample
  }
}

export const calculateSustainableWithdrawal = (initialAmount: number, annualRate: number, years = 30) => {
  if (initialAmount <= 0 || annualRate < 0 || years <= 0) {
    throw new Error("All parameters must be positive, rate must be non-negative")
  }

  const monthlyRate = annualRate / 100 / 12
  const totalMonths = years * 12

  if (monthlyRate === 0) {
    // If no returns, just divide equally
    return Math.round((initialAmount / totalMonths) * 100) / 100
  }

  // PMT formula: PMT = PV * [r(1 + r)^n] / [(1 + r)^n - 1]
  const sustainableAmount =
    (initialAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1)

  return Math.round(sustainableAmount * 100) / 100
}

/**
 * Calculate perpetual withdrawal (4% rule equivalent)
 * @param {number} initialAmount - Initial investment/corpus amount
 * @param {number} annualRate - Annual rate of return (as percentage)
 * @returns {object} Safe withdrawal amounts at different percentages
 */
type PerpetualWithdrawalOptions = {
  standardOptions: Record<`${number}%`, { annualWithdrawal: number; monthlyWithdrawal: number }>
  conservative: {
    rate: number
    annualWithdrawal: number
    monthlyWithdrawal: number
  }
}

export const calculatePerpetualWithdrawal = (initialAmount: number, annualRate: number): PerpetualWithdrawalOptions => {
  if (initialAmount <= 0 || annualRate < 0) {
    throw new Error("Initial amount must be positive, rate must be non-negative")
  }

  const safeRates = [3, 3.5, 4, 4.5, 5] // Safe withdrawal rates as percentages
  const withdrawalOptions: Record<`${number}%`, { annualWithdrawal: number; monthlyWithdrawal: number }> = {} as Record<
    `${number}%`,
    { annualWithdrawal: number; monthlyWithdrawal: number }
  >

  safeRates.forEach((rate) => {
    const annualWithdrawal = (initialAmount * rate) / 100
    const monthlyWithdrawal = annualWithdrawal / 12

    withdrawalOptions[`${rate}%`] = {
      annualWithdrawal: Math.round(annualWithdrawal * 100) / 100,
      monthlyWithdrawal: Math.round(monthlyWithdrawal * 100) / 100,
    }
  })

  // Custom rate based on actual returns (conservative approach)
  const conservativeRate = Math.max(annualRate - 2, 3) // 2% buffer for inflation
  const customAnnual = (initialAmount * conservativeRate) / 100
  const customMonthly = customAnnual / 12

  return {
    standardOptions: withdrawalOptions,
    conservative: {
      rate: conservativeRate,
      annualWithdrawal: Math.round(customAnnual * 100) / 100,
      monthlyWithdrawal: Math.round(customMonthly * 100) / 100,
    },
  }
}

export const calculateStepUpSWP = (
  initialAmount: number,
  initialWithdrawal: number,
  stepUpPercentage: number,
  annualRate: number,
  years: number,
) => {
  if (initialAmount <= 0 || initialWithdrawal <= 0 || stepUpPercentage < 0 || annualRate < 0 || years <= 0) {
    throw new Error("All parameters must be positive except step-up which can be zero")
  }

  const monthlyRate = annualRate / 100 / 12
  const stepUpRate = stepUpPercentage / 100

  let currentBalance = initialAmount
  let currentWithdrawal = initialWithdrawal
  let totalWithdrawn = 0
  let monthsCompleted = 0

  for (let year = 1; year <= years; year++) {
    for (let month = 1; month <= 12; month++) {
      monthsCompleted++

      // Apply monthly return
      currentBalance = currentBalance * (1 + monthlyRate)

      // Check if withdrawal is possible
      if (currentBalance >= currentWithdrawal) {
        currentBalance -= currentWithdrawal
        totalWithdrawn += currentWithdrawal
      } else {
        // Final withdrawal and exit
        totalWithdrawn += currentBalance
        currentBalance = 0
        break
      }
    }

    if (currentBalance === 0) break

    // Step up withdrawal for next year
    currentWithdrawal = currentWithdrawal * (1 + stepUpRate)
  }

  return {
    finalBalance: Math.round(currentBalance * 100) / 100,
    totalWithdrawn: Math.round(totalWithdrawn * 100) / 100,
    monthsCompleted,
    yearsCompleted: Math.round((monthsCompleted / 12) * 100) / 100,
    finalWithdrawalAmount: Math.round(currentWithdrawal * 100) / 100,
  }
}
