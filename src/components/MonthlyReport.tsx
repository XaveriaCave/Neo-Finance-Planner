/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AppState, AssetType } from "../types";
import { EXPENSE_CATEGORIES } from "../constants";
import { FileText, Download, CheckCircle, AlertTriangle, TrendingUp, Sparkles, ChevronRight } from "lucide-react";
import { jsPDF } from "jspdf";

interface MonthlyReportProps {
  state: AppState;
  categoryBudgets: Record<string, number>;
  currency: string;
}

export default function MonthlyReport({ state, categoryBudgets, currency }: MonthlyReportProps) {
  const { inHandSalary, incomeSources, expenses, savingsGoal, investments, config } = state;

  const totalAdditionalIncome = incomeSources.reduce((sum, inc) => sum + inc.amount, 0);
  const totalIncome = inHandSalary + totalAdditionalIncome;
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const actualSavings = Math.max(0, totalIncome - totalExpenses);
  const savingsRate = totalIncome > 0 ? Math.round((actualSavings / totalIncome) * 100) : 0;

  // Calculate Category-wise Expenditures
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

  // Calculate Investment Statistics
  const totalInvestedPrincipal = investments.reduce((sum, inv) => sum + inv.principal, 0);

  // Generate recommendations based on app state
  const recommendations: Array<{ text: string; type: "success" | "warning" | "info" }> = [];

  if (savingsRate >= 35) {
    recommendations.push({
      text: `Your savings rate is ${savingsRate}%, which is outstanding! You are in the hyper-saver bracket.`,
      type: "success"
    });
  } else if (savingsRate >= 20) {
    recommendations.push({
      text: `Your savings rate is ${savingsRate}%. This satisfies the 50-30-20 rule. Keep it up!`,
      type: "success"
    });
  } else {
    recommendations.push({
      text: `Your savings rate is ${savingsRate}%, which is below the recommended 20% benchmark. Consider auditing discretionary expenses.`,
      type: "warning"
    });
  }

  // Budget breaches check
  let breachedCount = 0;
  Object.entries(categoryBudgets).forEach(([category, budget]) => {
    const spent = categoryExpenses[category] || 0;
    if (spent > budget) {
      breachedCount++;
    }
  });

  if (breachedCount > 0) {
    recommendations.push({
      text: `You have exceeded your set budget limit in ${breachedCount} category(ies). Review the "Real-time Budget Alerts" tab.`,
      type: "warning"
    });
  } else {
    recommendations.push({
      text: "Outstanding budget control! All your monthly expense categories are completely within your limits.",
      type: "success"
    });
  }

  // Portfolio diversity check
  const assetTypesRepresented = new Set(investments.map(inv => inv.type));
  if (assetTypesRepresented.size >= 4) {
    recommendations.push({
      text: `Excellent asset diversification! You are invested across ${assetTypesRepresented.size} distinct asset classes, protecting your wealth from single-market risks.`,
      type: "success"
    });
  } else {
    recommendations.push({
      text: "Consider diversifying your portfolio. Investing in a mix of Stocks, SIPs, Real Estate (Flat/Land), and Bonds reduces overall risk.",
      type: "info"
    });
  }

  // Real estate passive income check
  const realEstatePrincipal = investments
    .filter(inv => inv.type === AssetType.Flat || inv.type === AssetType.Land)
    .reduce((sum, inv) => sum + inv.principal, 0);

  if (realEstatePrincipal > 0) {
    recommendations.push({
      text: `Real estate holdings detected: ${currency}${realEstatePrincipal.toLocaleString()} in land/properties. Ensure global macro appreciation parameters (${config.generalAppreciationRate}%) match regional property indices.`,
      type: "info"
    });
  }

  // Generate PDF via jsPDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const c = currency;

    // Header styling helper
    const drawDivider = (y: number) => {
      doc.setDrawColor(220, 225, 230);
      doc.line(15, y, 195, y);
    };

    // 1. Report Title & Meta
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text("NEUMORPHIC FINANCIAL PLANNER", 15, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("Confidential Personal Wealth & Budget Summary Report", 15, 26);
    doc.text(`Generated Date: ${new Date().toLocaleDateString()} | Planner Horizon`, 15, 31);
    
    drawDivider(35);

    // 2. Core Metrics Summary Grid
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text("A. MONTHLY INCOME & CASH FLOW", 15, 43);
    
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text(`Primary Net Salary: ${c}${inHandSalary.toLocaleString()}`, 20, 50);
    doc.text(`Additional Income Streams: ${c}${totalAdditionalIncome.toLocaleString()}`, 20, 56);
    doc.text(`Total Cash Inflow: ${c}${totalIncome.toLocaleString()}`, 20, 62);
    
    doc.setTextColor(225, 29, 72); // rose-600
    doc.text(`Total Cash Outflow: ${c}${totalExpenses.toLocaleString()}`, 110, 50);
    
    doc.setTextColor(16, 185, 129); // emerald-600
    doc.text(`Actual Saved Capital: ${c}${actualSavings.toLocaleString()}`, 110, 56);
    doc.text(`Monthly Savings Goal: ${c}${savingsGoal.toLocaleString()}`, 110, 62);

    drawDivider(68);

    // 3. Category Expenses
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text("B. CATEGORIZED EXPENDITURES", 15, 76);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("Category", 20, 83);
    doc.text("Amount Spent", 90, 83);
    doc.text("Budget Limit", 140, 83);
    drawDivider(86);

    let expenseY = 92;
    doc.setTextColor(51, 65, 85);
    EXPENSE_CATEGORIES.forEach((cat) => {
      const spent = categoryExpenses[cat] || 0;
      const budget = categoryBudgets[cat] || 500;
      if (spent > 0) {
        doc.text(cat.split(" (")[0], 20, expenseY);
        doc.text(`${c}${spent.toLocaleString()}`, 90, expenseY);
        doc.text(`${c}${budget.toLocaleString()}`, 140, expenseY);
        expenseY += 7;
      }
    });

    drawDivider(expenseY + 2);

    // 4. Portfolio Assets
    let portfolioY = expenseY + 10;
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text("C. PORTFOLIO ASSETS & EXPECTED ROI", 15, portfolioY);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("Asset Name / Class", 20, portfolioY + 7);
    doc.text("Purchase Date", 80, portfolioY + 7);
    doc.text("Principal", 120, portfolioY + 7);
    doc.text("Expected ROI (%)", 160, portfolioY + 7);
    drawDivider(portfolioY + 10);

    let assetY = portfolioY + 16;
    doc.setTextColor(51, 65, 85);
    investments.forEach((inv) => {
      doc.text(`${inv.name} (${inv.type.split(" (")[0]})`, 20, assetY);
      doc.text(inv.purchaseDate, 80, assetY);
      doc.text(`${c}${inv.principal.toLocaleString()}`, 120, assetY);
      doc.text(`${inv.annualReturnRate}%`, 160, assetY);
      assetY += 7;
    });

    drawDivider(assetY + 2);

    // 5. Global Config & Advice
    let configY = assetY + 10;
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text("D. MACROECONOMIC CONDITIONS & ADVICE", 15, configY);

    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(`Assumed Annual Inflation Rate: ${config.inflationRate}%`, 20, configY + 7);
    doc.text(`Default Gains Tax Bracket: ${config.defaultTaxBracket}%`, 20, configY + 13);
    doc.text(`Real Estate Average Appreciation: ${config.generalAppreciationRate}%`, 110, configY + 7);
    doc.text(`Average Flat Rental Yield: ${config.generalRentalYield}%`, 110, configY + 13);

    let adviceY = configY + 23;
    doc.setFontSize(10);
    doc.setTextColor(99, 102, 241); // indigo-500
    doc.text("Financial Recommendation Insights:", 15, adviceY);
    
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    let bulletY = adviceY + 6;
    recommendations.forEach((rec) => {
      const prefix = rec.type === "success" ? "[PASS] " : rec.type === "warning" ? "[WARN] " : "[INFO] ";
      // Wrap text
      const lines = doc.splitTextToSize(`${prefix}${rec.text}`, 170);
      lines.forEach((line: string) => {
        doc.text(line, 20, bulletY);
        bulletY += 5;
      });
    });

    // Save
    doc.save("Personal_Wealth_Monthly_Plan.pdf");
  };

  return (
    <div className="space-y-6">
      {/* Monthly Summary Preview Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Core Financial Footprint Summary List (7 Cols) */}
        <div className="nm-flat p-6 rounded-3xl lg:col-span-7 flex flex-col" id="report-footprint-card">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-base font-bold font-display text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[var(--accent)]" />
              Monthly Footprint Overview
            </h3>
            <button
              onClick={handleExportPDF}
              className="nm-btn-primary px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 cursor-pointer"
              id="export-pdf-btn"
            >
              <Download className="w-3.5 h-3.5" />
              Export PDF Report
            </button>
          </div>
          <p className="text-xs text-slate-500 mb-6">
            Audit and export your monthly financial blueprint.
          </p>

          <div className="space-y-6 flex-1 max-h-[450px] overflow-y-auto pr-1">
            {/* Cash Flow Block */}
            <div className="p-4 rounded-2xl bg-white/40 border border-slate-100 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-display">A. Cash Inflow & Outflow</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium text-slate-600 pt-1">
                <div className="space-y-1">
                  <span className="block text-[10px] text-slate-400">Total Monthly Cash Inflow</span>
                  <span className="text-sm font-bold text-slate-800">{currency}{totalIncome.toLocaleString()}</span>
                </div>
                <div className="space-y-1">
                  <span className="block text-[10px] text-slate-400">Total Monthly Expenditures</span>
                  <span className="text-sm font-bold text-[var(--danger)]">{currency}{totalExpenses.toLocaleString()}</span>
                </div>
                <div className="space-y-1">
                  <span className="block text-[10px] text-slate-400">Actual Leftover Savings</span>
                  <span className="text-sm font-bold text-emerald-600">{currency}{actualSavings.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Categorized Expenditures preview */}
            <div className="p-4 rounded-2xl bg-white/40 border border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-display">B. Logged Expenses Vs. Budgets</span>
              <div className="space-y-2 pt-2">
                {EXPENSE_CATEGORIES.map((cat) => {
                  const spent = categoryExpenses[cat] || 0;
                  const budget = categoryBudgets[cat] || 500;
                  if (spent === 0) return null;

                  return (
                    <div key={cat} className="flex justify-between items-center text-xs text-slate-600 py-1 border-b border-dashed border-slate-100">
                      <span className="truncate max-w-[200px]">{cat.split(" (")[0]}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-800">{currency}{spent.toLocaleString()}</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-400">{currency}{budget.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Investments */}
            <div className="p-4 rounded-2xl bg-white/40 border border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-display">C. Portfolio Assets List</span>
              <div className="space-y-2 pt-2">
                {investments.map((inv) => (
                  <div key={inv.id} className="flex justify-between items-center text-xs text-slate-600 py-1 border-b border-slate-100/50">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-800">{inv.name}</span>
                      <span className="block text-[10px] text-slate-400 font-mono">{inv.type} | Purchased: {inv.purchaseDate}</span>
                    </div>
                    <span className="font-semibold text-[var(--accent)]">{currency}{inv.principal.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Personalized AI Financial Recommendations & Action Items (5 Cols) */}
        <div className="nm-flat p-6 rounded-3xl lg:col-span-5 flex flex-col justify-between" id="recommendations-container">
          <div>
            <h3 className="text-base font-bold font-display text-slate-800 flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
              Strategic Insights
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Personalized, real-time guidelines computed based on your inputs and assumptions.
            </p>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto max-h-[350px] pr-1">
            {recommendations.map((rec, index) => (
              <div 
                key={index}
                className={`p-4 rounded-2xl border text-xs leading-relaxed flex gap-3 ${
                  rec.type === "success" 
                    ? "bg-emerald-50/75 border-emerald-100 text-emerald-800"
                    : rec.type === "warning"
                      ? "bg-rose-50/75 border-rose-100 text-rose-800"
                      : "bg-indigo-50/75 border-indigo-100 text-indigo-800"
                }`}
              >
                {rec.type === "success" ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-500 mt-0.5" />
                ) : rec.type === "warning" ? (
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5 animate-bounce" />
                ) : (
                  <TrendingUp className="w-5 h-5 flex-shrink-0 text-indigo-500 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold text-slate-700 capitalize font-display mb-0.5">
                    {rec.type === "success" ? "Optimal Footprint" : rec.type === "warning" ? "Attention Required" : "Strategic Diversification"}
                  </p>
                  <p className="text-slate-600 leading-snug">{rec.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Download your complete summary plan anytime.</span>
            <ChevronRight className="w-4 h-4 text-indigo-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
