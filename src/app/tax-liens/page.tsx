"use client";

import { useState } from "react";
import AIAssistant from "@/components/AIAssistant";
import {
  FileText,
  Search,
  Calendar,
  ExternalLink,
  MapPin,
  DollarSign,
  Info,
  ChevronRight,
  Filter,
} from "lucide-react";

/* ─── Static Data: Public Tax Lien/Deed Resources by State ──── */
const STATE_RESOURCES: Record<
  string,
  { type: "lien" | "deed" | "hybrid"; interestRate: string; redemption: string; resources: { name: string; url: string }[] }
> = {
  FL: {
    type: "hybrid",
    interestRate: "Up to 18%",
    redemption: "2 years",
    resources: [
      { name: "RealAuction.com (Most FL Counties)", url: "https://www.realauction.com" },
      { name: "GovEase.com", url: "https://www.govease.com" },
      { name: "Grant Street Group", url: "https://www.grantstreet.com" },
    ],
  },
  TX: {
    type: "deed",
    interestRate: "25% penalty",
    redemption: "6 months (homestead: 2 years)",
    resources: [
      { name: "Texas Tax Sales", url: "https://www.texastaxsales.com" },
      { name: "County Auction Listings", url: "https://www.auction.com" },
    ],
  },
  AZ: {
    type: "lien",
    interestRate: "Up to 16%",
    redemption: "3 years",
    resources: [
      { name: "Arizona Tax Lien Sales", url: "https://www.bidtaxliens.com" },
      { name: "Maricopa County Treasurer", url: "https://treasurer.maricopa.gov" },
    ],
  },
  GA: {
    type: "deed",
    interestRate: "20% premium",
    redemption: "12 months",
    resources: [
      { name: "Georgia Tax Sales", url: "https://www.taxsaleresources.com" },
      { name: "GovEase.com", url: "https://www.govease.com" },
    ],
  },
  NJ: {
    type: "lien",
    interestRate: "Up to 18%",
    redemption: "2 years",
    resources: [
      { name: "NJ Tax Lien Sales", url: "https://www.njtaxliens.com" },
      { name: "Grant Street Group", url: "https://www.grantstreet.com" },
    ],
  },
  OH: {
    type: "lien",
    interestRate: "Up to 18%",
    redemption: "1 year",
    resources: [
      { name: "Ohio Tax Lien Sales", url: "https://www.zeusauction.com" },
    ],
  },
  IN: {
    type: "lien",
    interestRate: "10-25%",
    redemption: "1 year",
    resources: [
      { name: "SRI Tax Sale", url: "https://www.sriservices.com" },
    ],
  },
  IL: {
    type: "lien",
    interestRate: "Up to 18% (biannual)",
    redemption: "2-3 years",
    resources: [
      { name: "Illinois Tax Buyers", url: "https://www.iltaxbuyers.com" },
    ],
  },
  SC: {
    type: "lien",
    interestRate: "3-12%",
    redemption: "12 months",
    resources: [
      { name: "SC Delinquent Tax Sales", url: "https://www.sctaxsales.com" },
    ],
  },
  NC: {
    type: "deed",
    interestRate: "N/A (deed state)",
    redemption: "10 days (upset bid)",
    resources: [
      { name: "NC Tax Foreclosure Sales", url: "https://www.ncforeclosures.gov" },
    ],
  },
  NV: {
    type: "deed",
    interestRate: "N/A (deed state)",
    redemption: "None (deed is final)",
    resources: [
      { name: "Bid4Assets", url: "https://www.bid4assets.com" },
    ],
  },
  AL: {
    type: "lien",
    interestRate: "12%",
    redemption: "3 years",
    resources: [
      { name: "Alabama Tax Lien Auctions", url: "https://www.govease.com" },
    ],
  },
  CO: {
    type: "lien",
    interestRate: "9-12%",
    redemption: "3 years",
    resources: [
      { name: "Colorado Tax Lien Sales", url: "https://www.bid4assets.com" },
    ],
  },
  MS: {
    type: "lien",
    interestRate: "18% (1.5%/mo)",
    redemption: "2 years",
    resources: [
      { name: "MS Tax Sales", url: "https://www.taxsaleresources.com" },
    ],
  },
  MO: {
    type: "lien",
    interestRate: "10%",
    redemption: "1 year",
    resources: [
      { name: "Missouri Tax Sales", url: "https://www.taxsaleresources.com" },
    ],
  },
};

const UPCOMING_SALES = [
  { state: "FL", county: "Hillsborough", date: "2025-06-15", type: "Tax Deed" },
  { state: "FL", county: "Orange", date: "2025-06-22", type: "Tax Deed" },
  { state: "FL", county: "Miami-Dade", date: "2025-07-01", type: "Tax Lien" },
  { state: "TX", county: "Harris", date: "2025-07-08", type: "Tax Deed" },
  { state: "TX", county: "Dallas", date: "2025-08-05", type: "Tax Deed" },
  { state: "AZ", county: "Maricopa", date: "2025-02-15", type: "Tax Lien" },
  { state: "GA", county: "Fulton", date: "2025-04-01", type: "Tax Deed" },
  { state: "NJ", county: "Essex", date: "2025-10-15", type: "Tax Lien" },
  { state: "OH", county: "Cuyahoga", date: "2025-09-20", type: "Tax Lien" },
  { state: "IN", county: "Marion", date: "2025-09-01", type: "Tax Lien" },
  { state: "IL", county: "Cook", date: "2025-11-01", type: "Tax Lien" },
  { state: "CO", county: "Denver", date: "2025-11-15", type: "Tax Lien" },
  { state: "NV", county: "Clark", date: "2025-06-01", type: "Tax Deed" },
  { state: "AL", county: "Jefferson", date: "2025-05-15", type: "Tax Lien" },
  { state: "SC", county: "Charleston", date: "2025-11-01", type: "Tax Lien" },
];

const ALL_STATES = Object.keys(STATE_RESOURCES).sort();

export default function TaxLiensPage() {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [tab, setTab] = useState<"browse" | "calendar" | "learn">("browse");

  const stateData = selectedState ? STATE_RESOURCES[selectedState] : null;
  const filteredSales = selectedState
    ? UPCOMING_SALES.filter((s) => s.state === selectedState)
    : UPCOMING_SALES;

  const aiContext = {
    currentPage: "tax-liens",
    selectedState,
    stateData,
    upcomingSales: filteredSales,
  };

  return (
    <div className="p-8 max-w-[1100px] mx-auto">
      <AIAssistant appContext={aiContext} />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3 mb-2">
            <FileText size={24} className="text-orange-400" />
            Tax Liens & Tax Deeds
          </h1>
          <p className="text-slate-500">
            Find tax lien investments and upcoming tax deed auctions across 15+ states
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[rgba(30,41,59,0.5)] rounded-xl p-1">
        {([
          { id: "browse" as const, label: "Browse by State", icon: MapPin },
          { id: "calendar" as const, label: "Upcoming Sales", icon: Calendar },
          { id: "learn" as const, label: "Learn", icon: Info },
        ]).map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all border-0 ${
                tab === t.id
                  ? "bg-orange-500/15 text-orange-400"
                  : "bg-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Browse by State */}
      {tab === "browse" && (
        <div className="flex gap-6">
          {/* State grid */}
          <div className={selectedState ? "w-[280px] shrink-0" : "flex-1"}>
            <h3 className="text-sm font-semibold text-slate-300 mb-3">
              Select a State
            </h3>
            <div className={`grid gap-2 ${selectedState ? "grid-cols-1" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"}`}>
              {ALL_STATES.map((st) => {
                const data = STATE_RESOURCES[st];
                const isActive = selectedState === st;
                return (
                  <button
                    key={st}
                    onClick={() => setSelectedState(isActive ? null : st)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all bg-transparent ${
                      isActive
                        ? "border-orange-500/40 bg-orange-500/10"
                        : "border-blue-500/10 hover:border-blue-500/25 bg-[rgba(15,23,42,0.6)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-200">
                        {st}
                      </span>
                      <span
                        className={`text-[0.55rem] font-bold uppercase px-1.5 py-0.5 rounded ${
                          data.type === "lien"
                            ? "bg-orange-500/15 text-orange-400"
                            : data.type === "deed"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-blue-500/15 text-blue-400"
                        }`}
                      >
                        {data.type}
                      </span>
                    </div>
                    {!selectedState && (
                      <div className="text-[0.6rem] text-slate-500 mt-1">
                        {data.interestRate}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* State detail */}
          {selectedState && stateData && (
            <div className="flex-1 space-y-5">
              <div className="p-5 rounded-xl bg-[rgba(15,23,42,0.8)] border border-orange-500/20">
                <h2 className="text-lg font-bold text-slate-100 mb-4">
                  {selectedState} — Tax{" "}
                  {stateData.type === "lien"
                    ? "Lien"
                    : stateData.type === "deed"
                      ? "Deed"
                      : "Lien/Deed (Hybrid)"}{" "}
                  State
                </h2>
                <div className="grid grid-cols-3 gap-4 mb-5">
                  <div className="p-3 rounded-lg bg-[rgba(30,41,59,0.5)]">
                    <div className="text-[0.6rem] text-slate-500 uppercase">
                      Type
                    </div>
                    <div className="text-sm font-semibold text-slate-100 capitalize">
                      Tax {stateData.type}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[rgba(30,41,59,0.5)]">
                    <div className="text-[0.6rem] text-slate-500 uppercase">
                      Interest / Penalty
                    </div>
                    <div className="text-sm font-semibold text-orange-400">
                      {stateData.interestRate}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[rgba(30,41,59,0.5)]">
                    <div className="text-[0.6rem] text-slate-500 uppercase">
                      Redemption
                    </div>
                    <div className="text-sm font-semibold text-slate-100">
                      {stateData.redemption}
                    </div>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-slate-300 mb-3">
                  Auction Resources
                </h3>
                <div className="space-y-2">
                  {stateData.resources.map((r) => (
                    <a
                      key={r.name}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg bg-[rgba(30,41,59,0.3)] hover:bg-[rgba(30,41,59,0.6)] transition-colors no-underline group"
                    >
                      <span className="text-sm text-slate-300 group-hover:text-white">
                        {r.name}
                      </span>
                      <ExternalLink
                        size={14}
                        className="text-slate-600 group-hover:text-blue-400"
                      />
                    </a>
                  ))}
                </div>
              </div>

              {/* Upcoming sales for this state */}
              {filteredSales.length > 0 && (
                <div className="p-5 rounded-xl bg-[rgba(15,23,42,0.8)] border border-blue-500/15">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <Calendar size={14} className="text-blue-400" />
                    Upcoming Sales in {selectedState}
                  </h3>
                  <div className="space-y-2">
                    {filteredSales.map((sale, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-lg bg-[rgba(30,41,59,0.3)]"
                      >
                        <div>
                          <span className="text-sm font-medium text-slate-200">
                            {sale.county} County
                          </span>
                          <span className="text-xs text-slate-500 ml-2">
                            {sale.type}
                          </span>
                        </div>
                        <span className="text-sm font-mono text-blue-400">
                          {sale.date}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Calendar Tab */}
      {tab === "calendar" && (
        <div>
          <div className="space-y-2">
            {[...UPCOMING_SALES]
              .sort(
                (a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime()
              )
              .map((sale, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-xl bg-[rgba(15,23,42,0.6)] border border-blue-500/10"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[60px]">
                      <div className="text-lg font-bold font-mono text-slate-100">
                        {new Date(sale.date).toLocaleDateString("en-US", {
                          month: "short",
                        })}
                      </div>
                      <div className="text-2xl font-bold font-mono text-blue-400">
                        {new Date(sale.date).getDate()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-200">
                        {sale.county} County, {sale.state}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-[0.6rem] font-bold uppercase px-1.5 py-0.5 rounded ${
                            sale.type === "Tax Lien"
                              ? "bg-orange-500/15 text-orange-400"
                              : "bg-emerald-500/15 text-emerald-400"
                          }`}
                        >
                          {sale.type}
                        </span>
                        <span className="text-xs text-slate-500">
                          {STATE_RESOURCES[sale.state]?.interestRate}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedState(sale.state);
                      setTab("browse");
                    }}
                    className="px-3 py-2 rounded-lg bg-[rgba(30,41,59,0.5)] border border-blue-500/15 text-slate-400 text-xs font-medium cursor-pointer hover:text-blue-400 hover:border-blue-500/30 transition-all flex items-center gap-1"
                  >
                    Details <ChevronRight size={12} />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Learn Tab */}
      {tab === "learn" && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.8)] border border-blue-500/15">
            <h2 className="text-lg font-semibold text-slate-100 mb-3">
              Tax Lien Investing 101
            </h2>
            <div className="text-sm text-slate-400 leading-relaxed space-y-3">
              <p>
                When property owners fail to pay their taxes, the local government places a
                <strong className="text-slate-200"> tax lien</strong> on the property. To recoup the unpaid taxes,
                the government then sells these liens to investors at auction.
              </p>
              <p>
                As an investor, you pay the delinquent tax amount and receive a <strong className="text-slate-200">certificate</strong>.
                The property owner then has a <strong className="text-slate-200">redemption period</strong> (varies by state) to pay
                you back the amount plus <strong className="text-orange-400">interest</strong> (8-36% depending on state law).
              </p>
              <p>
                If the owner doesn&apos;t redeem within the redemption period, you can begin
                <strong className="text-slate-200"> foreclosure proceedings</strong> to take ownership of the property.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.8)] border border-blue-500/15">
            <h2 className="text-lg font-semibold text-slate-100 mb-3">
              Tax Deed Sales vs Tax Lien Sales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/15">
                <h3 className="text-sm font-semibold text-orange-400 mb-2">
                  Tax Lien States
                </h3>
                <ul className="text-sm text-slate-400 space-y-1.5 list-none p-0">
                  <li>You buy the <strong className="text-slate-200">debt</strong>, not the property</li>
                  <li>Earn interest when owner redeems (8-36%)</li>
                  <li>Lower risk, more predictable returns</li>
                  <li>May eventually get property if unredeemed</li>
                  <li>States: AZ, FL, IL, IN, NJ, OH, SC, CO, AL, MS, MO</li>
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                <h3 className="text-sm font-semibold text-emerald-400 mb-2">
                  Tax Deed States
                </h3>
                <ul className="text-sm text-slate-400 space-y-1.5 list-none p-0">
                  <li>You buy the <strong className="text-slate-200">property</strong> directly</li>
                  <li>Often 40-80% below market value</li>
                  <li>Immediate ownership (after short redemption)</li>
                  <li>Higher competition at auctions</li>
                  <li>States: TX, GA, NC, NV, CA, OR, WA, TN</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.8)] border border-blue-500/15">
            <h2 className="text-lg font-semibold text-slate-100 mb-3">
              Due Diligence Checklist
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                "Verify the parcel ID and legal description",
                "Check for other liens (IRS, municipal, HOA)",
                "Research the property's market value",
                "Check flood zone status (FEMA maps)",
                "Verify zoning allows your intended use",
                "Inspect the property in person if possible",
                "Check for environmental contamination",
                "Confirm the redemption period in your state",
                "Calculate total investment including fees",
                "Review the auction rules and registration",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-sm text-slate-400"
                >
                  <span className="text-blue-400 mt-0.5 shrink-0">{i + 1}.</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
