"use client";

import { useMemo, useState } from "react";
import { Bookmark, Trash2, ExternalLink, Search } from "lucide-react";
import { useSavedProperties } from "@/context/SavedPropertiesContext";
import { MOCK_PROPERTIES, PropertyData } from "@/data/properties";
import PropertyCard from "@/components/PropertyCard";
import PropertyDetail from "@/components/PropertyDetail";
import AIAssistant from "@/components/AIAssistant";

export default function SavedPage() {
  const { savedIds, toggleSave } = useSavedProperties();
  const [selectedProperty, setSelectedProperty] =
    useState<PropertyData | null>(null);

  const savedProperties = useMemo(
    () => MOCK_PROPERTIES.filter((p) => savedIds.has(String(p.id))),
    [savedIds]
  );

  const totalValue = useMemo(
    () =>
      savedProperties.reduce(
        (s, p) => s + (p.openingBid || p.listPrice || 0),
        0
      ),
    [savedProperties]
  );

  const aiContext = useMemo(
    () => ({
      currentPage: "saved",
      savedProperties,
      savedCount: savedProperties.length,
      totalInvestment: totalValue,
    }),
    [savedProperties, totalValue]
  );

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <AIAssistant appContext={aiContext} />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Bookmark size={24} className="text-blue-500" />
            Saved Properties
          </h1>
          <p className="text-slate-500 mt-1">
            {savedProperties.length} saved - $
            {totalValue.toLocaleString()} total
          </p>
        </div>
      </div>

      {savedProperties.length === 0 ? (
        <div className="text-center py-20">
          <Search className="w-16 h-16 mx-auto text-slate-700 mb-4" />
          <h2 className="text-xl text-slate-400 mb-2">
            No saved properties yet
          </h2>
          <p className="text-slate-600">
            Browse properties and click the bookmark icon to save them here
          </p>
        </div>
      ) : (
        <div
          className={`grid gap-6 ${
            selectedProperty
              ? "grid-cols-[1fr_500px]"
              : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
          }`}
        >
          <div
            className={
              selectedProperty
                ? "grid grid-cols-1 gap-4"
                : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 contents"
            }
          >
            {savedProperties.map((p) => (
              <div key={p.id} className="relative group">
                <PropertyCard
                  property={p}
                  onSelect={setSelectedProperty}
                  isSelected={selectedProperty?.id === p.id}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSave(String(p.id));
                  }}
                  className="absolute top-3 right-3 w-8 h-8 bg-red-500/80 rounded-lg flex items-center justify-center border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-500"
                  title="Remove from saved"
                >
                  <Trash2 size={14} className="text-white" />
                </button>
              </div>
            ))}
          </div>

          {selectedProperty && (
            <PropertyDetail
              property={selectedProperty}
              onClose={() => setSelectedProperty(null)}
            />
          )}
        </div>
      )}
    </div>
  );
}
