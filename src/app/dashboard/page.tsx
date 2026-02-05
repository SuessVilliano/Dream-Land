"use client";

import { useMemo } from "react";
import {
  Building,
  TrendingUp,
  MapPin,
  DollarSign,
  Trees,
  Zap,
  Target,
  Award,
} from "lucide-react";
import Link from "next/link";
import { MOCK_PROPERTIES } from "@/data/properties";
import AIAssistant from "@/components/AIAssistant";
import ScoreGauge from "@/components/ScoreGauge";

export default function DashboardPage() {
  const stats = useMemo(() => {
    const props = MOCK_PROPERTIES;
    const prices = props.map((p) => p.openingBid || p.listPrice || 0);
    const totalAcres = props.reduce((s, p) => s + p.acres, 0);
    const avgScore = Math.round(
      props.reduce((s, p) => s + p.aiScore, 0) / props.length
    );
    const avgDiscount = Math.round(
      props.reduce((s, p) => {
        const price = p.openingBid || p.listPrice || 0;
        return s + (1 - price / p.estimatedValue) * 100;
      }, 0) / props.length
    );

    const stateMap: Record<
      string,
      { count: number; avgPrice: number; avgScore: number }
    > = {};
    props.forEach((p) => {
      if (!stateMap[p.state])
        stateMap[p.state] = { count: 0, avgPrice: 0, avgScore: 0 };
      stateMap[p.state].count++;
      stateMap[p.state].avgPrice += p.openingBid || p.listPrice || 0;
      stateMap[p.state].avgScore += p.aiScore;
    });
    const stateStats = Object.entries(stateMap)
      .map(([state, data]) => ({
        state,
        count: data.count,
        avgPrice: Math.round(data.avgPrice / data.count),
        avgScore: Math.round(data.avgScore / data.count),
      }))
      .sort((a, b) => b.count - a.count);

    const auctionTypes = {
      tax_deed: props.filter((p) => p.auctionType === "tax_deed").length,
      sheriff_sale: props.filter((p) => p.auctionType === "sheriff_sale")
        .length,
      foreclosure: props.filter((p) => p.auctionType === "foreclosure").length,
      listing: props.filter((p) => p.auctionType === "listing").length,
    };

    const topDeals = [...props].sort((a, b) => b.aiScore - a.aiScore).slice(0, 5);

    const cheapest = [...props]
      .sort(
        (a, b) =>
          (a.openingBid || a.listPrice || 0) -
          (b.openingBid || b.listPrice || 0)
      )
      .slice(0, 5);

    const upcoming = props
      .filter((p) => p.auctionDate)
      .sort(
        (a, b) =>
          new Date(a.auctionDate!).getTime() -
          new Date(b.auctionDate!).getTime()
      )
      .slice(0, 5);

    return {
      total: props.length,
      states: stateStats.length,
      avgPrice: Math.round(
        prices.reduce((a, b) => a + b, 0) / prices.length
      ),
      lowestPrice: Math.min(...prices),
      totalAcres: Math.round(totalAcres * 10) / 10,
      avgScore,
      avgDiscount,
      rvFriendly: props.filter((p) => p.rvAllowed).length,
      stateStats,
      auctionTypes,
      topDeals,
      cheapest,
      upcoming,
    };
  }, []);

  const aiContext = useMemo(
    () => ({
      currentPage: "dashboard",
      properties: MOCK_PROPERTIES,
      totalCount: MOCK_PROPERTIES.length,
      stats: {
        total: stats.total,
        states: stats.states,
        avgScore: stats.avgScore,
        avgDiscount: stats.avgDiscount,
      },
    }),
    [stats]
  );

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <AIAssistant appContext={aiContext} />

      <h1 className="text-2xl font-bold text-slate-100 mb-2">Dashboard</h1>
      <p className="text-slate-500 mb-8">
        Overview of {stats.total} properties across {stats.states} states
      </p>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            icon: Building,
            label: "Total Properties",
            value: stats.total,
            color: "blue",
          },
          {
            icon: MapPin,
            label: "States Covered",
            value: stats.states,
            color: "purple",
          },
          {
            icon: TrendingUp,
            label: "Avg Discount",
            value: `${stats.avgDiscount}%`,
            color: "emerald",
          },
          {
            icon: DollarSign,
            label: "Avg Price",
            value: `$${stats.avgPrice.toLocaleString()}`,
            color: "amber",
          },
          {
            icon: Zap,
            label: "Avg AI Score",
            value: stats.avgScore,
            color: "blue",
          },
          {
            icon: Trees,
            label: "RV Friendly",
            value: stats.rvFriendly,
            color: "emerald",
          },
          {
            icon: Target,
            label: "Lowest Entry",
            value: `$${stats.lowestPrice.toLocaleString()}`,
            color: "cyan",
          },
          {
            icon: Award,
            label: "Total Acreage",
            value: `${stats.totalAcres} ac`,
            color: "purple",
          },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div
              key={i}
              className="bg-[rgba(15,23,42,0.8)] border border-blue-500/15 rounded-xl p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon size={18} className={`text-${kpi.color}-500`} />
                <span className="text-xs text-slate-500 uppercase tracking-wider">
                  {kpi.label}
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-100">
                {kpi.value}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Auction Type Breakdown */}
        <div className="bg-[rgba(15,23,42,0.8)] border border-blue-500/15 rounded-xl p-5">
          <h2 className="text-base font-semibold text-slate-200 mb-4">
            By Auction Type
          </h2>
          {Object.entries(stats.auctionTypes).map(([type, count]) => (
            <div key={type} className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400 capitalize">
                  {type.replace("_", " ")}
                </span>
                <span className="text-slate-200 font-mono">{count}</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                  style={{
                    width: `${(count / stats.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* States Breakdown */}
        <div className="bg-[rgba(15,23,42,0.8)] border border-blue-500/15 rounded-xl p-5">
          <h2 className="text-base font-semibold text-slate-200 mb-4">
            By State
          </h2>
          <div className="space-y-2 max-h-[240px] overflow-y-auto">
            {stats.stateStats.map((s) => (
              <div
                key={s.state}
                className="flex items-center justify-between py-1.5 border-b border-slate-800/50"
              >
                <span className="text-sm text-slate-300 font-medium">
                  {s.state}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-500">
                    avg ${s.avgPrice.toLocaleString()}
                  </span>
                  <span className="text-xs text-blue-400 font-mono">
                    {s.count} props
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Auctions */}
        <div className="bg-[rgba(15,23,42,0.8)] border border-blue-500/15 rounded-xl p-5">
          <h2 className="text-base font-semibold text-slate-200 mb-4">
            Upcoming Auctions
          </h2>
          <div className="space-y-3">
            {stats.upcoming.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 py-2 border-b border-slate-800/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-200 truncate">
                    {p.city}, {p.state}
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(p.auctionDate!).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    - ${(p.openingBid || 0).toLocaleString()}
                  </div>
                </div>
                <div className="text-xs text-blue-400 font-mono">
                  {p.aiScore}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Deals + Cheapest */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[rgba(15,23,42,0.8)] border border-blue-500/15 rounded-xl p-5">
          <h2 className="text-base font-semibold text-slate-200 mb-4">
            Top AI-Scored Deals
          </h2>
          {stats.topDeals.map((p, i) => (
            <Link
              key={p.id}
              href="/"
              className="flex items-center gap-3 py-3 border-b border-slate-800/30 no-underline hover:bg-slate-800/30 -mx-2 px-2 rounded transition-colors"
            >
              <span className="text-lg font-bold text-slate-600 w-6">
                {i + 1}
              </span>
              <ScoreGauge score={p.aiScore} size={40} />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-slate-200 truncate">
                  {p.address}
                </div>
                <div className="text-xs text-slate-500">
                  {p.city}, {p.state} - {p.acres} ac
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono font-semibold text-emerald-400">
                  ${(p.openingBid || p.listPrice || 0).toLocaleString()}
                </div>
                <div className="text-[0.65rem] text-slate-500">
                  {p.aiAnalysis.verdict}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-[rgba(15,23,42,0.8)] border border-blue-500/15 rounded-xl p-5">
          <h2 className="text-base font-semibold text-slate-200 mb-4">
            Cheapest Properties
          </h2>
          {stats.cheapest.map((p, i) => (
            <Link
              key={p.id}
              href="/"
              className="flex items-center gap-3 py-3 border-b border-slate-800/30 no-underline hover:bg-slate-800/30 -mx-2 px-2 rounded transition-colors"
            >
              <span className="text-lg font-bold text-slate-600 w-6">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-slate-200 truncate">
                  {p.address}
                </div>
                <div className="text-xs text-slate-500">
                  {p.city}, {p.state} - {p.acres} ac -{" "}
                  {p.auctionType.replace("_", " ")}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono font-bold text-blue-400">
                  ${(p.openingBid || p.listPrice || 0).toLocaleString()}
                </div>
                <div className="text-[0.65rem] text-slate-500">
                  est. ${p.estimatedValue.toLocaleString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
