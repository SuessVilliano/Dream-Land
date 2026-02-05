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
} from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import PropertyDetail from "@/components/PropertyDetail";
import PlatformDirectory from "@/components/PlatformDirectory";
import FiltersPanel, { Filters } from "@/components/FiltersPanel";
import { MOCK_PROPERTIES, PropertyData } from "@/data/properties";
import AIAssistant from "@/components/AIAssistant";

export default function PropertiesPage() {
  const [selectedProperty, setSelectedProperty] =
    useState<PropertyData | null>(null);
  const [showFilters, setShowFilters] = useState(true);
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
      <AIAssistant appContext={aiContext} />

      {/* Search + filter bar */}
      <div className="bg-[rgba(15,23,42,0.8)] dark:bg-[rgba(15,23,42,0.8)] backdrop-blur-xl border-b border-blue-500/20 px-8 py-4 sticky top-0 z-40">
        <div className="flex items-center gap-4">
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
          <button
            className={`px-5 py-3 border rounded-xl cursor-pointer flex items-center gap-2 text-sm font-medium transition-all ${
              showFilters
                ? "bg-blue-500/20 border-blue-500/40 text-blue-400"
                : "bg-transparent border-blue-500/20 text-slate-400 hover:text-blue-400"
            }`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            Filters
            <ChevronDown
              size={14}
              className={`transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Stats inline */}
          <div className="flex items-center gap-6 ml-auto">
            <div className="flex items-center gap-2">
              <Building size={16} className="text-blue-500" />
              <span className="text-sm font-semibold text-slate-200">
                {stats.total}
              </span>
              <span className="text-xs text-slate-500">properties</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-500" />
              <span className="text-sm font-semibold text-slate-200">
                {stats.avgDiscount}%
              </span>
              <span className="text-xs text-slate-500">avg discount</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-blue-500" />
              <span className="text-sm font-semibold text-slate-200">
                {stats.avgScore}
              </span>
              <span className="text-xs text-slate-500">avg score</span>
            </div>
            <div className="flex items-center gap-2">
              <Trees size={16} className="text-blue-500" />
              <span className="text-sm font-semibold text-slate-200">
                {stats.rvFriendly}
              </span>
              <span className="text-xs text-slate-500">RV ok</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main
        className={`p-6 grid gap-6 ${
          selectedProperty
            ? "grid-cols-[1fr_480px]"
            : "grid-cols-1"
        }`}
      >
        <div>
          {showFilters && (
            <FiltersPanel filters={filters} onChange={setFilters} />
          )}

          {/* Property Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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

        {/* Detail Panel */}
        {selectedProperty && (
          <div className="max-lg:hidden">
            <PropertyDetail
              property={selectedProperty}
              onClose={() => setSelectedProperty(null)}
            />
          </div>
        )}
      </main>
    </div>
  );
}
