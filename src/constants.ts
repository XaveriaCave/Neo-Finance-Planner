/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppState, AssetType, IncomeSource, Expense, AssetInvestment } from "./types";

export const EXPENSE_CATEGORIES = [
  "Housing (Rent/EMI)",
  "Food & Groceries",
  "Transport & Fuel",
  "Utilities & Internet",
  "Healthcare & Insurance",
  "Entertainment & Dining",
  "Shopping & Lifestyle",
  "Education",
  "Others"
];

export const INCOME_OPTIONS = [
  "Salary",
  "Business",
  "Freelance",
  "EV Business",
  "Others"
] as const;

export const INITIAL_INCOME_SOURCES: IncomeSource[] = [
  {
    id: "inc-1",
    sourceType: "Freelance",
    customLabel: "Mobile App Development",
    amount: 1500
  },
  {
    id: "inc-2",
    sourceType: "EV Business",
    customLabel: "Solar EV Charging Station",
    amount: 1200
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: "exp-1",
    category: "Housing (Rent/EMI)",
    amount: 1800,
    date: "2026-07-01",
    notes: "Monthly apartment rent"
  },
  {
    id: "exp-2",
    category: "Food & Groceries",
    amount: 600,
    date: "2026-07-05",
    notes: "Supermarket & organic stores"
  },
  {
    id: "exp-3",
    category: "Transport & Fuel",
    amount: 350,
    date: "2026-07-08",
    notes: "EV fast charging & train passes"
  },
  {
    id: "exp-4",
    category: "Utilities & Internet",
    amount: 250,
    date: "2026-07-10",
    notes: "Electricity, high-speed fiber & cellular"
  },
  {
    id: "exp-5",
    category: "Entertainment & Dining",
    amount: 450,
    date: "2026-07-12",
    notes: "Weekend dining & concerts"
  },
  {
    id: "exp-6",
    category: "Shopping & Lifestyle",
    amount: 400,
    date: "2026-07-15",
    notes: "Summer clothes & desk gadgets"
  }
];

export const INITIAL_INVESTMENTS: AssetInvestment[] = [
  {
    id: "inv-1",
    type: AssetType.Stocks,
    name: "Global Tech Growth ETF",
    principal: 25000,
    monthlyContribution: 500,
    annualReturnRate: 11.5,
    purchaseDate: "2024-01-15",
    taxRate: 15
  },
  {
    id: "inv-2",
    type: AssetType.SIPs,
    name: "Blue-Chip Compound Mutual Fund",
    principal: 10000,
    monthlyContribution: 300,
    annualReturnRate: 12,
    purchaseDate: "2024-06-01",
    taxRate: 10
  },
  {
    id: "inv-3",
    type: AssetType.Flat,
    name: "Metro 1BR Rental Unit",
    principal: 120000,
    monthlyContribution: 0,
    annualReturnRate: 5.0, // general real estate growth
    purchaseDate: "2023-03-10",
    rentalYield: 4.5,
    appreciationRate: 5.5,
    taxRate: 20
  },
  {
    id: "inv-4",
    type: AssetType.Land,
    name: "Suburban Greenbelt Parcel",
    principal: 65000,
    monthlyContribution: 0,
    annualReturnRate: 7.0,
    purchaseDate: "2022-11-20",
    appreciationRate: 8.0,
    taxRate: 18
  },
  {
    id: "inv-5",
    type: AssetType.Bonds,
    name: "Green Energy Sovereign Bonds",
    principal: 15000,
    monthlyContribution: 0,
    annualReturnRate: 5.8,
    purchaseDate: "2025-01-10",
    taxRate: 0 // Tax-free bonds
  },
  {
    id: "inv-6",
    type: AssetType.FD,
    name: "Premium Senior Trust FD",
    principal: 8000,
    monthlyContribution: 0,
    annualReturnRate: 7.2,
    purchaseDate: "2025-05-01",
    maturityYears: 3,
    taxRate: 20
  }
];

export const DEFAULT_CONFIG = {
  inflationRate: 4.5,
  defaultTaxBracket: 20,
  generalAppreciationRate: 6.0,
  generalRentalYield: 3.5,
  defaultExitBrokerage: 1.5
};

export const INITIAL_APP_STATE: AppState = {
  inHandSalary: 6500,
  incomeSources: INITIAL_INCOME_SOURCES,
  expenses: INITIAL_EXPENSES,
  savingsGoal: 2800,
  investments: INITIAL_INVESTMENTS,
  config: DEFAULT_CONFIG
};
