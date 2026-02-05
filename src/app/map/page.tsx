"use client";

import dynamic from "next/dynamic";
import { useState, useMemo, useEffect } from "react";
import { MOCK_PROPERTIES, PropertyData, STATES } from "@/data/properties";
import AIAssistant from "@/components/AIAssistant";
import ScoreGauge from "@/components/ScoreGauge";
import { useSavedProperties } from "@/context/SavedPropertiesContext";
import {
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Droplets,
  Zap,
  Home,
  X,
} from "lucide-react";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);
const LeafletIconFix = dynamic(
  () => import("@/components/LeafletIconFix"),
  { ssr: false }
);

function MapInner() {
  const [stateFilter, setStateFilter] = useState("all");
  const [selectedProperty, setSelectedProperty] =
    useState<PropertyData | null>(null);
  const { toggleSave, isSaved } = useSavedProperties();
  const [coloredIcons, setColoredIcons] = useState<Record<string, L.Icon> | null>(null);

  // Load colored icons client-side only
  useEffect(() => {
    import("@/components/LeafletIconFix").then(({ createColoredIcon }) => {
      setColoredIcons({
        sheriff_sale: createColoredIcon("red"),
        tax_deed: createColoredIcon("gold"),
        tax_lien: createColoredIcon("orange"),
        foreclosure: createColoredIcon("violet"),
        listing: createColoredIcon("green"),
        default: createColoredIcon("blue"),
      });
    });
  }, []);

  const filtered = useMemo(() => {
    if (stateFilter === "all") return MOCK_PROPERTIES;
    return MOCK_PROPERTIES.filter((p) => p.state === stateFilter);
  }, [stateFilter]);

  const aiContext = useMemo(
    () => ({
      currentPage: "map",
      properties: filtered,
      totalCount: MOCK_PROPERTIES.length,
      filteredCount: filtered.length,
      stateFilter,
    }),
    [filtered, stateFilter]
  );

  return (
    <div className="h-screen flex flex-col">
      <AIAssistant appContext={aiContext} />

      {/* Map toolbar */}
      <div className="bg-[rgba(15,23,42,0.9)] border-b border-blue-500/20 px-6 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-slate-100">
            Property Map{" "}
            <span className="text-sm font-normal text-slate-500">
              {filtered.length} properties
            </span>
          </h1>
          {/* Legend */}
          <div className="hidden md:flex items-center gap-3 text-[0.6rem] text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />Sheriff</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" />Tax Deed</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400" />Foreclosure</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" />Listing</span>
          </div>
        </div>
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="px-3 py-2 bg-[rgba(30,41,59,0.8)] border border-blue-500/20 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="all">All States</option>
          {STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Map + sidebar */}
      <div className="flex-1 flex relative">
        <div className="flex-1">
          <MapContainer
            center={[33.5, -90.0]}
            zoom={5}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom
          >
            <LeafletIconFix />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {filtered.map((p) => (
              <Marker
                key={p.id}
                position={[p.lat, p.lng]}
                icon={coloredIcons?.[p.auctionType] ?? coloredIcons?.default ?? undefined}
                eventHandlers={{
                  click: () => setSelectedProperty(p),
                }}
              >
                <Popup>
                  <div className="text-slate-900 min-w-[200px]">
                    <strong>{p.address}</strong>
                    <br />
                    {p.city}, {p.state}
                    <br />
                    <span className="text-green-700 font-bold">
                      ${(p.openingBid || p.listPrice || 0).toLocaleString()}
                    </span>
                    <span className="text-gray-500 text-xs ml-1">
                      {p.acres} ac
                    </span>
                    <br />
                    <span className="text-xs text-gray-600">
                      {p.auctionType.replace("_", " ")} &middot; AI Score: {p.aiScore}
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Side detail */}
        {selectedProperty && (
          <div className="w-[380px] bg-[rgba(10,18,35,0.95)] border-l border-blue-500/20 overflow-y-auto p-5 shrink-0">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-100">
                  {selectedProperty.address}
                </h2>
                <p className="text-sm text-slate-400">
                  {selectedProperty.city}, {selectedProperty.state}{" "}
                  {selectedProperty.zip}
                </p>
              </div>
              <button
                onClick={() => setSelectedProperty(null)}
                className="text-slate-500 hover:text-slate-300 bg-transparent border-none cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <ScoreGauge score={selectedProperty.aiScore} size={70} />
              <div>
                <div className="text-2xl font-bold font-mono text-blue-400">
                  $
                  {(
                    selectedProperty.openingBid ||
                    selectedProperty.listPrice ||
                    0
                  ).toLocaleString()}
                </div>
                <div className="text-xs text-slate-500">
                  Est. value: $
                  {selectedProperty.estimatedValue.toLocaleString()}
                </div>
              </div>
            </div>

            <div
              className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium mb-4 verdict-badge ${selectedProperty.aiAnalysis.verdict
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
            >
              {selectedProperty.aiAnalysis.verdict}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[rgba(30,41,59,0.5)] rounded-lg p-3">
                <div className="text-[0.65rem] text-slate-500 uppercase">
                  Acres
                </div>
                <div className="text-sm font-semibold text-slate-100">
                  {selectedProperty.acres}
                </div>
              </div>
              <div className="bg-[rgba(30,41,59,0.5)] rounded-lg p-3">
                <div className="text-[0.65rem] text-slate-500 uppercase">
                  Type
                </div>
                <div className="text-sm font-semibold text-slate-100">
                  {selectedProperty.auctionType.replace("_", " ")}
                </div>
              </div>
              <div className="bg-[rgba(30,41,59,0.5)] rounded-lg p-3">
                <div className="text-[0.65rem] text-slate-500 uppercase">
                  Zoning
                </div>
                <div className="text-sm font-semibold text-slate-100">
                  {selectedProperty.zoning}
                </div>
              </div>
              <div className="bg-[rgba(30,41,59,0.5)] rounded-lg p-3">
                <div className="text-[0.65rem] text-slate-500 uppercase">
                  Flood
                </div>
                <div className="text-sm font-semibold text-slate-100">
                  {selectedProperty.floodZone}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              {selectedProperty.utilities.water && (
                <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs">
                  <Droplets size={12} /> Water
                </span>
              )}
              {selectedProperty.utilities.electric && (
                <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded text-xs">
                  <Zap size={12} /> Electric
                </span>
              )}
              {(selectedProperty.rvAllowed ||
                selectedProperty.mobileHomeAllowed) && (
                <span className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded text-xs">
                  <Home size={12} />{" "}
                  {selectedProperty.rvAllowed ? "RV" : "Mobile"} OK
                </span>
              )}
            </div>

            <div className="space-y-2 mb-4">
              {selectedProperty.aiAnalysis.reasons.map((r, i) => (
                <div
                  key={i}
                  className="text-sm text-emerald-400/90 flex items-start gap-2"
                >
                  <span className="text-emerald-500 mt-0.5">+</span> {r}
                </div>
              ))}
              {selectedProperty.aiAnalysis.risks.map((r, i) => (
                <div
                  key={i}
                  className="text-sm text-amber-400/90 flex items-start gap-2"
                >
                  <span className="text-amber-500 mt-0.5">!</span> {r}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => toggleSave(String(selectedProperty.id))}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium cursor-pointer transition-all ${
                  isSaved(String(selectedProperty.id))
                    ? "bg-blue-500/20 border-blue-500/40 text-blue-400"
                    : "bg-transparent border-blue-500/20 text-slate-400 hover:text-blue-400"
                }`}
              >
                {isSaved(String(selectedProperty.id)) ? (
                  <BookmarkCheck size={16} />
                ) : (
                  <Bookmark size={16} />
                )}
                {isSaved(String(selectedProperty.id)) ? "Saved" : "Save"}
              </button>
              <a
                href={selectedProperty.platformUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-500 rounded-xl text-white text-sm font-medium no-underline hover:bg-blue-600 transition-colors"
              >
                <ExternalLink size={16} /> View Source
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MapPage() {
  return <MapInner />;
}
