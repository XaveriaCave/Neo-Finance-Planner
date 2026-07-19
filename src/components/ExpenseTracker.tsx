/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { AppState, Expense } from "../types";
import { EXPENSE_CATEGORIES } from "../constants";
import { Plus, Trash2, Calendar, FileText, AlertCircle, Sparkles, PieChart as PieIcon, Sliders, ChevronDown } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ExpenseTrackerProps {
  state: AppState;
  categoryBudgets: Record<string, number>;
  onChange: (updates: Partial<AppState>) => void;
  onUpdateBudgets: (newBudgets: Record<string, number>) => void;
  currency: string;
}

const COLORS = [
  "#6366f1", // Indigo
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#ec4899", // Pink
  "#ef4444", // Red
  "#06b6d4", // Cyan
  "#8b5cf6", // Purple
  "#14b8a6", // Teal
  "#64748b"  // Slate
];

export default function ExpenseTracker({ state, categoryBudgets, onChange, onUpdateBudgets, currency }: ExpenseTrackerProps) {
  const { expenses } = state;

  // New Expense State
  const [newCategory, setNewCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [newAmount, setNewAmount] = useState<number | "">("");
  const [newDate, setNewDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const [newNotes, setNewNotes] = useState("");

  // Budget Adjuster active state
  const [editingBudgets, setEditingBudgets] = useState(false);

  // Add Expense
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(newAmount);
    if (!amount || amount <= 0) return;

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      category: newCategory,
      amount,
      date: newDate,
      notes: newNotes
    };

    onChange({
      expenses: [newExpense, ...expenses]
    });

    setNewAmount("");
    setNewNotes("");
  };

  // Remove Expense
  const handleRemoveExpense = (id: string) => {
    onChange({
      expenses: expenses.filter(exp => exp.id !== id)
    });
  };

  // Update a single category budget
  const handleBudgetChange = (category: string, value: number) => {
    onUpdateBudgets({
      ...categoryBudgets,
      [category]: isNaN(value) ? 0 : Math.max(0, value)
    });
  };

  // Aggregate expenditures by category for charts
  const categorySummary = EXPENSE_CATEGORIES.map((cat) => {
    const total = expenses
      .filter((exp) => exp.category === cat)
      .reduce((sum, exp) => sum + exp.amount, 0);
    return { name: cat, value: total };
  }).filter((item) => item.value > 0);

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-6">
      {/* Log Expense & Set Category Budgets Dual Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form to Add Expense (5 Cols) */}
        <div className="nm-flat p-6 rounded-3xl lg:col-span-5" id="add-expense-container">
          <h3 className="text-base font-bold font-display text-slate-800 mb-1 flex items-center gap-2">
            <Plus className="w-5 h-5 text-[var(--accent)]" />
            Log Monthly Expense
          </h3>
          <p className="text-xs text-slate-500 mb-5">
            Log your regular bills, food receipts, lifestyle spending.
          </p>

          <form onSubmit={handleAddExpense} className="space-y-4">
            {/* Category Dropdown */}
            <div className="space-y-1.5">
              <label htmlFor="expense-category-select" className="text-xs font-semibold text-slate-500">Category</label>
              <select
                id="expense-category-select"
                className="nm-input w-full px-4 py-2.5 rounded-2xl text-slate-700 text-sm font-medium bg-[#fcfdfe] cursor-pointer"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <label htmlFor="expense-amount-input" className="text-xs font-semibold text-slate-500">Amount ({currency})</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currency}</span>
                <input
                  type="number"
                  id="expense-amount-input"
                  className="nm-input w-full pl-8 pr-4 py-2.5 rounded-2xl text-slate-700 text-sm"
                  placeholder="e.g. 75"
                  min="0.01"
                  step="0.01"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  required
                />
              </div>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label htmlFor="expense-date-input" className="text-xs font-semibold text-slate-500">Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="date"
                  id="expense-date-input"
                  className="nm-input w-full pl-11 pr-4 py-2.5 rounded-2xl text-slate-700 text-sm"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label htmlFor="expense-notes-input" className="text-xs font-semibold text-slate-500">Notes (Optional)</label>
              <div className="relative">
                <FileText className="absolute left-4 top-3 text-slate-400 w-4 h-4" />
                <textarea
                  id="expense-notes-input"
                  className="nm-input w-full pl-11 pr-4 py-2.5 rounded-2xl text-slate-700 text-sm h-20 resize-none"
                  placeholder="e.g. Trader Joe's dinner ingredients"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="nm-btn-primary w-full py-2.5 rounded-2xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 mt-2 cursor-pointer"
              id="log-expense-btn"
            >
              <Plus className="w-4 h-4" /> Log Expense
            </button>
          </form>
        </div>

        {/* Set Category Budgets Panel (7 Cols) */}
        <div className="nm-flat p-6 rounded-3xl lg:col-span-7 flex flex-col" id="budgets-config-container">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-base font-bold font-display text-slate-800 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-500" />
              Category Budget Limits
            </h3>
            <button
              onClick={() => setEditingBudgets(!editingBudgets)}
              className="nm-btn px-3 py-1.5 rounded-2xl text-xs font-bold text-slate-600 flex items-center gap-1 cursor-pointer"
              id="toggle-edit-budgets-btn"
            >
              {editingBudgets ? "Done Editing" : "Configure Budgets"}
            </button>
          </div>
          <p className="text-xs text-slate-500 mb-5">
            Configure monthly targets per expense category to enable real-time dashboard notifications.
          </p>

          <div className="flex-1 overflow-y-auto max-h-[300px] space-y-4 pr-1">
            {EXPENSE_CATEGORIES.map((category) => {
              const spent = expenses
                .filter((exp) => exp.category === category)
                .reduce((sum, exp) => sum + exp.amount, 0);
              const limit = categoryBudgets[category] || 500;
              const ratio = Math.min(100, spent > 0 && limit > 0 ? (spent / limit) * 100 : 0);

              return (
                <div key={category} className="space-y-1.5 p-3.5 nm-flat-sm rounded-3xl border border-white/40">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">{category}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-slate-400 font-medium">Spent:</span>
                      <span className={`font-bold ${spent > limit ? "text-[var(--danger)]" : "text-slate-700"}`}>
                        {currency}{spent.toLocaleString()}
                      </span>
                      <span className="text-slate-300">/</span>
                      {editingBudgets ? (
                        <div className="relative w-24">
                          <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">{currency}</span>
                          <input
                            type="number"
                            className="nm-input w-full pl-4 pr-1 py-1 rounded-lg text-xs font-bold text-[var(--accent)] font-mono text-right"
                            value={limit}
                            onChange={(e) => handleBudgetChange(category, Number(e.target.value))}
                            placeholder="Limit"
                            min="0"
                          />
                        </div>
                      ) : (
                        <span className="font-bold text-[var(--accent)]">
                          {currency}{limit.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Visual Progress Ratio */}
                  <div className="w-full h-2 nm-pressed rounded-full p-0.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        spent > limit 
                          ? "bg-rose-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]" 
                          : ratio > 80 
                            ? "bg-amber-400 shadow-[0_0_5px_rgba(245,158,11,0.5)]" 
                            : "bg-indigo-500"
                      }`}
                      style={{ width: `${ratio}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Visual Spending Distribution Chart & Logged Expenses Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Spending Breakdown Chart (5 Cols) */}
        <div className="nm-flat p-6 rounded-3xl lg:col-span-5 flex flex-col justify-between" id="expense-chart-container">
          <div>
            <h3 className="text-base font-bold font-display text-slate-800 flex items-center gap-2 mb-1">
              <PieIcon className="w-5 h-5 text-purple-500" />
              Category Breakdown
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Visual share of total expenditures ({currency}{totalSpent.toLocaleString()} spent) across categories.
            </p>
          </div>

          <div className="h-64 w-full flex items-center justify-center relative">
            {categorySummary.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-50/20 rounded-2xl">
                <AlertCircle className="w-8 h-8 text-slate-400 mb-2 animate-bounce" />
                <p className="text-xs font-medium text-slate-500">No expenses logged yet</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Use the log form above to record spending.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySummary}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categorySummary.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${currency}${value.toLocaleString()}`, "Spent"]}
                    contentStyle={{
                      background: "#ffffff",
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      fontSize: "12px"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Quick Legend indicators */}
          {categorySummary.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-4 max-h-[100px] overflow-y-auto pr-1">
              {categorySummary.map((item, index) => (
                <div key={item.name} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="truncate max-w-[100px]">{item.name}</span>
                  <span className="font-bold text-slate-700 ml-auto">{currency}{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transaction History Table (7 Cols) */}
        <div className="nm-flat p-6 rounded-3xl lg:col-span-7 flex flex-col" id="logged-expenses-container">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-base font-bold font-display text-slate-800">Transaction History</h3>
            <span className="text-xs font-mono font-bold text-[var(--danger)] bg-rose-50 px-2.5 py-0.5 rounded-full">
              Logged: {expenses.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-5">
            Audit and manage your logged monthly transactions.
          </p>

          <div className="flex-1 overflow-y-auto max-h-[350px] space-y-3 pr-1">
            {expenses.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 nm-pressed rounded-3xl bg-[#e0e5ec]/50">
                <Sparkles className="w-8 h-8 text-indigo-400 mb-2" />
                <p className="text-xs font-medium text-slate-500">No expenses recorded yet.</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Use the form on the left to keep track of spending.</p>
              </div>
            ) : (
              expenses.map((expense) => (
                <div 
                  key={expense.id} 
                  className="nm-flat-sm p-4 rounded-3xl flex items-center justify-between border border-white/50 transition-all duration-300 hover:scale-[1.01]"
                >
                  <div className="space-y-1 max-w-[70%]">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold font-mono text-slate-500 uppercase px-1.5 py-0.5 rounded bg-slate-200/50">
                        {expense.category.split(" (")[0]}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{expense.date}</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-800 truncate">
                      {expense.notes || "Unspecified expense"}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-base font-bold font-display text-slate-700">
                      -{currency}{expense.amount.toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleRemoveExpense(expense.id)}
                      className="p-2 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors duration-200 cursor-pointer nm-flat-sm hover:shadow-none"
                      title="Remove transaction"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
