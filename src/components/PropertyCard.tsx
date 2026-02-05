"use client";

import {
  MapPin,
  Calendar,
  Home,
  Trees,
  Droplets,
  AlertTriangle,
  Shield,
  Gavel,
  Building,
  FileText,
  Zap,
} from "lucide-react";
import ScoreGauge from "./ScoreGauge";
import { PropertyData } from "@/data/properties";

interface PropertyCardProps {
  property: PropertyData;
  onSelect: (property: PropertyData) => void;
  isSelected: boolean;
}

export default function PropertyCard({
  property,
  onSelect,
  isSelected,
}: PropertyCardProps) {
  const price = property.openingBid || property.listPrice || 0;
  const discount = Math.round((1 - price / property.estimatedValue) * 100);

  const getTypeIcon = () => {
    switch (property.auctionType) {
      case "sheriff_sale":
        return <Shield size={14} />;
      case "tax_deed":
        return <Gavel size={14} />;
      case "foreclosure":
        return <Building size={14} />;
      default:
        return <FileText size={14} />;
    }
  };

  const getTypeLabel = () => {
    switch (property.auctionType) {
      case "sheriff_sale":
        return "Sheriff Sale";
      case "tax_deed":
        return "Tax Deed";
      case "foreclosure":
        return "Foreclosure";
      default:
        return "Listing";
    }
  };

  return (
    <div
      className={`bg-[rgba(15,23,42,0.8)] border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-blue-500/40 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] ${
        isSelected
          ? "border-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.3)]"
          : "border-blue-500/15"
      }`}
      onClick={() => onSelect(property)}
    >
      {/* Card Header */}
      <div className="p-4 flex justify-between items-center bg-[rgba(30,41,59,0.5)]">
        <div
          className="auction-badge flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider"
          data-type={property.auctionType}
        >
          {getTypeIcon()}
          <span>{getTypeLabel()}</span>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white px-3 py-1.5 rounded-full text-sm font-bold font-mono">
          -{discount}%
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5">
        <h3 className="text-[1.05rem] font-semibold text-slate-50 mb-2 leading-snug">
          {property.address}
        </h3>
        <p className="flex items-center gap-1.5 text-slate-500 text-sm mb-4">
          <MapPin size={12} />
          {property.city}, {property.state} {property.zip}
        </p>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <span className="block text-base font-semibold text-slate-50 font-mono">
              ${price?.toLocaleString()}
            </span>
            <span className="text-[0.7rem] text-slate-500 uppercase tracking-wider">
              {property.auctionType === "listing" ? "Price" : "Opening Bid"}
            </span>
          </div>
          <div className="text-center">
            <span className="block text-base font-semibold text-slate-50 font-mono">
              {property.acres} ac
            </span>
            <span className="text-[0.7rem] text-slate-500 uppercase tracking-wider">
              Size
            </span>
          </div>
          <div className="text-center">
            <span className="block text-base font-semibold text-slate-50 font-mono">
              ${property.estimatedValue?.toLocaleString()}
            </span>
            <span className="text-[0.7rem] text-slate-500 uppercase tracking-wider">
              Est. Value
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {property.mobileHomeAllowed && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[0.7rem] font-medium bg-green-500/15 text-green-400">
              <Home size={10} /> Mobile OK
            </span>
          )}
          {property.rvAllowed && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[0.7rem] font-medium bg-green-500/15 text-green-400">
              <Trees size={10} /> RV OK
            </span>
          )}
          {property.floodZone === "X" ? (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[0.7rem] font-medium bg-blue-500/15 text-blue-400">
              <Droplets size={10} /> No Flood
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[0.7rem] font-medium bg-red-500/15 text-red-400">
              <AlertTriangle size={10} /> Flood Zone
            </span>
          )}
          {property.waterfront && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[0.7rem] font-medium bg-cyan-500/15 text-cyan-400">
              <Droplets size={10} /> Waterfront
            </span>
          )}
        </div>

        {property.auctionDate && (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Calendar size={12} />
            <span>
              {new Date(property.auctionDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}{" "}
              @ {property.auctionTime}
            </span>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="px-5 py-4 bg-[rgba(30,41,59,0.3)] flex justify-between items-center">
        <div
          className="ai-verdict flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold"
          data-verdict={property.aiAnalysis?.verdict
            ?.toLowerCase()
            .replace(/\s+/g, "-")}
        >
          <Zap size={12} />
          <span>{property.aiAnalysis?.verdict}</span>
        </div>
        <ScoreGauge score={property.aiScore} />
      </div>
    </div>
  );
}
