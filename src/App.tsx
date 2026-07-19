/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { AppState } from "./types";
import { INITIAL_APP_STATE, EXPENSE_CATEGORIES } from "./constants";
import DashboardSummary from "./components/DashboardSummary";
import IncomeManager from "./components/IncomeManager";
import ExpenseTracker from "./components/ExpenseTracker";
import PortfolioInvestments from "./components/PortfolioInvestments";
import ConfigurationPanel from "./components/ConfigurationPanel";
import ProjectionSlider from "./components/ProjectionSlider";
import MonthlyReport from "./components/MonthlyReport";
import GuideGlossaryModal from "./components/GuideGlossaryModal";
import { motion, AnimatePresence } from "motion/react";
import { 
  TrendingUp, 
  Wallet, 
  Receipt, 
  LineChart, 
  FileText, 
  Sliders, 
  Briefcase,
  PiggyBank,
  RefreshCw,
  ArrowLeft,
  Home,
  ChevronRight,
  Info,
  BookOpen,
  X,
  HelpCircle,
  Search
} from "lucide-react";

const LOCAL_STORAGE_KEY = "neumorphic_planner_state";
const LOCAL_STORAGE_BUDGETS_KEY = "neumorphic_planner_budgets";
const LOCAL_STORAGE_CURRENCY_KEY = "neumorphic_planner_currency";

const DEFAULT_BUDGETS: Record<string, number> = {
  "Housing (Rent/EMI)": 2000,
  "Food & Groceries": 800,
  "Transport & Fuel": 450,
  "Utilities & Internet": 300,
  "Healthcare & Insurance": 400,
  "Entertainment & Dining": 500,
  "Shopping & Lifestyle": 600,
  "Education": 1000,
  "Others": 500
};

const SCREENS = {
  dashboard: {
    title: "Financial Hub",
    subtitle: "Your complete wealth planning snapshot",
    icon: Briefcase,
    color: "text-indigo-500 font-bold",
  },
  income: {
    title: "Income streams",
    subtitle: "Configure active salary & secondary revenue streams",
    icon: Wallet,
    color: "text-emerald-500 font-bold",
  },
  expenses: {
    title: "Expenses & Budget Tracker",
    subtitle: "Track monthly spending versus categorical limits",
    icon: Receipt,
    color: "text-amber-500 font-bold",
  },
  portfolio: {
    title: "Asset Portfolio Allocation",
    subtitle: "Manage investments, real estate, and fixed deposits",
    icon: TrendingUp,
    color: "text-purple-500 font-bold",
  },
  projection: {
    title: "Compound Wealth Projection",
    subtitle: "Simulate multi-decade compound return scenarios",
    icon: LineChart,
    color: "text-indigo-500 font-bold",
  },
  report: {
    title: "Financial Footprint Report",
    subtitle: "Generate off-line wealth statements & PDF printouts",
    icon: FileText,
    color: "text-rose-500 font-bold",
  }
};

export default function App() {
  // Load State from LocalStorage or use defaults
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.error("Error reading financial state from localStorage:", err);
    }
    return INITIAL_APP_STATE;
  });

  // Category Budgets State
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_BUDGETS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.error("Error reading category budgets from localStorage:", err);
    }
    return DEFAULT_BUDGETS;
  });

  // Preferred Currency State
  const [currency, setCurrency] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CURRENCY_KEY);
      if (saved) {
        return saved;
      }
    } catch (err) {
      console.error("Error reading currency from localStorage:", err);
    }
    return "$";
  });

  // Active Screen / View State
  const [activeTab, setActiveTab] = useState<"dashboard" | "income" | "expenses" | "portfolio" | "projection" | "report">("dashboard");

  // Show / Hide Global Configuration panel inside dedicated screens
  const [showAssumptions, setShowAssumptions] = useState<boolean>(false);

  // Show / Hide Guide & Glossary Popup
  const [showGlossary, setShowGlossary] = useState<boolean>(false);

  // Sync state with LocalStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_BUDGETS_KEY, JSON.stringify(categoryBudgets));
  }, [categoryBudgets]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_CURRENCY_KEY, currency);
  }, [currency]);

  // Update AppState
  const handleUpdateState = (updates: Partial<AppState>) => {
    setState(prev => ({
      ...prev,
      ...updates
    }));
  };

  // Update Category Budgets
  const handleUpdateBudgets = (newBudgets: Record<string, number>) => {
    setCategoryBudgets(newBudgets);
  };

  // Reset Playground data to initial defaults
  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset all data to initial demonstration defaults? This will overwrite your custom entries.")) {
      setState(INITIAL_APP_STATE);
      setCategoryBudgets(DEFAULT_BUDGETS);
      setCurrency("$");
      setActiveTab("dashboard");
      setShowAssumptions(false);
    }
  };

  // Intermediate calculations for real-time navigation statistics
  const additionalIncome = state.incomeSources.reduce((sum, inc) => sum + inc.amount, 0);
  const totalIncome = state.inHandSalary + additionalIncome;
  const totalExpenses = state.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const actualSavings = Math.max(0, totalIncome - totalExpenses);
  const savingsRate = totalIncome > 0 ? Math.round((actualSavings / totalIncome) * 100) : 0;
  const portfolioValue = state.investments.reduce((sum, inv) => sum + inv.principal, 0);

  const isHub = activeTab === "dashboard";

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex flex-col selection:bg-indigo-100 selection:text-indigo-800 pb-24 relative">
      
      {/* 1. Hub Screen Header (Only visible on Main Dashboard Hub) */}
      {isHub ? (
        <header className="w-full max-w-7xl mx-auto px-4 pt-8 pb-4 flex flex-col md:flex-row justify-between items-center gap-4 animate-fade-in">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="nm-flat p-3 rounded-3xl text-[var(--accent)] flex items-center justify-center">
              <PiggyBank className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold font-display tracking-tight text-slate-800">
                Neo Finance Planner
              </h1>
              <p className="text-xs text-slate-500">
                Interactive financial allocations & return compounding engine
              </p>
            </div>
          </div>

          {/* Global Tool Controls */}
          <div className="flex items-center gap-4">
            {/* Quick Goal Slider */}
            <div className="nm-flat-sm px-4 py-2 rounded-2xl flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-display">Target Savings:</span>
              <span className="text-xs font-mono font-bold text-slate-800">{currency}{state.savingsGoal.toLocaleString()}</span>
              <input 
                type="range"
                aria-label="Savings Goal Quick Slider"
                min="500"
                max="10000"
                step="100"
                className="w-16 h-1 bg-slate-300 rounded-lg appearance-none cursor-pointer"
                value={state.savingsGoal}
                onChange={(e) => handleUpdateState({ savingsGoal: Number(e.target.value) })}
              />
            </div>

            {/* Guide & Glossary Button */}
            <button
              onClick={() => setShowGlossary(true)}
              className="nm-btn px-4 py-2 rounded-2xl text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors duration-200 cursor-pointer flex items-center gap-1.5"
              title="Open financial guide & glossary of terms"
              id="btn-open-glossary-hub"
            >
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>Guide & Glossary</span>
            </button>

            {/* Reset Defaults */}
            <button
              onClick={handleResetData}
              className="nm-btn p-2.5 rounded-2xl text-slate-400 hover:text-[var(--accent)] transition-colors duration-200 cursor-pointer"
              title="Reset to default demonstration data"
              id="reset-demo-btn"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>
      ) : (
        /* 2. Focused Sub-Screen Header (Swapped when exploring a focused module) */
        <header className="w-full max-w-7xl mx-auto px-4 pt-6 pb-4 border-b border-slate-200/40 mb-6 bg-[var(--bg)]/85 backdrop-blur-md sticky top-0 z-40 transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Navigation & Title */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <button 
                onClick={() => {
                  setActiveTab("dashboard");
                  setShowAssumptions(false);
                }}
                className="nm-btn px-4 py-2 rounded-2xl text-xs font-bold text-slate-600 hover:text-[var(--accent)] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 self-start"
                id="btn-back-to-hub"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Hub
              </button>

              <div className="flex items-center gap-3">
                <div className="nm-pressed p-2.5 rounded-2xl text-[var(--accent)]">
                  {React.createElement(SCREENS[activeTab].icon, { className: "w-5 h-5" })}
                </div>
                <div>
                  <h2 className="text-base font-bold font-display text-slate-800">
                    {SCREENS[activeTab].title}
                  </h2>
                  <p className="text-[10px] text-slate-400">
                    {SCREENS[activeTab].subtitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Live Contextual Metrics Capsule & Collapsible Assumption Toggle */}
            <div className="flex items-center gap-3 self-end md:self-auto">
              {/* Context Stats */}
              {activeTab === "income" && (
                <span className="nm-pressed px-3.5 py-1.5 rounded-full text-xs font-mono font-bold text-emerald-600 bg-emerald-50/50">
                  Total Income: {currency}{totalIncome.toLocaleString()}/mo
                </span>
              )}
              {activeTab === "expenses" && (
                <span className={`nm-pressed px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-slate-50/50 ${totalExpenses > totalIncome ? "text-rose-500" : "text-amber-600"}`}>
                  Expenses: {currency}{totalExpenses.toLocaleString()}/mo
                </span>
              )}
              {activeTab === "portfolio" && (
                <span className="nm-pressed px-3.5 py-1.5 rounded-full text-xs font-mono font-bold text-purple-600 bg-purple-50/50">
                  Assets Compound: {currency}{portfolioValue.toLocaleString()}
                </span>
              )}
              {activeTab === "projection" && (
                <span className="nm-pressed px-3.5 py-1.5 rounded-full text-xs font-mono font-bold text-indigo-600 bg-indigo-50/50">
                  Compounding Simulation
                </span>
              )}
              {activeTab === "report" && (
                <span className="nm-pressed px-3.5 py-1.5 rounded-full text-xs font-mono font-bold text-rose-600 bg-rose-50/50">
                  Savings Rate: {savingsRate}%
                </span>
              )}

              {/* Guide & Glossary Button */}
              <button
                onClick={() => setShowGlossary(true)}
                className="nm-btn px-4 py-2 rounded-2xl text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors duration-200 cursor-pointer flex items-center gap-1.5"
                title="Open financial guide & glossary of terms"
                id="btn-open-glossary-sub"
              >
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <span>Guide & Glossary</span>
              </button>

              {/* Collapsible Assumptions Button */}
              <button 
                onClick={() => setShowAssumptions(!showAssumptions)}
                className={`nm-btn px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-95 ${
                  showAssumptions ? "nm-pressed text-[var(--accent)] font-extrabold" : "text-slate-600"
                }`}
                title="Adjust taxes, inflation, real-estate appreciation assumptions"
                id="btn-toggle-assumptions"
              >
                <Sliders className="w-3.5 h-3.5" /> Assumptions
              </button>
            </div>
          </div>

          {/* Quick inline sliders inside active separate screens */}
          <AnimatePresence>
            {showAssumptions && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden mt-4"
              >
                <div className="nm-flat p-5 rounded-3xl border border-white/20">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-3 font-display">
                    <Info className="w-4 h-4 text-amber-500" />
                    Modify Compounding Variables below to observe instant changes:
                  </div>
                  <ConfigurationPanel 
                    state={state} 
                    onChange={handleUpdateState} 
                    currency={currency}
                    onChangeCurrency={setCurrency}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>
      )}

      {/* Primary Content Stage */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-2" id="main-content-area">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="space-y-6"
          >
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                {/* 1. Hub Core Dashboard Content */}
                <DashboardSummary 
                  state={state} 
                  categoryBudgets={categoryBudgets} 
                  onNavigate={setActiveTab}
                  currency={currency}
                />

                {/* Macro Config is embedded gracefully at the bottom of the hub dashboard */}
                <div className="pt-6" id="hub-macro-assumptions">
                  <div className="flex items-center gap-2 mb-3">
                    <Sliders className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-sm font-extrabold text-slate-800 font-display">
                      Global Planning Assumptions
                    </h3>
                  </div>
                  <ConfigurationPanel 
                    state={state} 
                    onChange={handleUpdateState} 
                    currency={currency}
                    onChangeCurrency={setCurrency}
                  />
                </div>
              </div>
            )}

            {/* 2. Independent Active Screen Panels */}
            {activeTab === "income" && (
              <IncomeManager 
                state={state} 
                onChange={handleUpdateState} 
                currency={currency}
              />
            )}

            {activeTab === "expenses" && (
              <ExpenseTracker 
                state={state} 
                categoryBudgets={categoryBudgets} 
                onChange={handleUpdateState} 
                onUpdateBudgets={handleUpdateBudgets}
                currency={currency}
              />
            )}

            {activeTab === "portfolio" && (
              <PortfolioInvestments 
                state={state} 
                onChange={handleUpdateState} 
                currency={currency}
              />
            )}

            {activeTab === "projection" && (
              <ProjectionSlider 
                state={state} 
                currency={currency} 
              />
            )}

            {activeTab === "report" && (
              <MonthlyReport 
                state={state} 
                categoryBudgets={categoryBudgets} 
                currency={currency} 
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Immersive Floating Dock Navigation (Rendered on dedicated screens for quick hop navigation) */}
      <AnimatePresence>
        {activeTab !== "dashboard" && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-6 left-1/2 z-50 nm-flat px-4 py-2 rounded-full flex items-center gap-2.5 border border-white/50 shadow-2xl backdrop-blur-md"
            id="floating-nav-dock"
          >
            {/* Hub Home Button */}
            <button
              onClick={() => {
                setActiveTab("dashboard");
                setShowAssumptions(false);
              }}
              className="p-2.5 rounded-full hover:bg-slate-100/80 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
              title="Back to Financial Hub Home"
              id="dock-home"
            >
              <Home className="w-4 h-4" />
            </button>
            
            {/* Visual separator */}
            <div className="w-[1px] h-5 bg-slate-300/60" />

            {/* Income Streams Screen */}
            <button
              onClick={() => setActiveTab("income")}
              className={`p-2.5 rounded-full transition-all cursor-pointer ${
                activeTab === "income" 
                  ? "nm-pressed text-emerald-600 bg-emerald-50/50 scale-105" 
                  : "text-slate-500 hover:text-emerald-600 hover:bg-slate-50/50"
              }`}
              title="Income Stream Allocation"
              id="dock-income"
            >
              <Wallet className="w-4 h-4" />
            </button>

            {/* Expenses Tracker Screen */}
            <button
              onClick={() => setActiveTab("expenses")}
              className={`p-2.5 rounded-full transition-all cursor-pointer ${
                activeTab === "expenses" 
                  ? "nm-pressed text-amber-600 bg-amber-50/50 scale-105" 
                  : "text-slate-500 hover:text-amber-600 hover:bg-slate-50/50"
              }`}
              title="Expenses & Category Budgets"
              id="dock-expenses"
            >
              <Receipt className="w-4 h-4" />
            </button>

            {/* Asset Portfolio Screen */}
            <button
              onClick={() => setActiveTab("portfolio")}
              className={`p-2.5 rounded-full transition-all cursor-pointer ${
                activeTab === "portfolio" 
                  ? "nm-pressed text-purple-600 bg-purple-50/50 scale-105" 
                  : "text-slate-500 hover:text-purple-600 hover:bg-slate-50/50"
              }`}
              title="Portfolio compounding & Assets"
              id="dock-portfolio"
            >
              <TrendingUp className="w-4 h-4" />
            </button>

            {/* Wealth Projections Screen */}
            <button
              onClick={() => setActiveTab("projection")}
              className={`p-2.5 rounded-full transition-all cursor-pointer ${
                activeTab === "projection" 
                  ? "nm-pressed text-indigo-600 bg-indigo-50/50 scale-105" 
                  : "text-slate-500 hover:text-indigo-600 hover:bg-slate-50/50"
              }`}
              title="Compound Projections Model"
              id="dock-projection"
            >
              <LineChart className="w-4 h-4" />
            </button>

            {/* Monthly PDF Report Screen */}
            <button
              onClick={() => setActiveTab("report")}
              className={`p-2.5 rounded-full transition-all cursor-pointer ${
                activeTab === "report" 
                  ? "nm-pressed text-rose-600 bg-rose-50/50 scale-105" 
                  : "text-slate-500 hover:text-rose-600 hover:bg-slate-50/50"
              }`}
              title="Monthly Footprint Report & Export"
              id="dock-report"
            >
              <FileText className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guide & Glossary Knowledge Base Modal */}
      <GuideGlossaryModal 
        isOpen={showGlossary} 
        onClose={() => setShowGlossary(false)} 
        currency={currency} 
      />

      {/* Humble aesthetic page footer */}
      <footer className="w-full text-center py-6 text-[10px] text-slate-400 font-mono select-none border-t border-slate-200/50 mt-auto">
        Neumorphic Personal Wealth Management Core • Version 2.0.0 • Beautiful separate screens layout.
      </footer>
    </div>
  );
}
