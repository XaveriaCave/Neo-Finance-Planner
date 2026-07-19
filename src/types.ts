/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum AssetType {
  Stocks = "Stocks",
  Bonds = "Bonds",
  SIPs = "SIPs (Mutual Funds)",
  Flat = "Flat (Real Estate)",
  Land = "Land (Real Estate)",
  FD = "Fixed Deposit (FD)",
  RD = "Recurring Deposit (RD)",
  Others = "Others"
}

export interface IncomeSource {
  id: string;
  sourceType: "Salary" | "Business" | "Freelance" | "EV Business" | "Others";
  customLabel?: string;
  amount: number;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  notes: string;
}

export interface AssetInvestment {
  id: string;
  type: AssetType;
  name: string;
  principal: number;
  monthlyContribution: number; // e.g. monthly investment for SIP, RD, or empty/0 for lump sum (Stocks, Flat, Land)
  annualReturnRate: number; // expected ROI %
  purchaseDate: string;
  // asset-specific configurations override the global configurations if provided
  rentalYield?: number; // % annual rent based on purchase price (for Real Estate)
  appreciationRate?: number; // % annual appreciation (for Flat/Land)
  taxRate?: number; // % tax on returns/gains
  maturityYears?: number; // for FD/RD
  exitBrokerage?: number; // % exit brokerage fee upon liquidation
}

export interface PlannerConfig {
  inflationRate: number; // % annual inflation rate
  defaultTaxBracket: number; // % tax rate on investment gains
  generalAppreciationRate: number; // % standard appreciation for Flat/Land
  generalRentalYield: number; // % standard rental yield
  defaultExitBrokerage: number; // % standard exit brokerage fee (e.g., 1-2% for real estate)
}

export interface AppState {
  inHandSalary: number;
  incomeSources: IncomeSource[];
  expenses: Expense[];
  savingsGoal: number; // Monthly savings goal
  investments: AssetInvestment[];
  config: PlannerConfig;
}
