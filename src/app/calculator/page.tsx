"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  Info,
  CheckCircle,
  AlertTriangle,
  PiggyBank,
  Briefcase,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import AIAssistant from "@/components/AIAssistant";
import { MOCK_PROPERTIES } from "@/data/properties";

export default function CalculatorPage() {
  const [income, setIncome] = useState(55000);
  const [monthlyDebts, setMonthlyDebts] = useState(800);
  const [interestRate, setInterestRate] = useState(5.0);
  const [loanTerm, setLoanTerm] = useState(30);

  const results = useMemo(() => {
    const monthlyGross = income / 12;
    const frontEndLimit = 0.31;
    const backEndLimit = 0.43;

    const maxHousingFromFrontEnd = monthlyGross * frontEndLimit;
    const maxTotalDebt = monthlyGross * backEndLimit;
    const availableForHousing = maxTotalDebt - monthlyDebts;

    const maxPayment = Math.min(maxHousingFromFrontEnd, availableForHousing);

    const monthlyRate = interestRate / 100 / 12;
    const termMonths = loanTerm * 12;

    const maxLoan =
      maxPayment *
      ((Math.pow(1 + monthlyRate, termMonths) - 1) /
        (monthlyRate * Math.pow(1 + monthlyRate, termMonths)));

    const currentBackEndDTI = (monthlyDebts / monthlyGross) * 100;
    const projectedBackEndDTI =
      ((maxPayment + monthlyDebts) / monthlyGross) * 100;

    return {
      monthlyGross: Math.round(monthlyGross),
      maxHousingPayment: Math.round(maxHousingFromFrontEnd),
      availableAfterDebts: Math.round(availableForHousing),
      effectiveMaxPayment: Math.round(maxPayment),
      maxLoanAmount: Math.round(maxLoan),
      currentBackEndDTI: currentBackEndDTI.toFixed(1),
      projectedBackEndDTI: projectedBackEndDTI.toFixed(1),
      frontEndDTI: ((maxPayment / monthlyGross) * 100).toFixed(1),
      isQualified: availableForHousing > 0 && currentBackEndDTI < 43,
    };
  }, [income, monthlyDebts, interestRate, loanTerm]);

  const aiContext = useMemo(
    () => ({
      currentPage: "calculator",
      properties: MOCK_PROPERTIES,
      totalCount: MOCK_PROPERTIES.length,
      calculatorData: {
        income,
        monthlyDebts,
        interestRate,
        loanTerm,
        maxLoanAmount: results.maxLoanAmount,
        effectiveMaxPayment: results.effectiveMaxPayment,
        frontEndDTI: results.frontEndDTI,
        projectedBackEndDTI: results.projectedBackEndDTI,
        isQualified: results.isQualified,
      },
    }),
    [income, monthlyDebts, interestRate, loanTerm, results]
  );

  return (
    <div className="min-h-screen p-8">
      {/* AI Assistant */}
      <AIAssistant appContext={aiContext} />

      <div className="max-w-[1000px] mx-auto">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm mb-8 no-underline transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Properties
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-br from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            NACA Affordability Calculator
          </h1>
          <p className="text-slate-400">
            Estimate your max loan amount with NACA&apos;s no-down-payment
            program
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-[rgba(15,23,42,0.8)] border border-blue-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-lg font-semibold text-slate-50 mb-6 pb-3 border-b border-blue-500/20">
              <Briefcase size={20} className="text-blue-500" />
              Your Financial Profile
            </div>

            <div className="mb-6">
              <label className="block text-sm text-slate-400 mb-2">
                Annual Gross Income
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  $
                </span>
                <input
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value))}
                  min="0"
                  step="1000"
                  className="w-full py-3.5 pl-8 pr-4 bg-[rgba(30,41,59,0.8)] border border-blue-500/20 rounded-xl text-slate-50 font-mono text-lg transition-all focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)]"
                />
              </div>
              <input
                type="range"
                value={income}
                onChange={(e) => setIncome(Number(e.target.value))}
                min="20000"
                max="200000"
                step="5000"
                className="w-full mt-2"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm text-slate-400 mb-2">
                Monthly Debt Payments (car, credit cards, loans, etc.)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  $
                </span>
                <input
                  type="number"
                  value={monthlyDebts}
                  onChange={(e) => setMonthlyDebts(Number(e.target.value))}
                  min="0"
                  step="50"
                  className="w-full py-3.5 pl-8 pr-4 bg-[rgba(30,41,59,0.8)] border border-blue-500/20 rounded-xl text-slate-50 font-mono text-lg transition-all focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)]"
                />
              </div>
              <input
                type="range"
                value={monthlyDebts}
                onChange={(e) => setMonthlyDebts(Number(e.target.value))}
                min="0"
                max="3000"
                step="50"
                className="w-full mt-2"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm text-slate-400 mb-2">
                Expected Interest Rate (NACA is typically 1-2% below market)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  min="3"
                  max="8"
                  step="0.25"
                  className="flex-1"
                />
                <span className="font-mono text-blue-400 min-w-[80px] text-right">
                  {interestRate.toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-slate-400 mb-2">
                Loan Term
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(Number(e.target.value))}
                  min="15"
                  max="30"
                  step="5"
                  className="flex-1"
                />
                <span className="font-mono text-blue-400 min-w-[80px] text-right">
                  {loanTerm} years
                </span>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <h4 className="flex items-center gap-2 text-sm text-blue-400 mb-3">
                <Info size={16} /> NACA Benefits
              </h4>
              <ul className="list-none space-y-2">
                {[
                  "No down payment required",
                  "No closing costs",
                  "No PMI (Private Mortgage Insurance)",
                  "Below-market interest rates",
                  "Must be owner-occupied primary residence",
                ].map((benefit, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-slate-400"
                  >
                    <CheckCircle
                      size={14}
                      className="text-emerald-500 flex-shrink-0 mt-0.5"
                    />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-[rgba(15,23,42,0.8)] border border-blue-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-lg font-semibold text-slate-50 mb-6 pb-3 border-b border-blue-500/20">
              <TrendingUp size={20} className="text-blue-500" />
              Your Estimated Approval
            </div>

            {/* Qualification Badge */}
            <div
              className={`flex items-center justify-center gap-2 p-4 rounded-xl text-lg font-semibold mb-6 ${
                results.isQualified
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : "bg-red-500/15 text-red-400 border border-red-500/30"
              }`}
            >
              {results.isQualified ? (
                <>
                  <CheckCircle size={20} />
                  You May Qualify for NACA!
                </>
              ) : (
                <>
                  <AlertTriangle size={20} />
                  Debt-to-Income Ratio Too High
                </>
              )}
            </div>

            {/* Main Result */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-5 text-center mb-6">
              <div className="text-sm text-slate-400 mb-2">
                Maximum Loan Amount
              </div>
              <div className="text-4xl font-bold font-mono text-blue-400 drop-shadow-[0_0_30px_rgba(96,165,250,0.3)]">
                ${results.maxLoanAmount.toLocaleString()}
              </div>
              <div className="text-sm text-slate-500 mt-1">
                with ${results.effectiveMaxPayment}/mo payment
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[rgba(30,41,59,0.5)] rounded-xl p-4">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  Monthly Gross
                </div>
                <div className="text-xl font-semibold font-mono text-slate-50">
                  ${results.monthlyGross.toLocaleString()}
                </div>
              </div>
              <div className="bg-[rgba(30,41,59,0.5)] rounded-xl p-4">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  Max Housing Payment
                </div>
                <div className="text-xl font-semibold font-mono text-slate-50">
                  ${results.effectiveMaxPayment.toLocaleString()}
                </div>
              </div>
              <div className="bg-[rgba(30,41,59,0.5)] rounded-xl p-4">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  Front-End DTI
                </div>
                <div className="text-xl font-semibold font-mono text-slate-50">
                  {results.frontEndDTI}%
                </div>
              </div>
              <div className="bg-[rgba(30,41,59,0.5)] rounded-xl p-4">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  Projected Back-End DTI
                </div>
                <div className="text-xl font-semibold font-mono text-slate-50">
                  {results.projectedBackEndDTI}%
                </div>
              </div>
            </div>

            {/* DTI Meters */}
            <div className="mb-6">
              <h4 className="text-sm text-slate-400 mb-3">
                Current Debt-to-Income (Before Housing)
              </h4>
              <div className="h-2.5 bg-[rgba(30,41,59,0.8)] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 meter-fill ${
                    parseFloat(results.currentBackEndDTI) < 25
                      ? "good"
                      : parseFloat(results.currentBackEndDTI) < 36
                      ? "warning"
                      : "danger"
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      (parseFloat(results.currentBackEndDTI) / 50) * 100
                    )}%`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-1 text-[0.7rem] text-slate-500">
                <span>0%</span>
                <span>25%</span>
                <span>36%</span>
                <span>43% max</span>
                <span>50%</span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-sm text-slate-400 mb-3">
                Projected Debt-to-Income (With Housing)
              </h4>
              <div className="h-2.5 bg-[rgba(30,41,59,0.8)] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 meter-fill ${
                    parseFloat(results.projectedBackEndDTI) < 36
                      ? "good"
                      : parseFloat(results.projectedBackEndDTI) <= 43
                      ? "warning"
                      : "danger"
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      (parseFloat(results.projectedBackEndDTI) / 50) * 100
                    )}%`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-1 text-[0.7rem] text-slate-500">
                <span>0%</span>
                <span>25%</span>
                <span>36%</span>
                <span>43% max</span>
                <span>50%</span>
              </div>
            </div>

            {/* Your Numbers Breakdown */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5">
              <h3 className="text-base text-emerald-400 mb-4 flex items-center gap-2">
                <PiggyBank size={18} /> Your Breakdown
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm py-2 border-b border-emerald-500/10">
                  <span className="text-slate-400">
                    Monthly gross income
                  </span>
                  <span className="text-slate-50 font-mono">
                    ${results.monthlyGross.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b border-emerald-500/10">
                  <span className="text-slate-400">
                    Max housing (31% front-end)
                  </span>
                  <span className="text-slate-50 font-mono">
                    ${results.maxHousingPayment.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b border-emerald-500/10">
                  <span className="text-slate-400">
                    Available after debts (43% back-end)
                  </span>
                  <span className="text-slate-50 font-mono">
                    ${results.availableAfterDebts.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b border-emerald-500/10">
                  <span className="text-slate-400">
                    Effective max payment
                  </span>
                  <span className="text-slate-50 font-mono">
                    ${results.effectiveMaxPayment.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm py-3 bg-blue-400/10 px-3 rounded-lg mt-2">
                  <span className="text-blue-400 font-semibold">
                    Estimated max loan
                  </span>
                  <span className="text-blue-400 font-bold font-mono text-lg">
                    ${results.maxLoanAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
