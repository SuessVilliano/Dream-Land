"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  TrendingUp,
  Zap,
  ChevronDown,
  Building,
  Trees,
  Map,
  List,
} from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import PropertyDetail from "@/components/PropertyDetail";
import PlatformDirectory from "@/components/PlatformDirectory";
import FiltersPanel, { Filters } from "@/components/FiltersPanel";
import { MOCK_PROPERTIES, PropertyData } from "@/data/properties";
import AIAssistant from "@/components/AIAssistant";
import Link from "next/link";

export default function HomePage() {
  const [selectedProperty, setSelectedProperty] =
    useState<PropertyData | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Filters>({
    state: "all",
    auctionType: "all",
    maxPrice: 100000,
    minAcres: 0,
    rvAllowed: false,
    mobileHomeAllowed: false,
    noFloodZone: false,
    minScore: 0,
  });

  const filteredProperties = useMemo(() => {
    return MOCK_PROPERTIES.filter((p) => {
      const price = p.openingBid || p.listPrice || 0;
      if (filters.state !== "all" && p.state !== filters.state) return false;
      if (filters.auctionType !== "all" && p.auctionType !== filters.auctionType)
        return false;
      if (price > filters.maxPrice) return false;
      if (p.acres < filters.minAcres) return false;
      if (filters.rvAllowed && !p.rvAllowed) return false;
      if (filters.mobileHomeAllowed && !p.mobileHomeAllowed) return false;
      if (filters.noFloodZone && p.floodZone !== "X") return false;
      if (p.aiScore < filters.minScore) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          p.address.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.county.toLowerCase().includes(q) ||
          p.state.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }
      return true;
    }).sort((a, b) => b.aiScore - a.aiScore);
  }, [filters, searchQuery]);

  const stats = useMemo(
    () => ({
      total: filteredProperties.length,
      avgScore:
        Math.round(
          filteredProperties.reduce((sum, p) => sum + p.aiScore, 0) /
            filteredProperties.length
        ) || 0,
      avgDiscount:
        Math.round(
          filteredProperties.reduce((sum, p) => {
            const price = p.openingBid || p.listPrice || 0;
            return sum + (1 - price / p.estimatedValue) * 100;
          }, 0) / filteredProperties.length
        ) || 0,
      rvFriendly: filteredProperties.filter((p) => p.rvAllowed).length,
    }),
    [filteredProperties]
  );

  const aiContext = useMemo(
    () => ({
      currentPage: "properties",
      properties: filteredProperties,
      selectedProperty: selectedProperty
        ? { id: selectedProperty.id, address: selectedProperty.address }
        : null,
      activeFilters: filters,
      filteredCount: filteredProperties.length,
      totalCount: MOCK_PROPERTIES.length,
    }),
    [filteredProperties, selectedProperty, filters]
  );

  return (
    <div className="min-h-screen">
      {/* AI Assistant */}
      <AIAssistant appContext={aiContext} />

      {/* Header */}
      <header className="bg-[rgba(15,23,42,0.8)] backdrop-blur-xl border-b border-blue-500/20 px-8 py-4 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-[0_4px_15px_rgba(59,130,246,0.3)]">
              <Map size={22} color="white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-br from-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
              LandScout
            </h1>
          </div>

          <div className="flex-1 max-w-[500px] relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              placeholder="Search by address, county, or state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3 pl-11 pr-4 bg-[rgba(30,41,59,0.8)] border border-blue-500/30 rounded-xl text-slate-200 text-[0.95rem] font-sans transition-all focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/calculator"
              className="px-4 py-2.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-medium hover:bg-emerald-500/30 transition-all no-underline"
            >
              NACA Calculator
            </Link>
            <div className="flex bg-[rgba(30,41,59,0.8)] rounded-lg p-1">
              <button
                className={`px-3 py-2 border-none rounded-md flex items-center gap-2 text-sm cursor-pointer transition-all ${
                  viewMode === "grid"
                    ? "bg-blue-500 text-white"
                    : "bg-transparent text-slate-500"
                }`}
                onClick={() => setViewMode("grid")}
              >
                <List size={16} /> Grid
              </button>
              <button
                className={`px-3 py-2 border-none rounded-md flex items-center gap-2 text-sm cursor-pointer transition-all ${
                  viewMode === "map"
                    ? "bg-blue-500 text-white"
                    : "bg-transparent text-slate-500"
                }`}
                onClick={() => setViewMode("map")}
              >
                <Map size={16} /> Map
              </button>
            </div>
            <button
              className="px-5 py-3 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl cursor-pointer flex items-center gap-2 text-sm font-medium transition-all hover:bg-blue-500/30"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
              Filters
              <ChevronDown size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-[rgba(15,23,42,0.6)] px-8 py-4 border-b border-blue-500/10">
        <div className="max-w-[1600px] mx-auto flex gap-12">
          <div className="flex items-center gap-3">
            <Building size={20} className="text-blue-500" />
            <div>
              <div className="text-xl font-semibold text-slate-50">
                {stats.total}
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">
                Properties
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TrendingUp size={20} className="text-blue-500" />
            <div>
              <div className="text-xl font-semibold text-slate-50">
                {stats.avgDiscount}%
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">
                Avg Discount
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Zap size={20} className="text-blue-500" />
            <div>
              <div className="text-xl font-semibold text-slate-50">
                {stats.avgScore}
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">
                Avg AI Score
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Trees size={20} className="text-blue-500" />
            <div>
              <div className="text-xl font-semibold text-slate-50">
                {stats.rvFriendly}
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">
                RV Friendly
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main
        className={`max-w-[1600px] mx-auto p-8 grid gap-8 ${
          selectedProperty
            ? "grid-cols-[1fr_500px]"
            : "grid-cols-[1fr_400px]"
        }`}
      >
        <div>
          {showFilters && (
            <FiltersPanel filters={filters} onChange={setFilters} />
          )}

          {/* Property Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProperties.length > 0 ? (
              filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onSelect={setSelectedProperty}
                  isSelected={selectedProperty?.id === property.id}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-16 text-slate-500">
                <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg mb-2">
                  No properties match your filters
                </h3>
                <p>Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar / Detail Panel */}
        <div className="flex flex-col gap-6 max-lg:hidden">
          {selectedProperty ? (
            <PropertyDetail
              property={selectedProperty}
              onClose={() => setSelectedProperty(null)}
            />
          ) : (
            <>
              <PlatformDirectory state="florida" />
              <PlatformDirectory state="georgia" />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
