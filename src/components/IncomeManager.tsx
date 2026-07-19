/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { AppState, IncomeSource, PlannerConfig } from "../types";
import { INCOME_OPTIONS } from "../constants";
import { Plus, Trash2, IndianRupee, DollarSign, Wallet, Percent, Sparkles } from "lucide-react";

interface IncomeManagerProps {
  state: AppState;
  onChange: (updates: Partial<AppState>) => void;
  currency: string;
}

export default function IncomeManager({ state, onChange, currency }: IncomeManagerProps) {
  const { inHandSalary, incomeSources } = state;
  const [newSourceType, setNewSourceType] = useState<IncomeSource["sourceType"]>("Freelance");
  const [newCustomLabel, setNewCustomLabel] = useState("");
  const [newAmount, setNewAmount] = useState<number | "">("");

  // Handle salary change
  const handleSalaryChange = (value: number) => {
    onChange({ inHandSalary: isNaN(value) ? 0 : value });
  };

  // Add additional income source
  const handleAddIncomeSource = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(newAmount);
    if (!amount || amount <= 0) return;

    const newSource: IncomeSource = {
      id: `inc-${Date.now()}`,
      sourceType: newSourceType,
      customLabel: newSourceType === "Others" || newCustomLabel ? newCustomLabel : undefined,
      amount
    };

    onChange({
      incomeSources: [...incomeSources, newSource]
    });

    // Reset fields
    setNewCustomLabel("");
    setNewAmount("");
  };

  // Remove additional income source
  const handleRemoveIncomeSource = (id: string) => {
    onChange({
      incomeSources: incomeSources.filter(src => src.id !== id)
    });
  };

  const totalAdditional = incomeSources.reduce((sum, src) => sum + src.amount, 0);

  return (
    <div className="space-y-6">
      {/* Primary In-Hand Salary Input Section */}
      <div className="nm-flat p-6 rounded-3xl" id="primary-salary-section">
        <h3 className="text-base font-bold font-display text-slate-800 mb-2 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-[var(--accent)]" />
          Primary Income (In-Hand Salary)
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Your core monthly net salary after taxes and deductions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-4 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currency}</span>
            <input 
              type="number"
              id="in-hand-salary-input"
              className="nm-input w-full pl-8 pr-4 py-3 rounded-2xl text-slate-800 font-medium text-lg font-display"
              value={inHandSalary || ""}
              onChange={(e) => handleSalaryChange(Number(e.target.value))}
              placeholder="e.g. 5000"
              min="0"
            />
          </div>

          <div className="md:col-span-8 space-y-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Adjust Salary Quickly</span>
              <span className="font-bold text-[var(--accent)]">{currency}{inHandSalary.toLocaleString()}</span>
            </div>
            <div className="relative">
              <input 
                type="range"
                id="salary-slider"
                min="0"
                max="25000"
                step="250"
                className="w-full h-2 rounded-lg appearance-none cursor-pointer nm-pressed"
                value={inHandSalary}
                onChange={(e) => handleSalaryChange(Number(e.target.value))}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>{currency}0</span>
              <span>{currency}10,000</span>
              <span>{currency}25,000+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Multiple Other Income Sources Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form to add other incomes (5 Cols) */}
        <div className="nm-flat p-6 rounded-3xl lg:col-span-5" id="add-other-income-container">
          <h3 className="text-base font-bold font-display text-slate-800 mb-1 flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-500" />
            Add Other Incomes
          </h3>
          <p className="text-xs text-slate-500 mb-5">
            Log dynamic, side-hustle, business, or investment incomes.
          </p>

          <form onSubmit={handleAddIncomeSource} className="space-y-4">
            {/* Source Type Dropdown */}
            <div className="space-y-1.5">
              <label htmlFor="source-type-select" className="text-xs font-semibold text-slate-500">Income Type</label>
              <select
                id="source-type-select"
                className="nm-input w-full px-4 py-2.5 rounded-2xl text-slate-700 text-sm font-medium bg-[#fcfdfe] cursor-pointer"
                value={newSourceType}
                onChange={(e) => setNewSourceType(e.target.value as IncomeSource["sourceType"])}
              >
                {INCOME_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Custom Label (Optional or Required for Others) */}
            <div className="space-y-1.5">
              <label htmlFor="custom-label-input" className="text-xs font-semibold text-slate-500">
                Custom Label {newSourceType === "Others" ? "(Required)" : "(Optional)"}
              </label>
              <input
                type="text"
                id="custom-label-input"
                className="nm-input w-full px-4 py-2.5 rounded-2xl text-slate-700 text-sm"
                placeholder={newSourceType === "Others" ? "e.g. Royalties, Tutoring" : "e.g. Side Hustle, Consulting"}
                value={newCustomLabel}
                onChange={(e) => setNewCustomLabel(e.target.value)}
                required={newSourceType === "Others"}
              />
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <label htmlFor="income-amount-input" className="text-xs font-semibold text-slate-500">Monthly Amount ({currency})</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currency}</span>
                <input
                  type="number"
                  id="income-amount-input"
                  className="nm-input w-full pl-8 pr-4 py-2.5 rounded-2xl text-slate-700 text-sm"
                  placeholder="e.g. 1200"
                  min="1"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="nm-btn-primary w-full py-2.5 rounded-2xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 mt-4 cursor-pointer"
              id="add-income-btn"
            >
              <Plus className="w-4 h-4" /> Add Income Stream
            </button>
          </form>
        </div>

        {/* List of active income sources (7 Cols) */}
        <div className="nm-flat p-6 rounded-3xl lg:col-span-7 flex flex-col" id="active-incomes-container">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-base font-bold font-display text-slate-800">Additional Streams</h3>
            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-200/50 px-2.5 py-0.5 rounded-full">
              Total: {currency}{totalAdditional.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-5">
            Currently active supplementary monthly cash-flows.
          </p>

          <div className="flex-1 overflow-y-auto max-h-[290px] space-y-4 pr-1">
            {incomeSources.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 nm-pressed rounded-3xl bg-[#e0e5ec]/50">
                <Sparkles className="w-8 h-8 text-indigo-400 mb-2" />
                <p className="text-xs font-medium text-slate-500">No additional income sources active.</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Use the add panel on the left to include freelance, business, or side earnings.</p>
              </div>
            ) : (
              incomeSources.map((source) => (
                <div 
                  key={source.id} 
                  className="nm-flat-sm p-4 rounded-3xl flex items-center justify-between border border-white/50 transition-all duration-300 hover:scale-[1.01]"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded ${
                        source.sourceType === "Business" ? "bg-cyan-50 text-cyan-600 border border-cyan-100" :
                        source.sourceType === "Freelance" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                        source.sourceType === "EV Business" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {source.sourceType}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-800">
                      {source.customLabel || `${source.sourceType} Income`}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold font-display text-emerald-600">
                      +{currency}{source.amount.toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleRemoveIncomeSource(source.id)}
                      className="p-2 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors duration-200 cursor-pointer nm-flat-sm hover:shadow-none"
                      title="Remove income stream"
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
