/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AppState, PlannerConfig } from "../types";
import { Percent, Sliders, Shield, RefreshCw } from "lucide-react";
import { DEFAULT_CONFIG } from "../constants";

interface ConfigurationPanelProps {
  state: AppState;
  onChange: (updates: Partial<AppState>) => void;
  currency: string;
  onChangeCurrency: (currency: string) => void;
}

export default function ConfigurationPanel({ state, onChange, currency, onChangeCurrency }: ConfigurationPanelProps) {
  const { config } = state;

  const handleConfigChange = (key: keyof PlannerConfig, value: number) => {
    onChange({
      config: {
        ...config,
        [key]: isNaN(value) ? 0 : value
      }
    });
  };

  const handleReset = () => {
    onChange({ config: DEFAULT_CONFIG });
  };

  return (
    <div className="nm-flat p-6 rounded-3xl" id="global-config-container">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-base font-bold font-display text-slate-800 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[var(--accent)]" />
            Global Financial Assumptions
          </h3>
          <p className="text-xs text-slate-500">
            Fine-tune macroeconomic parameters. These govern default ROI projections, real-estate appreciation, and tax calculations.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="nm-btn px-3 py-1.5 rounded-2xl text-xs font-bold text-slate-600 flex items-center gap-1.5 cursor-pointer"
          title="Reset to default macroeconomic assumptions"
          id="reset-config-btn"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Defaults
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mt-6">
        {/* Currency Selector */}
        <div className="p-4 rounded-3xl nm-flat-sm space-y-1.5 border border-white/40">
          <label htmlFor="currency-select" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-display">
            Preferred Currency
          </label>
          <div className="relative">
            <select
              id="currency-select"
              className="nm-input w-full px-3 py-2 rounded-2xl text-xs font-bold text-slate-700 bg-white cursor-pointer"
              value={currency}
              onChange={(e) => onChangeCurrency(e.target.value)}
            >
              <option value="$">US Dollar ($)</option>
              <option value="₹">Indian Rupee (₹)</option>
              <option value="€">Euro (€)</option>
              <option value="£">British Pound (£)</option>
              <option value="¥">Yen (¥)</option>
            </select>
          </div>
        </div>

        {/* Inflation Rate */}
        <div className="p-4 rounded-3xl nm-flat-sm space-y-1.5 border border-white/40">
          <label htmlFor="inflation-rate-input" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-display flex justify-between">
            <span>Inflation Rate</span>
            <span className="text-[var(--accent)] font-mono">{config.inflationRate}%</span>
          </label>
          <div className="relative">
            <input
              type="number"
              id="inflation-rate-input"
              step="0.1"
              min="0"
              max="25"
              className="nm-input w-full px-3 py-2 rounded-2xl text-xs font-semibold text-slate-700"
              value={config.inflationRate}
              onChange={(e) => handleConfigChange("inflationRate", Number(e.target.value))}
            />
          </div>
          <input
            type="range"
            aria-label="Inflation rate slider"
            min="0"
            max="15"
            step="0.1"
            className="w-full h-1 mt-1 cursor-pointer"
            value={config.inflationRate}
            onChange={(e) => handleConfigChange("inflationRate", Number(e.target.value))}
          />
        </div>

        {/* Default Tax Bracket */}
        <div className="p-4 rounded-3xl nm-flat-sm space-y-1.5 border border-white/40">
          <label htmlFor="tax-bracket-input" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-display flex justify-between">
            <span>Gains Tax Rate</span>
            <span className="text-[var(--accent)] font-mono">{config.defaultTaxBracket}%</span>
          </label>
          <div className="relative">
            <input
              type="number"
              id="tax-bracket-input"
              step="1"
              min="0"
              max="60"
              className="nm-input w-full px-3 py-2 rounded-2xl text-xs font-semibold text-slate-700"
              value={config.defaultTaxBracket}
              onChange={(e) => handleConfigChange("defaultTaxBracket", Number(e.target.value))}
            />
          </div>
          <input
            type="range"
            aria-label="Tax rate slider"
            min="0"
            max="50"
            step="1"
            className="w-full h-1 mt-1 cursor-pointer"
            value={config.defaultTaxBracket}
            onChange={(e) => handleConfigChange("defaultTaxBracket", Number(e.target.value))}
          />
        </div>

        {/* Real Estate General Appreciation */}
        <div className="p-4 rounded-3xl nm-flat-sm space-y-1.5 border border-white/40">
          <label htmlFor="general-appreciation-input" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-display flex justify-between">
            <span>Property Appreciation</span>
            <span className="text-[var(--accent)] font-mono">{config.generalAppreciationRate}%</span>
          </label>
          <div className="relative">
            <input
              type="number"
              id="general-appreciation-input"
              step="0.5"
              min="0"
              max="30"
              className="nm-input w-full px-3 py-2 rounded-2xl text-xs font-semibold text-slate-700"
              value={config.generalAppreciationRate}
              onChange={(e) => handleConfigChange("generalAppreciationRate", Number(e.target.value))}
            />
          </div>
          <input
            type="range"
            aria-label="Property appreciation slider"
            min="0"
            max="20"
            step="0.5"
            className="w-full h-1 mt-1 cursor-pointer"
            value={config.generalAppreciationRate}
            onChange={(e) => handleConfigChange("generalAppreciationRate", Number(e.target.value))}
          />
        </div>

        {/* General Rental Yield */}
        <div className="p-4 rounded-3xl nm-flat-sm space-y-1.5 border border-white/40">
          <label htmlFor="general-yield-input" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-display flex justify-between">
            <span>General Rental Yield</span>
            <span className="text-[var(--accent)] font-mono">{config.generalRentalYield}%</span>
          </label>
          <div className="relative">
            <input
              type="number"
              id="general-yield-input"
              step="0.1"
              min="0"
              max="20"
              className="nm-input w-full px-3 py-2 rounded-2xl text-xs font-semibold text-slate-700"
              value={config.generalRentalYield}
              onChange={(e) => handleConfigChange("generalRentalYield", Number(e.target.value))}
            />
          </div>
          <input
            type="range"
            aria-label="Rental yield slider"
            min="0"
            max="12"
            step="0.1"
            className="w-full h-1 mt-1 cursor-pointer"
            value={config.generalRentalYield}
            onChange={(e) => handleConfigChange("generalRentalYield", Number(e.target.value))}
          />
        </div>

        {/* Exit Brokerage Fee */}
        <div className="p-4 rounded-3xl nm-flat-sm space-y-1.5 border border-white/40">
          <label htmlFor="general-brokerage-input" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-display flex justify-between">
            <span>Exit Brokerage</span>
            <span className="text-[var(--accent)] font-mono">{config.defaultExitBrokerage}%</span>
          </label>
          <div className="relative">
            <input
              type="number"
              id="general-brokerage-input"
              step="0.1"
              min="0"
              max="10"
              className="nm-input w-full px-3 py-2 rounded-2xl text-xs font-semibold text-slate-700"
              value={config.defaultExitBrokerage || 0}
              onChange={(e) => handleConfigChange("defaultExitBrokerage", Number(e.target.value))}
            />
          </div>
          <input
            type="range"
            aria-label="Exit brokerage slider"
            min="0"
            max="10"
            step="0.1"
            className="w-full h-1 mt-1 cursor-pointer"
            value={config.defaultExitBrokerage || 0}
            onChange={(e) => handleConfigChange("defaultExitBrokerage", Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}
