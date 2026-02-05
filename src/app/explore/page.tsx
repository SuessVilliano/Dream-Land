"use client";

import { useMemo, useState } from "react";
import { Database, ExternalLink, MapPin, TrendingUp, Zap } from "lucide-react";
import {
  MOCK_PROPERTIES,
  AUCTION_PLATFORMS,
  STATES,
} from "@/data/properties";
import AIAssistant from "@/components/AIAssistant";
import Link from "next/link";

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AZ: "Arizona", AR: "Arkansas", CO: "Colorado",
  FL: "Florida", GA: "Georgia", IN: "Indiana", KY: "Kentucky",
  LA: "Louisiana", MI: "Michigan", MO: "Missouri", MS: "Mississippi",
  NC: "North Carolina", NM: "New Mexico", NV: "Nevada", OH: "Ohio",
  OK: "Oklahoma", OR: "Oregon", SC: "South Carolina", TN: "Tennessee",
  TX: "Texas", WV: "West Virginia",
};

export default function ExplorePage() {
  const [activeState, setActiveState] = useState<string | null>(null);

  const stateData = useMemo(() => {
    const map: Record<
      string,
      {
        count: number;
        avgPrice: number;
        avgScore: number;
        rvCount: number;
        cheapest: number;
        totalAcres: number;
      }
    > = {};

    MOCK_PROPERTIES.forEach((p) => {
      if (!map[p.state]) {
        map[p.state] = {
          count: 0,
          avgPrice: 0,
          avgScore: 0,
          rvCount: 0,
          cheapest: Infinity,
          totalAcres: 0,
        };
      }
      const d = map[p.state];
      d.count++;
      d.avgPrice += p.openingBid || p.listPrice || 0;
      d.avgScore += p.aiScore;
      if (p.rvAllowed) d.rvCount++;
      const price = p.openingBid || p.listPrice || 0;
      if (price < d.cheapest) d.cheapest = price;
      d.totalAcres += p.acres;
    });

    return Object.entries(map)
      .map(([state, d]) => ({
        state,
        name: STATE_NAMES[state] || state,
        count: d.count,
        avgPrice: Math.round(d.avgPrice / d.count),
        avgScore: Math.round(d.avgScore / d.count),
        rvCount: d.rvCount,
        cheapest: d.cheapest,
        totalAcres: Math.round(d.totalAcres * 10) / 10,
      }))
      .sort((a, b) => b.count - a.count);
  }, []);

  const selectedState = stateData.find((s) => s.state === activeState);
  const stateProperties = activeState
    ? MOCK_PROPERTIES.filter((p) => p.state === activeState)
    : [];
  const statePlatformKey =
    activeState?.toLowerCase() === "fl"
      ? "florida"
      : activeState?.toLowerCase() === "ga"
      ? "georgia"
      : activeState?.toLowerCase() === "tx"
      ? "texas"
      : activeState?.toLowerCase() === "nc"
      ? "north_carolina"
      : activeState?.toLowerCase() === "tn"
      ? "tennessee"
      : activeState?.toLowerCase() === "mo"
      ? "missouri"
      : activeState?.toLowerCase() === "az"
      ? "arizona"
      : null;
  const statePlatforms = statePlatformKey
    ? AUCTION_PLATFORMS[statePlatformKey] || []
    : [];

  const aiContext = useMemo(
    () => ({
      currentPage: "explore",
      properties: MOCK_PROPERTIES,
      totalCount: MOCK_PROPERTIES.length,
      stateData,
      activeState,
    }),
    [stateData, activeState]
  );

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <AIAssistant appContext={aiContext} />

      <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3 mb-2">
        <Database size={24} className="text-blue-500" />
        Explore Markets
      </h1>
      <p className="text-slate-500 mb-8">
        Drill into states and counties to find your market
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-8">
        {/* State grid */}
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {stateData.map((s) => (
              <button
                key={s.state}
                onClick={() =>
                  setActiveState(activeState === s.state ? null : s.state)
                }
                className={`text-left p-4 rounded-xl border cursor-pointer transition-all ${
                  activeState === s.state
                    ? "bg-blue-500/15 border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                    : "bg-[rgba(15,23,42,0.8)] border-blue-500/10 hover:border-blue-500/30"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-slate-100">
                    {s.state}
                  </span>
                  <span className="text-xs text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded">
                    {s.count}
                  </span>
                </div>
                <div className="text-xs text-slate-500">{s.name}</div>
                <div className="text-xs text-slate-500 mt-1">
                  from ${s.cheapest.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <Zap size={10} className="text-blue-400" />
                  <span className="text-[0.65rem] text-blue-400 font-mono">
                    avg {s.avgScore}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* State detail sidebar */}
        <div>
          {selectedState ? (
            <div className="bg-[rgba(15,23,42,0.8)] border border-blue-500/15 rounded-xl p-6 sticky top-4">
              <h2 className="text-xl font-bold text-slate-100 mb-1">
                {selectedState.name}
              </h2>
              <p className="text-sm text-slate-500 mb-5">
                {selectedState.count} properties available
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-[rgba(30,41,59,0.5)] rounded-lg p-3">
                  <div className="text-[0.6rem] text-slate-500 uppercase tracking-wider">
                    Avg Price
                  </div>
                  <div className="text-base font-bold font-mono text-slate-100">
                    ${selectedState.avgPrice.toLocaleString()}
                  </div>
                </div>
                <div className="bg-[rgba(30,41,59,0.5)] rounded-lg p-3">
                  <div className="text-[0.6rem] text-slate-500 uppercase tracking-wider">
                    Cheapest
                  </div>
                  <div className="text-base font-bold font-mono text-emerald-400">
                    ${selectedState.cheapest.toLocaleString()}
                  </div>
                </div>
                <div className="bg-[rgba(30,41,59,0.5)] rounded-lg p-3">
                  <div className="text-[0.6rem] text-slate-500 uppercase tracking-wider">
                    Avg AI Score
                  </div>
                  <div className="text-base font-bold font-mono text-blue-400">
                    {selectedState.avgScore}
                  </div>
                </div>
                <div className="bg-[rgba(30,41,59,0.5)] rounded-lg p-3">
                  <div className="text-[0.6rem] text-slate-500 uppercase tracking-wider">
                    RV Friendly
                  </div>
                  <div className="text-base font-bold font-mono text-slate-100">
                    {selectedState.rvCount}
                  </div>
                </div>
              </div>

              {/* Properties in this state */}
              <h3 className="text-sm font-semibold text-slate-300 mb-3">
                Properties
              </h3>
              <div className="space-y-2 mb-6 max-h-[300px] overflow-y-auto">
                {stateProperties.map((p) => (
                  <Link
                    key={p.id}
                    href="/"
                    className="flex items-center justify-between p-3 bg-[rgba(30,41,59,0.4)] rounded-lg no-underline hover:bg-[rgba(30,41,59,0.7)] transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-slate-200 truncate">
                        {p.address}
                      </div>
                      <div className="text-xs text-slate-500">
                        {p.city} - {p.acres} ac -{" "}
                        {p.auctionType.replace("_", " ")}
                      </div>
                    </div>
                    <div className="text-right ml-3">
                      <div className="text-sm font-mono text-blue-400">
                        ${(p.openingBid || p.listPrice || 0).toLocaleString()}
                      </div>
                      <div className="text-[0.6rem] text-slate-500">
                        Score: {p.aiScore}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Auction platforms */}
              {statePlatforms.length > 0 && (
                <>
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">
                    Auction Platforms
                  </h3>
                  <div className="space-y-2">
                    {statePlatforms.map((pl, i) => (
                      <a
                        key={i}
                        href={pl.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-[rgba(30,41,59,0.3)] rounded-lg no-underline hover:bg-[rgba(30,41,59,0.6)] transition-colors group"
                      >
                        <div>
                          <div className="text-sm text-slate-300 group-hover:text-blue-400 transition-colors">
                            {pl.name}
                          </div>
                          <div className="text-xs text-slate-600">
                            {pl.type.replace("_", " ")} - {pl.schedule}
                          </div>
                        </div>
                        <ExternalLink
                          size={14}
                          className="text-slate-600 group-hover:text-blue-400 transition-colors"
                        />
                      </a>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="bg-[rgba(15,23,42,0.8)] border border-blue-500/15 rounded-xl p-8 text-center">
              <MapPin
                size={40}
                className="text-slate-700 mx-auto mb-4"
              />
              <p className="text-slate-500">
                Select a state to see market details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
