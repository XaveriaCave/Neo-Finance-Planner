/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { AppState, AssetInvestment, AssetType } from "../types";
import { Sliders, Calendar, TrendingUp, Info, HelpCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ProjectionSliderProps {
  state: AppState;
  currency: string;
}

export default function ProjectionSlider({ state, currency }: ProjectionSliderProps) {
  const { investments, config, inHandSalary, incomeSources, expenses } = state;
  const [horizonYears, setHorizonYears] = useState<number>(20);
  const [chartMode, setChartMode] = useState<"growth" | "assets">("growth");

  // Calculate monthly surplus that can be invested/saved in addition to current assets
  const additionalIncome = incomeSources.reduce((sum, inc) => sum + inc.amount, 0);
  const totalIncome = inHandSalary + additionalIncome;
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const monthlySurplus = Math.max(0, totalIncome - totalExpenses);

  // Compute projections for a given year index
  const calculateProjectionForYear = (targetYear: number) => {
    let totalInvested = 0;
    let nominalWorth = 0;
    let taxLiability = 0;

    // Asset Breakdown categories
    const assetBreakdown: Record<string, number> = {
      Stocks: 0,
      Bonds: 0,
      SIPs: 0,
      Flat: 0,
      Land: 0,
      FD: 0,
      RD: 0,
      Others: 0
    };

    // Calculate growth for all designated investments
    investments.forEach((inv) => {
      const R = inv.annualReturnRate / 100;
      let assetInvested = inv.principal;
      let assetNominal = inv.principal;

      if (inv.type === AssetType.SIPs || inv.type === AssetType.RD) {
        // Compound principal + monthly contributions over targetYear
        const monthlyAmount = inv.monthlyContribution || 0;
        const months = targetYear * 12;
        assetInvested = inv.principal + (monthlyAmount * months);
        
        const compoundPrincipal = inv.principal * Math.pow(1 + R, targetYear);
        
        let compoundSIP = 0;
        if (months > 0 && R > 0) {
          const r_m = R / 12;
          compoundSIP = monthlyAmount * ((Math.pow(1 + r_m, months) - 1) / r_m) * (1 + r_m);
        } else {
          compoundSIP = monthlyAmount * months;
        }
        assetNominal = compoundPrincipal + compoundSIP;
      } else if (inv.type === AssetType.Flat || inv.type === AssetType.Land) {
        // Appreciation override or default global
        const appRate = inv.appreciationRate !== undefined ? inv.appreciationRate / 100 : config.generalAppreciationRate / 100;
        const rentYield = inv.type === AssetType.Flat ? (inv.rentalYield !== undefined ? inv.rentalYield / 100 : config.generalRentalYield / 100) : 0;
        
        const propertyValue = inv.principal * Math.pow(1 + appRate, targetYear);
        const accumulatedRent = inv.principal * rentYield * targetYear;
        
        assetInvested = inv.principal;
        assetNominal = propertyValue + accumulatedRent;
      } else {
        // Standard single principal asset (Stocks, Bonds, FD, etc.) compounded
        assetInvested = inv.principal;
        assetNominal = inv.principal * Math.pow(1 + R, targetYear);
      }

      const assetNetGains = assetNominal - assetInvested;
      const assetTaxRate = inv.taxRate !== undefined ? inv.taxRate : config.defaultTaxBracket;
      const assetTax = assetNetGains > 0 ? assetNetGains * (assetTaxRate / 100) : 0;

      totalInvested += assetInvested;
      nominalWorth += assetNominal;
      taxLiability += assetTax;

      // Group breakdown (post-tax value inside group or pre-tax? Let's use pre-tax nominal)
      const mappedCategory = inv.type === AssetType.SIPs ? "SIPs" :
                             inv.type === AssetType.Flat ? "Flat" :
                             inv.type === AssetType.Land ? "Land" :
                             inv.type === AssetType.FD ? "FD" :
                             inv.type === AssetType.RD ? "RD" :
                             inv.type === AssetType.Stocks ? "Stocks" :
                             inv.type === AssetType.Bonds ? "Bonds" : "Others";
      
      assetBreakdown[mappedCategory] += assetNominal;
    });

    // Plus let's assume the remaining monthly surplus (not directed to specific assets) is saved in cash/savings
    // Cash compounds slightly at say 3% or remains flat. Let's assume it compounds at 3% or is added linearly
    const savedCash = monthlySurplus * 12 * targetYear;
    nominalWorth += savedCash;
    totalInvested += savedCash;
    assetBreakdown["Others"] += savedCash;

    // Adjust for inflation (purchasing power value)
    const infRate = config.inflationRate / 100;
    const realWorth = nominalWorth / Math.pow(1 + infRate, targetYear);

    return {
      year: targetYear,
      invested: Math.round(totalInvested),
      nominal: Math.round(nominalWorth),
      real: Math.round(realWorth),
      tax: Math.round(taxLiability),
      breakdown: {
        Stocks: Math.round(assetBreakdown["Stocks"]),
        Bonds: Math.round(assetBreakdown["Bonds"]),
        SIPs: Math.round(assetBreakdown["SIPs"]),
        Flat: Math.round(assetBreakdown["Flat"]),
        Land: Math.round(assetBreakdown["Land"]),
        FD: Math.round(assetBreakdown["FD"]),
        RD: Math.round(assetBreakdown["RD"]),
        Others: Math.round(assetBreakdown["Others"])
      }
    };
  };

  // Generate Year-by-Year data for charts
  const projectionData = [];
  for (let i = 0; i <= horizonYears; i++) {
    const dataPoint = calculateProjectionForYear(i);
    projectionData.push({
      yearLabel: `Yr ${i}`,
      ...dataPoint,
      // Destructure asset breakdown for stacked chart
      ...dataPoint.breakdown
    });
  }

  const finalYearPoint = projectionData[projectionData.length - 1] || { invested: 0, nominal: 0, real: 0, tax: 0 };
  const totalGains = Math.max(0, finalYearPoint.nominal - finalYearPoint.invested);

  return (
    <div className="space-y-6">
      {/* Projection Horizon Year Slider */}
      <div className="nm-flat p-6 rounded-3xl" id="horizon-slider-section">
        <h3 className="text-base font-bold font-display text-slate-800 mb-2 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[var(--accent)]" />
          Wealth Projection Horizon
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Set your planning timeline using the interactive slider. Projections compound assets individually using your macro configs.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-3 text-center md:text-left">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-display">Time Horizon</span>
            <span className="text-3xl font-extrabold font-display text-[var(--accent)] font-mono" id="horizon-years-display">{horizonYears} Years</span>
          </div>

          <div className="md:col-span-9 space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-600">
              <span>Time Horizon Range</span>
              <span>40 Years Max</span>
            </div>
            <div className="relative">
              <input 
                type="range"
                id="horizon-years-slider"
                min="1"
                max="40"
                step="1"
                className="w-full h-2 rounded-lg appearance-none cursor-pointer nm-pressed"
                value={horizonYears}
                onChange={(e) => setHorizonYears(Number(e.target.value))}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>1 Yr</span>
              <span>10 Yrs</span>
              <span>20 Yrs</span>
              <span>30 Yrs</span>
              <span>40 Yrs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Projection Output Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="nm-flat p-5 rounded-3xl border border-white/50">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-display">Cumulative Invested</span>
          <div className="text-xl font-bold font-display text-slate-800 mt-1">
            {currency}{finalYearPoint.invested.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Principal + residual monthly surplus of {currency}{monthlySurplus.toLocaleString()}/mo
          </p>
        </div>

        <div className="nm-flat p-5 rounded-3xl border border-white/50">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-display text-[var(--accent)]">Future Nominal Wealth</span>
          <div className="text-xl font-bold font-display text-[var(--accent)] mt-1">
            {currency}{finalYearPoint.nominal.toLocaleString()}
          </div>
          <p className="text-[10px] text-emerald-600 mt-1 font-mono flex items-center gap-0.5">
            <TrendingUp className="w-3.5 h-3.5" />
            +{(totalGains > 0 ? (totalGains / finalYearPoint.invested) * 100 : 0).toFixed(0)}% cumulative ROI
          </p>
        </div>

        <div className="nm-flat p-5 rounded-3xl border border-white/50">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-display">Inflation-Adjusted Worth</span>
          <div className="text-xl font-bold font-display text-slate-700 mt-1">
            {currency}{finalYearPoint.real.toLocaleString()}
          </div>
          <p className="text-[10px] text-amber-500 mt-1">
            Real purchasing power at {config.inflationRate}% annual inflation
          </p>
        </div>

        <div className="nm-flat p-5 rounded-3xl border border-white/50">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-display">Est. Capital Gains Tax</span>
          <div className="text-xl font-bold font-display text-[var(--danger)] mt-1">
            {currency}{finalYearPoint.tax.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Based on set asset-level tax brackets
          </p>
        </div>
      </div>

      {/* Projection Interactive Chart Card */}
      <div className="nm-flat p-6 rounded-3xl" id="projection-chart-card">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h3 className="text-base font-bold font-display text-slate-800">Net Worth Growth Trajectory</h3>
            <p className="text-xs text-slate-500">
              Interactive visualization of your financial projections over the {horizonYears}-year horizon.
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="nm-pressed p-1 rounded-2xl flex items-center gap-1">
            <button
              onClick={() => setChartMode("growth")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                chartMode === "growth" 
                  ? "bg-white text-[var(--accent)] shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
              id="chart-mode-growth"
            >
              Growth Overview
            </button>
            <button
              onClick={() => setChartMode("assets")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                chartMode === "assets" 
                  ? "bg-white text-[var(--accent)] shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
              id="chart-mode-assets"
            >
              Asset Breakdown
            </button>
          </div>
        </div>

        <div className="h-96 w-full pr-4">
          {chartMode === "growth" ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData}>
                <defs>
                  <linearGradient id="colorNominal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4c6ef5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4c6ef5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="yearLabel" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  tickFormatter={(val) => `${currency}${(val/1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number) => [`${currency}${value.toLocaleString()}`]}
                  contentStyle={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                    fontSize: "12px"
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                <Area 
                  name="Future Value (Nominal)" 
                  type="monotone" 
                  dataKey="nominal" 
                  stroke="#4c6ef5" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorNominal)" 
                />
                <Area 
                  name="Inflation-Adjusted Value (Real)" 
                  type="monotone" 
                  dataKey="real" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  fillOpacity={0}
                />
                <Area 
                  name="Total Contributions" 
                  type="monotone" 
                  dataKey="invested" 
                  stroke="#94a3b8" 
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#colorInvested)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="yearLabel" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  tickFormatter={(val) => `${currency}${(val/1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number) => [`${currency}${value.toLocaleString()}`]}
                  contentStyle={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                    fontSize: "12px"
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                <Area type="monotone" dataKey="Stocks" stackId="1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                <Area type="monotone" dataKey="SIPs" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="Flat" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                <Area type="monotone" dataKey="Land" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="Bonds" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
                <Area type="monotone" dataKey="FD" stackId="1" stroke="#ec4899" fill="#ec4899" fillOpacity={0.6} />
                <Area type="monotone" dataKey="RD" stackId="1" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="Others" stackId="1" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
