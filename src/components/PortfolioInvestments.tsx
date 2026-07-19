/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { AppState, AssetInvestment, AssetType } from "../types";
import { Plus, Trash2, Calendar, FileText, Info, Percent, Sparkles, Landmark, Coins, TrendingUp } from "lucide-react";

interface PortfolioInvestmentsProps {
  state: AppState;
  onChange: (updates: Partial<AppState>) => void;
  currency: string;
}

export default function PortfolioInvestments({ state, onChange, currency }: PortfolioInvestmentsProps) {
  const { investments, config } = state;

  // New Investment state
  const [newType, setNewType] = useState<AssetType>(AssetType.Stocks);
  const [newName, setNewName] = useState("");
  const [newPrincipal, setNewPrincipal] = useState<number | "">("");
  const [newMonthlyContribution, setNewMonthlyContribution] = useState<number | "">("");
  const [newROI, setNewROI] = useState<number | "">("");
  const [newDate, setNewDate] = useState("2024-01-01");

  // Optional overrides
  const [customRentalYield, setCustomRentalYield] = useState<number | "">("");
  const [customAppreciation, setCustomAppreciation] = useState<number | "">("");
  const [customTaxRate, setCustomTaxRate] = useState<number | "">("");
  const [customMaturity, setCustomMaturity] = useState<number | "">("");
  const [customExitBrokerage, setCustomExitBrokerage] = useState<number | "">("");

  // Helper: calculate investment duration in years from purchaseDate to current date
  const calculateDurationInYears = (purchaseDateStr: string): number => {
    const purchase = new Date(purchaseDateStr);
    const current = new Date(); // Using current 2026-07-18 from metadata
    
    // Fallback if date parsing fails
    if (isNaN(purchase.getTime())) return 1;

    const diffTime = Math.max(0, current.getTime() - purchase.getTime());
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return Number((diffDays / 365.25).toFixed(2));
  };

  // Helper: Calculate current value & statistics of an investment
  const getInvestmentMetrics = (inv: AssetInvestment) => {
    const T = calculateDurationInYears(inv.purchaseDate);
    const R = inv.annualReturnRate / 100;
    
    let totalInvested = inv.principal;
    let currentValue = inv.principal;
    let rentAccumulated = 0;

    // Standard Asset Type calculations
    if (inv.type === AssetType.SIPs || inv.type === AssetType.RD) {
      // Compounded principal + monthly contributions
      const monthlyAmount = inv.monthlyContribution || 0;
      const months = Math.floor(T * 12);
      totalInvested = inv.principal + (monthlyAmount * months);
      
      const compoundPrincipal = inv.principal * Math.pow(1 + R, T);
      
      let compoundSIP = 0;
      if (months > 0 && R > 0) {
        const r_m = R / 12;
        compoundSIP = monthlyAmount * ((Math.pow(1 + r_m, months) - 1) / r_m) * (1 + r_m);
      } else {
        compoundSIP = monthlyAmount * months;
      }
      currentValue = compoundPrincipal + compoundSIP;
    } else if (inv.type === AssetType.Flat || inv.type === AssetType.Land) {
      // Real estate appreciation + rental yields
      const appRate = inv.appreciationRate !== undefined ? inv.appreciationRate / 100 : config.generalAppreciationRate / 100;
      const rentYield = inv.type === AssetType.Flat ? (inv.rentalYield !== undefined ? inv.rentalYield / 100 : config.generalRentalYield / 100) : 0;
      
      currentValue = inv.principal * Math.pow(1 + appRate, T);
      rentAccumulated = inv.principal * rentYield * T;
      
      // Net worth from real estate includes current appreciated property value + accumulated rent cashflow
      currentValue = currentValue + rentAccumulated;
    } else {
      // Standard lump sum compound asset (Stocks, Bonds, FD, Others)
      currentValue = inv.principal * Math.pow(1 + R, T);
    }

    const netGain = currentValue - totalInvested;
    const roiPercentage = totalInvested > 0 ? (netGain / totalInvested) * 100 : 0;

    // Apply specific tax rate or default tax bracket on return gains
    const taxRate = inv.taxRate !== undefined ? inv.taxRate : config.defaultTaxBracket;
    const taxAmount = netGain > 0 ? netGain * (taxRate / 100) : 0;

    // Apply exit brokerage fee (calculated on current asset value)
    const exitBrokerageRate = inv.exitBrokerage !== undefined ? inv.exitBrokerage : config.defaultExitBrokerage;
    const brokerageAmount = currentValue * (exitBrokerageRate / 100);
    const postTaxValue = currentValue - taxAmount - brokerageAmount;

    return {
      durationYears: T,
      totalInvested,
      currentValue,
      netGain,
      roiPercentage,
      taxAmount,
      brokerageAmount,
      exitBrokerageRate,
      postTaxValue,
      rentAccumulated
    };
  };

  // Add Investment Handler
  const handleAddInvestment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrincipal || newPrincipal <= 0) return;

    const roiVal = newROI === "" ? 8 : Number(newROI);

    const newInv: AssetInvestment = {
      id: `inv-${Date.now()}`,
      type: newType,
      name: newName,
      principal: Number(newPrincipal),
      monthlyContribution: newType === AssetType.SIPs || newType === AssetType.RD ? Number(newMonthlyContribution || 0) : 0,
      annualReturnRate: roiVal,
      purchaseDate: newDate,
      rentalYield: newType === AssetType.Flat && customRentalYield !== "" ? Number(customRentalYield) : undefined,
      appreciationRate: (newType === AssetType.Flat || newType === AssetType.Land) && customAppreciation !== "" ? Number(customAppreciation) : undefined,
      taxRate: customTaxRate !== "" ? Number(customTaxRate) : undefined,
      maturityYears: (newType === AssetType.FD || newType === AssetType.RD) && customMaturity !== "" ? Number(customMaturity) : undefined,
      exitBrokerage: customExitBrokerage !== "" ? Number(customExitBrokerage) : undefined
    };

    onChange({
      investments: [...investments, newInv]
    });

    // Reset fields
    setNewName("");
    setNewPrincipal("");
    setNewMonthlyContribution("");
    setNewROI("");
    setCustomRentalYield("");
    setCustomAppreciation("");
    setCustomTaxRate("");
    setCustomMaturity("");
    setCustomExitBrokerage("");
  };

  // Remove Investment Handler
  const handleRemoveInvestment = (id: string) => {
    onChange({
      investments: investments.filter(inv => inv.id !== id)
    });
  };

  return (
    <div className="space-y-6">
      {/* Add New Portfolio Asset & Dynamic Description Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form panel to add investment (5 Cols) */}
        <div className="nm-flat p-6 rounded-3xl lg:col-span-5" id="add-investment-container">
          <h3 className="text-base font-bold font-display text-slate-800 mb-1 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-purple-600" />
            Add Investment Asset
          </h3>
          <p className="text-xs text-slate-500 mb-5">
            Configure stocks, mutual funds, real estate holdings, or sovereign bonds.
          </p>

          <form onSubmit={handleAddInvestment} className="space-y-4">
            {/* Asset Class */}
            <div className="space-y-1.5">
              <label htmlFor="asset-type-select" className="text-xs font-semibold text-slate-500">Asset Class</label>
              <select
                id="asset-type-select"
                className="nm-input w-full px-4 py-2.5 rounded-2xl text-slate-700 text-sm font-medium bg-[#fcfdfe] cursor-pointer"
                value={newType}
                onChange={(e) => {
                  setNewType(e.target.value as AssetType);
                  // Autofill sensible default ROIs for classes
                  const type = e.target.value as AssetType;
                  if (type === AssetType.Stocks) setNewROI(12);
                  else if (type === AssetType.SIPs) setNewROI(13);
                  else if (type === AssetType.Bonds) setNewROI(6);
                  else if (type === AssetType.Flat || type === AssetType.Land) setNewROI(5);
                  else if (type === AssetType.FD) setNewROI(7);
                  else if (type === AssetType.RD) setNewROI(6.5);
                }}
              >
                {Object.values(AssetType).map((val) => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>
            </div>

            {/* Asset Name */}
            <div className="space-y-1.5">
              <label htmlFor="asset-name-input" className="text-xs font-semibold text-slate-500">Asset Name</label>
              <input
                type="text"
                id="asset-name-input"
                className="nm-input w-full px-4 py-2.5 rounded-2xl text-slate-700 text-sm"
                placeholder="e.g. S&P 500 ETF, 3BHK Condo"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Purchase Principal */}
              <div className="space-y-1.5">
                <label htmlFor="asset-principal-input" className="text-xs font-semibold text-slate-500">Principal ({currency})</label>
                <input
                  type="number"
                  id="asset-principal-input"
                  className="nm-input w-full px-4 py-2.5 rounded-2xl text-slate-700 text-sm"
                  placeholder="Purchase price"
                  min="1"
                  value={newPrincipal}
                  onChange={(e) => setNewPrincipal(e.target.value === "" ? "" : Number(e.target.value))}
                  required
                />
              </div>

              {/* Annual Expected ROI % */}
              <div className="space-y-1.5">
                <label htmlFor="asset-roi-input" className="text-xs font-semibold text-slate-500">Expected ROI (%)</label>
                <input
                  type="number"
                  id="asset-roi-input"
                  className="nm-input w-full px-4 py-2.5 rounded-2xl text-slate-700 text-sm"
                  placeholder="Annual rate"
                  min="0.1"
                  step="0.1"
                  value={newROI}
                  onChange={(e) => setNewROI(e.target.value === "" ? "" : Number(e.target.value))}
                  required
                />
              </div>
            </div>

            {/* Monthly SIP/RD Contribution (Only for SIPs and RD) */}
            {(newType === AssetType.SIPs || newType === AssetType.RD) && (
              <div className="space-y-1.5 animate-fade-in">
                <label htmlFor="asset-monthly-sip-input" className="text-xs font-semibold text-slate-500">Monthly Contribution ({currency})</label>
                <input
                  type="number"
                  id="asset-monthly-sip-input"
                  className="nm-input w-full px-4 py-2.5 rounded-2xl text-slate-700 text-sm"
                  placeholder="SIP investment amount"
                  min="0"
                  value={newMonthlyContribution}
                  onChange={(e) => setNewMonthlyContribution(e.target.value === "" ? "" : Number(e.target.value))}
                  required
                />
              </div>
            )}

            {/* Purchase Date */}
            <div className="space-y-1.5">
              <label htmlFor="asset-purchase-date-input" className="text-xs font-semibold text-slate-500">Purchase Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="date"
                  id="asset-purchase-date-input"
                  className="nm-input w-full pl-11 pr-4 py-2.5 rounded-2xl text-slate-700 text-sm"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Asset-Specific Advanced Overrides Collapsible */}
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3.5">
              <div className="text-xs font-bold text-slate-600 uppercase tracking-wider font-display flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-indigo-500" />
                Asset-Specific Overrides
              </div>

              {/* Flat/Real Estate: Rental Yield and Appreciation Rates */}
              {newType === AssetType.Flat && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="custom-rental-yield" className="text-[10px] font-bold text-slate-400">Rental Yield (%)</label>
                    <input
                      type="number"
                      id="custom-rental-yield"
                      className="nm-input w-full px-3 py-1.5 rounded-xl text-xs font-mono"
                      placeholder={`Global: ${config.generalRentalYield}%`}
                      value={customRentalYield}
                      onChange={(e) => setCustomRentalYield(e.target.value === "" ? "" : Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="custom-flat-appreciation" className="text-[10px] font-bold text-slate-400">Appreciation (%)</label>
                    <input
                      type="number"
                      id="custom-flat-appreciation"
                      className="nm-input w-full px-3 py-1.5 rounded-xl text-xs font-mono"
                      placeholder={`Global: ${config.generalAppreciationRate}%`}
                      value={customAppreciation}
                      onChange={(e) => setCustomAppreciation(e.target.value === "" ? "" : Number(e.target.value))}
                    />
                  </div>
                </div>
              )}

              {newType === AssetType.Land && (
                <div className="space-y-1">
                  <label htmlFor="custom-land-appreciation" className="text-[10px] font-bold text-slate-400">Land Appreciation (%)</label>
                  <input
                    type="number"
                    id="custom-land-appreciation"
                    className="nm-input w-full px-3 py-1.5 rounded-xl text-xs font-mono"
                    placeholder={`Global: ${config.generalAppreciationRate}%`}
                    value={customAppreciation}
                    onChange={(e) => setCustomAppreciation(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </div>
              )}

              {/* FD/RD Maturity Years */}
              {(newType === AssetType.FD || newType === AssetType.RD) && (
                <div className="space-y-1">
                  <label htmlFor="custom-maturity" className="text-[10px] font-bold text-slate-400">Maturity Duration (Years)</label>
                  <input
                    type="number"
                    id="custom-maturity"
                    className="nm-input w-full px-3 py-1.5 rounded-xl text-xs font-mono"
                    placeholder="e.g. 5"
                    value={customMaturity}
                    onChange={(e) => setCustomMaturity(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </div>
              )}

              {/* Specific Capital Gains Tax & Exit Brokerage Override */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="custom-tax-rate" className="text-[10px] font-bold text-slate-400">Gains Tax Override (%)</label>
                  <input
                    type="number"
                    id="custom-tax-rate"
                    className="nm-input w-full px-3 py-1.5 rounded-xl text-xs font-mono"
                    placeholder={`Global: ${config.defaultTaxBracket}%`}
                    value={customTaxRate}
                    onChange={(e) => setCustomTaxRate(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="custom-exit-brokerage" className="text-[10px] font-bold text-slate-400">Exit Brokerage Override (%)</label>
                  <input
                    type="number"
                    id="custom-exit-brokerage"
                    step="0.1"
                    className="nm-input w-full px-3 py-1.5 rounded-xl text-xs font-mono"
                    placeholder={`Global: ${config.defaultExitBrokerage}%`}
                    value={customExitBrokerage}
                    onChange={(e) => setCustomExitBrokerage(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="nm-btn-primary w-full py-2.5 rounded-2xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 mt-4 cursor-pointer"
              id="add-asset-btn"
            >
              <Plus className="w-4 h-4" /> Add Asset Portfolio
            </button>
          </form>
        </div>

        {/* List and Track Return metrics (7 Cols) */}
        <div className="nm-flat p-6 rounded-3xl lg:col-span-7 flex flex-col" id="tracked-investments-container">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-base font-bold font-display text-slate-800 flex items-center gap-2">
              <Coins className="w-5 h-5 text-indigo-500" />
              Portfolio ROI Performance
            </h3>
            <span className="text-xs font-mono font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full">
              Count: {investments.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-5">
            Compound interest calculations, real estate rentals, and specific tax rate applications.
          </p>

          <div className="flex-1 overflow-y-auto max-h-[500px] space-y-4 pr-1">
            {investments.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 nm-pressed rounded-3xl bg-[#e0e5ec]/50">
                <Sparkles className="w-8 h-8 text-purple-400 mb-2 animate-pulse" />
                <p className="text-xs font-medium text-slate-500">Your investment portfolio is currently empty.</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Use the configuration form on the left to track stocks, real estate, land, FD or RD returns.</p>
              </div>
            ) : (
              investments.map((inv) => {
                const metrics = getInvestmentMetrics(inv);
                const isGain = metrics.netGain >= 0;

                return (
                  <div 
                    key={inv.id} 
                    className="p-5 rounded-3xl nm-flat-sm border border-white/50 space-y-3 transition-all duration-300 hover:scale-[1.01]"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded ${
                            inv.type === AssetType.Stocks ? "bg-indigo-50 text-indigo-600" :
                            inv.type === AssetType.Bonds ? "bg-blue-50 text-blue-600" :
                            inv.type === AssetType.SIPs ? "bg-purple-50 text-purple-600" :
                            inv.type === AssetType.Flat ? "bg-amber-50 text-amber-600" :
                            inv.type === AssetType.Land ? "bg-emerald-50 text-emerald-600" :
                            "bg-slate-100 text-slate-600"
                          }`}>
                            {inv.type}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">Bought: {inv.purchaseDate}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 font-display">{inv.name}</h4>
                      </div>

                      <button
                        onClick={() => handleRemoveInvestment(inv.id)}
                        className="p-2 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors duration-200 cursor-pointer nm-flat-sm hover:shadow-none"
                        title="Remove investment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Financial Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase font-medium">Invested Capital</span>
                        <span className="text-xs font-bold text-slate-700">{currency}{Math.round(metrics.totalInvested).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase font-medium">Estimated Value</span>
                        <span className="text-xs font-bold text-slate-800 font-display">{currency}{Math.round(metrics.currentValue).toLocaleString()}</span>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <span className="block text-[10px] text-slate-400 uppercase font-medium">Individual ROI</span>
                        <span className={`text-xs font-bold flex items-center gap-1 ${isGain ? "text-emerald-600" : "text-rose-500"}`}>
                          <TrendingUp className="w-3.5 h-3.5" />
                          {metrics.roiPercentage.toFixed(1)}% (+{currency}{Math.round(metrics.netGain).toLocaleString()})
                        </span>
                      </div>
                    </div>

                    {/* Meta specifics description line */}
                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[10px] text-slate-400 font-mono pt-1">
                      <span>Annual growth rate: <strong className="text-slate-600">{inv.annualReturnRate}%</strong></span>
                      {inv.type === AssetType.Flat && (
                        <span>Rental Yield: <strong className="text-slate-600">{inv.rentalYield ?? config.generalRentalYield}%</strong></span>
                      )}
                      {(inv.type === AssetType.SIPs || inv.type === AssetType.RD) && (
                        <span>SIP Contribution: <strong className="text-slate-600">{currency}{inv.monthlyContribution}/mo</strong></span>
                      )}
                      <span>Tax Bracket applied: <strong className="text-slate-600">{inv.taxRate ?? config.defaultTaxBracket}%</strong></span>
                      <span>Exit Brokerage: <strong className="text-slate-600">{metrics.exitBrokerageRate}% ({currency}{Math.round(metrics.brokerageAmount).toLocaleString()})</strong></span>
                      <span>Duration: <strong className="text-slate-600">{metrics.durationYears} years</strong></span>
                    </div>

                    {/* Additional Net Liquidation Line */}
                    <div className="pt-2.5 border-t border-dashed border-slate-200/80 flex justify-between text-[11px] text-slate-500 font-medium">
                      <span>Net Value (Post Tax & Exit Brokerage):</span>
                      <strong className="text-indigo-600 font-mono">{currency}{Math.round(metrics.postTaxValue).toLocaleString()}</strong>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
