/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AppState, IncomeSource, Expense, AssetInvestment } from "../types";
import { EXPENSE_CATEGORIES } from "../constants";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle,
  PiggyBank,
  LineChart,
  FileText,
  ChevronRight,
  Sliders
} from "lucide-react";

interface DashboardSummaryProps {
  state: AppState;
  categoryBudgets: Record<string, number>;
  onNavigate?: (tab: "income" | "expenses" | "portfolio" | "projection" | "report") => void;
  currency: string;
}

export default function DashboardSummary({ state, categoryBudgets, onNavigate, currency }: DashboardSummaryProps) {
  const { inHandSalary, incomeSources, expenses, savingsGoal, investments } = state;

  // 1. Calculate Total Income
  const additionalIncome = incomeSources.reduce((sum, inc) => sum + inc.amount, 0);
  const totalIncome = inHandSalary + additionalIncome;

  // 2. Calculate Total Expenses
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // 3. Calculate Actual Savings
  const actualSavings = Math.max(0, totalIncome - totalExpenses);

  // 4. Calculate Total Invested Principal & Portfolio Current Estimated Value
  const totalInvestedPrincipal = investments.reduce((sum, inv) => sum + inv.principal, 0);

  // Simple static calculation of cumulative SIP/monthly additions since purchase date
  // to give a realistic feel of portfolio scale, or just current principal value
  const totalPortfolioValue = investments.reduce((sum, inv) => {
    // For FD, RD, SIPs we can compute basic returns
    // For real estate (Flat, Land) we compute growth
    return sum + inv.principal;
  }, 0);

  // Savings target progress
  const savingsProgressPercent = Math.min(100, Math.round((actualSavings / savingsGoal) * 100));

  // Category wise expenses
  const categoryExpenses: Record<string, number> = {};
  EXPENSE_CATEGORIES.forEach(cat => {
    categoryExpenses[cat] = 0;
  });
  expenses.forEach(exp => {
    const cat = exp.category;
    if (categoryExpenses[cat] !== undefined) {
      categoryExpenses[cat] += exp.amount;
    } else {
      categoryExpenses[cat] = exp.amount;
    }
  });

  // Generate budget alerts
  const budgetAlerts: Array<{ category: string; spent: number; budget: number; severity: "warning" | "danger" }> = [];
  
  Object.entries(categoryBudgets).forEach(([category, limit]) => {
    const spent = categoryExpenses[category] || 0;
    if (spent > limit) {
      budgetAlerts.push({
        category,
        spent,
        budget: limit,
        severity: "danger"
      });
    } else if (spent > limit * 0.8) {
      budgetAlerts.push({
        category,
        spent,
        budget: limit,
        severity: "warning"
      });
    }
  });

  // Check if savings goal is met or breached
  const savingsStatus = actualSavings >= savingsGoal 
    ? { text: "Savings Goal Met!", color: "text-emerald-600 bg-emerald-50", icon: CheckCircle }
    : { text: "Savings Goal Underfunded", color: "text-amber-600 bg-amber-50", icon: AlertTriangle };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 main-grid">
      {/* Total Monthly Income Card */}
      <div 
        onClick={() => onNavigate?.("income")}
        className="nm-flat p-6 rounded-3xl md:col-span-6 lg:col-span-3 flex items-center justify-between transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer relative overflow-hidden card-income group" 
        id="card-income"
        title="Open Income Stream Screen"
      >
        <div className="space-y-1">
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase font-display flex items-center gap-1 group-hover:text-[var(--accent)] transition-colors">
            Total Income <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
          <div className="text-2xl font-bold font-display text-slate-800">{currency}{totalIncome.toLocaleString()}</div>
          <p className="text-[10px] text-emerald-500 font-mono flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Salary + {incomeSources.length} sources
          </p>
        </div>
        <div className="nm-pressed p-3 rounded-xl text-indigo-500 group-hover:text-[var(--accent)] transition-colors">
          <Wallet className="w-6 h-6" />
        </div>
      </div>

      {/* Total Monthly Expenses Card */}
      <div 
        onClick={() => onNavigate?.("expenses")}
        className="nm-flat p-6 rounded-3xl md:col-span-6 lg:col-span-3 flex items-center justify-between transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer relative overflow-hidden card-hero group" 
        id="card-expenses"
        title="Open Expenses & Budgets Screen"
      >
        <div className="space-y-1">
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase font-display flex items-center gap-1 group-hover:text-[var(--accent)] transition-colors">
            Monthly Expenses <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
          <div className="text-2xl font-bold font-display text-slate-800">{currency}{totalExpenses.toLocaleString()}</div>
          <p className="text-[10px] text-slate-500 font-mono">
            {expenses.length} transactions logged
          </p>
        </div>
        <div className={`p-3 rounded-xl transition-colors ${totalExpenses > totalIncome ? "nm-pressed text-rose-500 group-hover:text-rose-600" : "nm-pressed text-amber-500 group-hover:text-amber-600"}`}>
          <TrendingDown className="w-6 h-6" />
        </div>
      </div>

      {/* Net Monthly Savings */}
      <div 
        onClick={() => onNavigate?.("report")}
        className="nm-flat p-6 rounded-3xl md:col-span-6 lg:col-span-3 flex items-center justify-between transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer relative overflow-hidden card-summary group" 
        id="card-savings"
        title="Open Monthly Report Screen"
      >
        <div className="space-y-1">
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase font-display flex items-center gap-1 group-hover:text-[var(--accent)] transition-colors">
            Net Savings <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
          <div className="text-2xl font-bold font-display text-slate-800">{currency}{actualSavings.toLocaleString()}</div>
          <p className="text-[10px] text-indigo-500 font-mono">
            Savings rate: {totalIncome > 0 ? Math.round((actualSavings / totalIncome) * 100) : 0}%
          </p>
        </div>
        <div className="nm-pressed p-3 rounded-xl text-emerald-500 group-hover:text-emerald-600 transition-colors">
          <PiggyBank className="w-6 h-6" />
        </div>
      </div>

      {/* Total Portfolio Value */}
      <div 
        onClick={() => onNavigate?.("portfolio")}
        className="nm-flat p-6 rounded-3xl md:col-span-6 lg:col-span-3 flex items-center justify-between transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer relative overflow-hidden card-investments group" 
        id="card-investments"
        title="Open Asset Portfolio Screen"
      >
        <div className="space-y-1">
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase font-display flex items-center gap-1 group-hover:text-[var(--accent)] transition-colors">
            Total Portfolio <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
          <div className="text-2xl font-bold font-display text-slate-800">{currency}{totalPortfolioValue.toLocaleString()}</div>
          <p className="text-[10px] text-purple-500 font-mono">
            Across {investments.length} asset classes
          </p>
        </div>
        <div className="nm-pressed p-3 rounded-xl text-purple-500 group-hover:text-purple-600 transition-colors">
          <Sparkles className="w-6 h-6" />
        </div>
      </div>

      {/* Savings Goal Progress Indicator (5 Cols) */}
      <div className="nm-flat p-6 rounded-3xl md:col-span-12 lg:col-span-5 flex flex-col justify-between" id="savings-goal-container">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold font-display text-slate-800">Savings Target Tracker</h3>
            <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              Goal: {currency}{savingsGoal.toLocaleString()}
            </span>
          </div>
          
          <p className="text-xs text-slate-500 mb-6">
            Track your actual leftover savings against your monthly target of <strong>{currency}{savingsGoal.toLocaleString()}</strong>.
          </p>
        </div>

        <div className="space-y-4">
          {/* Custom Neumorphic Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-600">
              <span>Monthly Savings Progress</span>
              <span>{savingsProgressPercent}%</span>
            </div>
            <div className="h-6 w-full nm-pressed rounded-full p-1 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-indigo-500 to-emerald-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                style={{ width: `${savingsProgressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs p-3 rounded-xl bg-slate-50/50 border border-slate-100">
            <span className="font-semibold text-slate-600">Status:</span>
            <div className="flex items-center gap-1.5 font-bold font-display">
              {React.createElement(savingsStatus.icon, { className: "w-4 h-4 text-emerald-500" })}
              <span className={actualSavings >= savingsGoal ? "text-emerald-600" : "text-amber-600"}>
                {actualSavings >= savingsGoal 
                  ? `Goal met! Extra ${currency}${(actualSavings - savingsGoal).toLocaleString()} saved` 
                  : `Short of target by ${currency}${(savingsGoal - actualSavings).toLocaleString()}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Budget Alerts Panel (7 Cols) */}
      <div className="nm-flat p-6 rounded-3xl md:col-span-12 lg:col-span-7 flex flex-col" id="budget-alerts-container">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold font-display text-slate-800">Real-time Budget Alerts</h3>
          <span className="text-xs px-2.5 py-1 rounded-full font-mono font-bold bg-slate-200 text-slate-700">
            {budgetAlerts.length} Active Alerts
          </span>
        </div>

        <p className="text-xs text-slate-500 mb-4">
          Dynamic alerts trigger in real-time as expenses approach or exceed set limits. Set category budgets below to customize limits.
        </p>

        <div className="flex-1 overflow-y-auto max-h-[160px] space-y-3 pr-1">
          {budgetAlerts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 nm-pressed rounded-2xl bg-[#e0e5ec]/50">
              <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
              <p className="text-xs font-medium text-slate-600">All category expenses are within budget limits!</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Good job keeping your financial plans on track.</p>
            </div>
          ) : (
            budgetAlerts.map((alert, index) => (
              <div 
                key={index}
                className={`p-3 rounded-2xl flex items-start gap-3 border transition-all duration-300 ${
                  alert.severity === "danger" 
                    ? "bg-rose-50/75 border-rose-100 text-rose-800" 
                    : "bg-amber-50/75 border-amber-100 text-amber-800"
                }`}
              >
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${alert.severity === "danger" ? "text-rose-500 animate-pulse" : "text-amber-500"}`} />
                <div className="flex-1 text-xs">
                  <div className="flex justify-between items-center font-bold">
                    <span className="font-display">{alert.category}</span>
                    <span>
                      {alert.severity === "danger" ? "Budget Breached!" : "Approaching Limit"}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] opacity-90">
                    <span>Spent: <strong>{currency}{alert.spent.toLocaleString()}</strong></span>
                    <span>Limit: <strong>{currency}{alert.budget.toLocaleString()}</strong></span>
                  </div>
                  <div className="w-full bg-slate-200/50 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${alert.severity === "danger" ? "bg-rose-500" : "bg-amber-500"}`}
                      style={{ width: `${Math.min(100, (alert.spent / alert.budget) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Access Screen Launchers Grid */}
      <div className="md:col-span-12 mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Projections Launcher */}
        <button 
          onClick={() => onNavigate?.("projection")}
          className="nm-flat p-5 rounded-3xl flex items-center justify-between text-left cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] border border-white/20 group"
          id="btn-nav-projection"
        >
          <div className="flex items-center gap-4">
            <div className="nm-pressed p-3 rounded-2xl text-indigo-500 group-hover:text-[var(--accent)] transition-colors">
              <LineChart className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800 font-display flex items-center gap-1">
                Future Wealth Projection <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              </h4>
              <p className="text-[10px] text-slate-500">Simulate returns over a 40-year horizon</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[var(--accent)] transition-all group-hover:translate-x-1" />
        </button>

        {/* Reports Launcher */}
        <button 
          onClick={() => onNavigate?.("report")}
          className="nm-flat p-5 rounded-3xl flex items-center justify-between text-left cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] border border-white/20 group"
          id="btn-nav-report"
        >
          <div className="flex items-center gap-4">
            <div className="nm-pressed p-3 rounded-2xl text-emerald-500 group-hover:text-emerald-600 transition-colors">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800 font-display">Monthly Footprint Report</h4>
              <p className="text-[10px] text-slate-500">Get insights and export an offline PDF</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-all group-hover:translate-x-1" />
        </button>

        {/* Global Assumptions Panel trigger/info */}
        <div className="nm-flat p-5 rounded-3xl flex items-center justify-between text-left border border-white/20">
          <div className="flex items-center gap-4">
            <div className="nm-pressed p-3 rounded-2xl text-amber-500">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800 font-display">Assumptions Dashboard</h4>
              <p className="text-[10px] text-slate-500">Adjust inflation, taxes, yield anytime below</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
