"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useEffect } from "react";
import AIAssistant from "@/components/AIAssistant";
import {
  Crosshair,
  Loader2,
  MapPin,
  User,
  Home,
  DollarSign,
  Phone,
  Mail,
  FileText,
  ChevronRight,
  X,
  Search,
  Navigation,
  Layers,
  AlertCircle,
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
const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
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

/* ─── Types ─────────────────────────────────────────────────── */
interface NearbyParcel {
  address: string;
  lat: number;
  lng: number;
  distanceMeters: number;
  ownerName: string | null;
  estimatedValue: number | null;
  propertyType: string | null;
}

interface OwnerProfile {
  address: string;
  ownerName: string | null;
  mailingAddress: string | null;
  phoneNumbers: string[];
  emails: string[];
  propertyType: string | null;
  yearBuilt: number | null;
  lotSize: string | null;
  squareFootage: number | null;
  estimatedValue: number | null;
  assessedValue: number | null;
  taxAnnual: number | null;
  taxDelinquent: boolean | null;
  equityEstimate: number | null;
  lastSaleDate: string | null;
  lastSalePrice: number | null;
  ownerOccupied: boolean | null;
  legalDescription: string | null;
  zoning: string | null;
  saleHistory: Array<{ date: string; price: number }>;
  taxHistory: Array<{ year: number; amount: number; assessedValue: number }>;
  confidence: "high" | "medium" | "low";
}

/* ─── Map Recenter Hook ─────────────────────────────────────── */
function MapRecenter({
  lat,
  lng,
  zoom,
}: {
  lat: number;
  lng: number;
  zoom: number;
}) {
  const MapContainerMod = dynamic(
    () =>
      import("react-leaflet").then((mod) => {
        const { useMap } = mod;
        const RecenterInner = ({
          lat,
          lng,
          zoom,
        }: {
          lat: number;
          lng: number;
          zoom: number;
        }) => {
          const map = useMap();
          useEffect(() => {
            map.setView([lat, lng], zoom);
          }, [map, lat, lng, zoom]);
          return null;
        };
        return RecenterInner;
      }),
    { ssr: false }
  );
  return <MapContainerMod lat={lat} lng={lng} zoom={zoom} />;
}

/* ─── Main Page ─────────────────────────────────────────────── */
function CanvasInner() {
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [parcels, setParcels] = useState<NearbyParcel[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState<NearbyParcel | null>(
    null
  );
  const [ownerDetail, setOwnerDetail] = useState<OwnerProfile | null>(null);
  const [loadingOwner, setLoadingOwner] = useState(false);
  const [searchAddress, setSearchAddress] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [radius, setRadius] = useState(0.5);
  const [mapLayer, setMapLayer] = useState<"dark" | "satellite">("dark");

  /* --- GPS Locate --- */
  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser");
      return;
    }

    setLocating(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        setLocating(false);
      },
      (err) => {
        setGpsError(
          err.code === 1
            ? "Location access denied. Enable location in your browser settings."
            : "Could not determine your location. Try again."
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  /* --- Find Nearby Parcels --- */
  const findNearby = useCallback(
    async (lat: number, lng: number) => {
      setLoading(true);
      setParcels([]);
      setSelectedParcel(null);
      setOwnerDetail(null);

      try {
        const res = await fetch("/api/skip-trace", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "nearby", lat, lng, radius }),
        });
        const data = await res.json();
        setParcels(data.parcels || []);
      } catch {
        setParcels([]);
      }
      setLoading(false);
    },
    [radius]
  );

  /* --- Skip Trace a specific parcel --- */
  const skipTrace = useCallback(async (parcel: NearbyParcel) => {
    setSelectedParcel(parcel);
    setLoadingOwner(true);
    setOwnerDetail(null);

    try {
      const res = await fetch("/api/skip-trace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "lookup", address: parcel.address }),
      });
      const data = await res.json();
      setOwnerDetail(data.profile || null);
    } catch {
      setOwnerDetail(null);
    }
    setLoadingOwner(false);
  }, []);

  /* --- Search by Address --- */
  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchAddress.trim()) return;

      setSearchLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchAddress)}&format=json&limit=1`,
          { headers: { "User-Agent": "LandScout/1.0" } }
        );
        const data = await res.json();
        if (data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          setUserLat(lat);
          setUserLng(lng);
          findNearby(lat, lng);
        }
      } catch {
        // Failed to geocode
      }
      setSearchLoading(false);
    },
    [searchAddress, findNearby]
  );

  /* --- Trigger nearby search when we get GPS or change radius --- */
  useEffect(() => {
    if (userLat !== null && userLng !== null) {
      findNearby(userLat, userLng);
    }
  }, [radius]); // eslint-disable-line react-hooks/exhaustive-deps

  const aiContext = {
    currentPage: "canvas",
    userLocation:
      userLat && userLng ? { lat: userLat, lng: userLng } : null,
    nearbyParcels: parcels,
    selectedParcel,
    ownerDetail,
  };

  const tileUrls = {
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    satellite:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  };

  return (
    <div className="h-screen flex flex-col">
      <AIAssistant appContext={aiContext} />

      {/* Toolbar */}
      <div className="bg-[rgba(15,23,42,0.95)] border-b border-blue-500/20 px-6 py-3 flex items-center gap-4 z-10 flex-wrap">
        <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Crosshair size={20} className="text-blue-400" />
          Canvas
          <span className="text-sm font-normal text-slate-500">
            Door Knocker & Skip Trace
          </span>
        </h1>

        <div className="flex-1" />

        {/* Address search */}
        <form
          onSubmit={handleSearch}
          className="flex items-center gap-2"
        >
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              placeholder="Search address or city..."
              className="pl-9 pr-3 py-2 bg-[rgba(30,41,59,0.8)] border border-blue-500/20 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500 w-[260px] placeholder:text-slate-600"
            />
          </div>
          <button
            type="submit"
            disabled={searchLoading}
            className="px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 text-sm font-medium cursor-pointer hover:bg-blue-500/30 transition-all disabled:opacity-50"
          >
            {searchLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              "Go"
            )}
          </button>
        </form>

        {/* Radius selector */}
        <select
          value={radius}
          onChange={(e) => setRadius(parseFloat(e.target.value))}
          className="px-3 py-2 bg-[rgba(30,41,59,0.8)] border border-blue-500/20 rounded-lg text-sm text-slate-200 focus:outline-none"
        >
          <option value={0.25}>250m</option>
          <option value={0.5}>500m</option>
          <option value={1}>1km</option>
          <option value={2}>2km</option>
        </select>

        {/* Map layer toggle */}
        <button
          onClick={() =>
            setMapLayer((l) => (l === "dark" ? "satellite" : "dark"))
          }
          className="px-3 py-2 bg-[rgba(30,41,59,0.8)] border border-blue-500/20 rounded-lg text-slate-400 text-sm cursor-pointer hover:text-slate-200 transition-all flex items-center gap-1.5"
          title="Toggle map layer"
        >
          <Layers size={14} />
          {mapLayer === "dark" ? "Satellite" : "Dark"}
        </button>

        {/* GPS button */}
        <button
          onClick={() => {
            locate();
            // Will trigger findNearby via useEffect when lat/lng are set
            if (userLat && userLng) findNearby(userLat, userLng);
          }}
          disabled={locating}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white text-sm font-medium cursor-pointer flex items-center gap-2 hover:shadow-[0_4px_20px_rgba(59,130,246,0.3)] transition-all disabled:opacity-50 border-0"
        >
          {locating ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Navigation size={14} />
          )}
          {locating ? "Locating..." : "Use My Location"}
        </button>
      </div>

      {/* GPS Error banner */}
      {gpsError && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-2 flex items-center gap-2 text-sm text-red-400">
          <AlertCircle size={14} />
          {gpsError}
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex relative">
        {/* Map */}
        <div className="flex-1">
          {userLat !== null && userLng !== null ? (
            <MapContainer
              center={[userLat, userLng]}
              zoom={16}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom
            >
              <LeafletIconFix />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url={tileUrls[mapLayer]}
              />
              <MapRecenter lat={userLat} lng={userLng} zoom={16} />

              {/* User position */}
              <Circle
                center={[userLat, userLng]}
                radius={radius * 1000}
                pathOptions={{
                  color: "#3b82f6",
                  fillColor: "#3b82f6",
                  fillOpacity: 0.08,
                  weight: 1,
                }}
              />

              {/* Nearby parcels */}
              {parcels.map((p, i) => (
                <Marker
                  key={`${p.address}-${i}`}
                  position={[p.lat, p.lng]}
                  eventHandlers={{
                    click: () => skipTrace(p),
                  }}
                >
                  <Popup>
                    <div className="text-slate-900 min-w-[180px]">
                      <strong className="text-sm">{p.address}</strong>
                      {p.ownerName && (
                        <div className="text-xs text-gray-600 mt-1">
                          Owner: {p.ownerName}
                        </div>
                      )}
                      {p.estimatedValue && (
                        <div className="text-xs text-green-700 font-semibold mt-0.5">
                          Est: ${p.estimatedValue.toLocaleString()}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-0.5">
                        {p.distanceMeters}m away
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            /* Empty state */
            <div className="h-full flex flex-col items-center justify-center bg-[rgba(10,15,25,0.5)]">
              <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
                <Crosshair size={40} className="text-blue-400/50" />
              </div>
              <h2 className="text-xl font-semibold text-slate-300 mb-2">
                Canvas Mode
              </h2>
              <p className="text-slate-500 text-center max-w-md mb-6">
                Use your GPS location or search an address to discover
                nearby parcels with owner details. Built for driving for
                dollars and door-knocking.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={locate}
                  disabled={locating}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium cursor-pointer flex items-center gap-2 hover:shadow-[0_4px_20px_rgba(59,130,246,0.3)] transition-all disabled:opacity-50 border-0"
                >
                  {locating ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Navigation size={16} />
                  )}
                  {locating ? "Getting location..." : "Enable GPS"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Parcel list sidebar */}
        {parcels.length > 0 && !selectedParcel && (
          <div className="w-[340px] bg-[rgba(10,18,35,0.95)] border-l border-blue-500/20 overflow-y-auto shrink-0">
            <div className="p-4 border-b border-blue-500/15">
              <h3 className="text-sm font-semibold text-slate-200">
                Nearby Parcels
              </h3>
              <p className="text-xs text-slate-500">
                {parcels.length} found within {radius < 1 ? `${radius * 1000}m` : `${radius}km`}
              </p>
              {loading && (
                <div className="flex items-center gap-2 text-xs text-blue-400 mt-2">
                  <Loader2 size={12} className="animate-spin" />
                  Scanning area...
                </div>
              )}
            </div>
            <div className="divide-y divide-blue-500/10">
              {parcels.map((p, i) => (
                <button
                  key={`${p.address}-${i}`}
                  onClick={() => skipTrace(p)}
                  className="w-full text-left p-4 hover:bg-blue-500/5 transition-colors cursor-pointer bg-transparent border-0"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-slate-200 truncate">
                        {p.address}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-500">
                          {p.distanceMeters}m away
                        </span>
                        {p.ownerName && (
                          <span className="text-xs text-blue-400">
                            {p.ownerName}
                          </span>
                        )}
                        {p.estimatedValue && (
                          <span className="text-xs text-emerald-400 font-mono">
                            ${p.estimatedValue.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {p.propertyType && (
                        <span className="inline-block mt-1 text-[0.6rem] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">
                          {p.propertyType}
                        </span>
                      )}
                    </div>
                    <ChevronRight
                      size={14}
                      className="text-slate-600 shrink-0 mt-1"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Owner detail panel */}
        {selectedParcel && (
          <div className="w-[400px] bg-[rgba(10,18,35,0.95)] border-l border-blue-500/20 overflow-y-auto shrink-0">
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-100">
                    {selectedParcel.address}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedParcel.distanceMeters}m from your location
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedParcel(null);
                    setOwnerDetail(null);
                  }}
                  className="text-slate-500 hover:text-slate-300 bg-transparent border-none cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {loadingOwner ? (
                <div className="flex flex-col items-center py-12 text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin mb-3" />
                  <p className="text-sm">Running skip trace...</p>
                </div>
              ) : ownerDetail ? (
                <div className="space-y-5">
                  {/* Owner Info */}
                  <div className="p-4 rounded-xl bg-[rgba(30,41,59,0.5)] border border-blue-500/10">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <User size={12} />
                      Owner Information
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-slate-500">Name</span>
                        <div className="text-sm font-semibold text-slate-100">
                          {ownerDetail.ownerName || "Not available"}
                        </div>
                      </div>
                      {ownerDetail.mailingAddress && (
                        <div>
                          <span className="text-xs text-slate-500">
                            Mailing Address
                          </span>
                          <div className="text-sm text-slate-200">
                            {ownerDetail.mailingAddress}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <span
                          className={`text-[0.6rem] px-1.5 py-0.5 rounded font-semibold ${
                            ownerDetail.ownerOccupied
                              ? "bg-emerald-500/15 text-emerald-400"
                              : ownerDetail.ownerOccupied === false
                                ? "bg-amber-500/15 text-amber-400"
                                : "bg-slate-700/30 text-slate-500"
                          }`}
                        >
                          {ownerDetail.ownerOccupied === true
                            ? "Owner Occupied"
                            : ownerDetail.ownerOccupied === false
                              ? "Absentee Owner"
                              : "Occupancy Unknown"}
                        </span>
                        <span
                          className={`text-[0.6rem] px-1.5 py-0.5 rounded font-semibold ${
                            ownerDetail.confidence === "high"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : ownerDetail.confidence === "medium"
                                ? "bg-blue-500/15 text-blue-400"
                                : "bg-slate-700/30 text-slate-500"
                          }`}
                        >
                          {ownerDetail.confidence} confidence
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact */}
                  {(ownerDetail.phoneNumbers.length > 0 ||
                    ownerDetail.emails.length > 0) && (
                    <div className="p-4 rounded-xl bg-[rgba(30,41,59,0.5)] border border-blue-500/10">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Phone size={12} />
                        Contact Info
                      </h3>
                      {ownerDetail.phoneNumbers.map((ph, i) => (
                        <div key={i} className="flex items-center gap-2 mb-1">
                          <Phone size={12} className="text-slate-500" />
                          <a
                            href={`tel:${ph}`}
                            className="text-sm text-blue-400 no-underline hover:text-blue-300"
                          >
                            {ph}
                          </a>
                        </div>
                      ))}
                      {ownerDetail.emails.map((em, i) => (
                        <div key={i} className="flex items-center gap-2 mb-1">
                          <Mail size={12} className="text-slate-500" />
                          <a
                            href={`mailto:${em}`}
                            className="text-sm text-blue-400 no-underline hover:text-blue-300"
                          >
                            {em}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Property Details */}
                  <div className="p-4 rounded-xl bg-[rgba(30,41,59,0.5)] border border-blue-500/10">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Home size={12} />
                      Property Details
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        {
                          label: "Type",
                          val: ownerDetail.propertyType,
                        },
                        {
                          label: "Year Built",
                          val: ownerDetail.yearBuilt,
                        },
                        {
                          label: "Lot Size",
                          val: ownerDetail.lotSize,
                        },
                        {
                          label: "Sq Ft",
                          val: ownerDetail.squareFootage
                            ? `${ownerDetail.squareFootage.toLocaleString()}`
                            : null,
                        },
                        {
                          label: "Zoning",
                          val: ownerDetail.zoning,
                        },
                        {
                          label: "Legal Desc",
                          val: ownerDetail.legalDescription
                            ? ownerDetail.legalDescription.slice(0, 40) +
                              (ownerDetail.legalDescription.length > 40
                                ? "..."
                                : "")
                            : null,
                        },
                      ].map((item) => (
                        <div key={item.label}>
                          <div className="text-[0.6rem] text-slate-500 uppercase">
                            {item.label}
                          </div>
                          <div className="text-sm text-slate-200 font-medium">
                            {item.val ?? "—"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Valuation */}
                  <div className="p-4 rounded-xl bg-[rgba(30,41,59,0.5)] border border-blue-500/10">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <DollarSign size={12} />
                      Valuation & Equity
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-[0.6rem] text-slate-500 uppercase">
                          Est. Value
                        </div>
                        <div className="text-lg font-bold font-mono text-emerald-400">
                          {ownerDetail.estimatedValue
                            ? `$${ownerDetail.estimatedValue.toLocaleString()}`
                            : "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[0.6rem] text-slate-500 uppercase">
                          Assessed
                        </div>
                        <div className="text-lg font-bold font-mono text-blue-400">
                          {ownerDetail.assessedValue
                            ? `$${ownerDetail.assessedValue.toLocaleString()}`
                            : "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[0.6rem] text-slate-500 uppercase">
                          Last Sale
                        </div>
                        <div className="text-sm text-slate-200">
                          {ownerDetail.lastSalePrice
                            ? `$${ownerDetail.lastSalePrice.toLocaleString()}`
                            : "—"}
                          {ownerDetail.lastSaleDate && (
                            <span className="text-slate-500 text-xs ml-1">
                              ({ownerDetail.lastSaleDate})
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-[0.6rem] text-slate-500 uppercase">
                          Equity Est.
                        </div>
                        <div
                          className={`text-sm font-bold font-mono ${
                            ownerDetail.equityEstimate &&
                            ownerDetail.equityEstimate > 0
                              ? "text-emerald-400"
                              : "text-slate-400"
                          }`}
                        >
                          {ownerDetail.equityEstimate
                            ? `$${ownerDetail.equityEstimate.toLocaleString()}`
                            : "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[0.6rem] text-slate-500 uppercase">
                          Annual Tax
                        </div>
                        <div className="text-sm text-slate-200">
                          {ownerDetail.taxAnnual
                            ? `$${ownerDetail.taxAnnual.toLocaleString()}`
                            : "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[0.6rem] text-slate-500 uppercase">
                          Tax Status
                        </div>
                        <div className="text-sm">
                          {ownerDetail.taxDelinquent === true ? (
                            <span className="text-red-400 font-semibold">
                              Delinquent
                            </span>
                          ) : ownerDetail.taxDelinquent === false ? (
                            <span className="text-emerald-400">Current</span>
                          ) : (
                            <span className="text-slate-500">Unknown</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sale History */}
                  {ownerDetail.saleHistory.length > 0 && (
                    <div className="p-4 rounded-xl bg-[rgba(30,41,59,0.5)] border border-blue-500/10">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <FileText size={12} />
                        Sale History
                      </h3>
                      <div className="space-y-1.5">
                        {ownerDetail.saleHistory.map((s, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-slate-400">{s.date}</span>
                            <span className="font-mono text-slate-200">
                              ${s.price.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tax History */}
                  {ownerDetail.taxHistory.length > 0 && (
                    <div className="p-4 rounded-xl bg-[rgba(30,41,59,0.5)] border border-blue-500/10">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                        Tax History
                      </h3>
                      <div className="space-y-1.5">
                        {ownerDetail.taxHistory.map((t, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-slate-400">{t.year}</span>
                            <div className="text-right">
                              <span className="font-mono text-slate-200">
                                ${t.amount.toLocaleString()}
                              </span>
                              <span className="text-slate-500 text-xs ml-2">
                                (assessed: ${t.assessedValue.toLocaleString()})
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Back button */}
                  <button
                    onClick={() => {
                      setSelectedParcel(null);
                      setOwnerDetail(null);
                    }}
                    className="w-full py-2.5 rounded-xl border border-blue-500/20 text-slate-400 text-sm font-medium cursor-pointer hover:bg-blue-500/5 transition-all bg-transparent"
                  >
                    Back to Parcel List
                  </button>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <p className="text-sm">No owner data available</p>
                  <p className="text-xs mt-1">
                    Ensure RAPIDAPI_KEY is configured for full skip trace
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CanvasPage() {
  return <CanvasInner />;
}
