
// This file now re-exports all functions from smaller, more focused modules

export { safeNumber, isValidDate } from './safeConversion';
export { calculateTotals } from './totalCalculations';
export { calculateMonthlyComparison } from './monthlyComparison';
export { calculateDailyTransactions } from './dailyTransactions';
export { validateStatisticsData, ensureSafeStats } from './dataValidation';
export { generateClientStats } from './clientStatistics';
export { getTopClients } from './topClients';
