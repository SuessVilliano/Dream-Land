"use client";

import {
  MapPin,
  DollarSign,
  Home,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Zap,
  X,
  Building,
  Wifi,
  Droplets,
  Bell,
  Heart,
  BarChart3,
  Gavel,
} from "lucide-react";
import ScoreGauge from "./ScoreGauge";
import { PropertyData } from "@/data/properties";

interface PropertyDetailProps {
  property: PropertyData;
  onClose: () => void;
}

export default function PropertyDetail({
  property,
  onClose,
}: PropertyDetailProps) {
  const price = property.openingBid || property.listPrice || 0;

  return (
    <div className="bg-[rgba(15,23,42,0.95)] border border-blue-500/20 rounded-[20px] p-6 sticky top-[100px] max-h-[calc(100vh-120px)] overflow-y-auto">
      <button
        className="absolute top-4 right-4 bg-[rgba(30,41,59,0.8)] border-none text-slate-400 w-8 h-8 rounded-lg cursor-pointer flex items-center justify-center transition-all hover:bg-red-500 hover:text-white"
        onClick={onClose}
      >
        <X size={20} />
      </button>

      {/* Header */}
      <div className="flex justify-between items-start mb-6 pr-10">
        <div>
          <h2 className="text-xl font-semibold text-slate-50 mb-2">
            {property.address}
          </h2>
          <p className="flex items-center gap-1.5 text-slate-500 text-sm">
            <MapPin size={14} />
            {property.city}, {property.county} County, {property.state}{" "}
            {property.zip}
          </p>
        </div>
        <ScoreGauge score={property.aiScore} large />
      </div>

      {/* Detail Grid */}
      <div className="grid gap-5 mb-6">
        {/* Pricing */}
        <div className="bg-[rgba(30,41,59,0.5)] rounded-xl p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-400 mb-3 pb-2 border-b border-blue-500/10">
            <DollarSign size={16} /> Pricing
          </h3>
          <div className="flex justify-between items-center py-2 border-b border-blue-500/5">
            <span className="text-slate-500 text-sm">
              {property.auctionType === "listing"
                ? "List Price"
                : "Opening Bid"}
            </span>
            <strong className="text-slate-50 text-sm">
              ${price?.toLocaleString()}
            </strong>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-blue-500/5">
            <span className="text-slate-500 text-sm">Estimated Value</span>
            <strong className="text-slate-50 text-sm">
              ${property.estimatedValue?.toLocaleString()}
            </strong>
          </div>
          <div className="flex justify-between items-center py-2 bg-emerald-500/10 -mx-2 px-2 rounded-md">
            <span className="text-slate-500 text-sm">Potential Savings</span>
            <strong className="text-emerald-500 text-base">
              ${(property.estimatedValue - price)?.toLocaleString()}
            </strong>
          </div>
          {property.taxesDue && property.taxesDue > 0 && (
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500 text-sm">Taxes Due</span>
              <strong className="text-slate-50 text-sm">
                ${property.taxesDue?.toLocaleString()}
              </strong>
            </div>
          )}
        </div>

        {/* Property Details */}
        <div className="bg-[rgba(30,41,59,0.5)] rounded-xl p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-400 mb-3 pb-2 border-b border-blue-500/10">
            <Home size={16} /> Property Details
          </h3>
          <div className="flex justify-between items-center py-2 border-b border-blue-500/5">
            <span className="text-slate-500 text-sm">Acreage</span>
            <strong className="text-slate-50 text-sm">
              {property.acres} acres
            </strong>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-blue-500/5">
            <span className="text-slate-500 text-sm">Zoning</span>
            <strong className="text-slate-50 text-sm">
              {property.zoning}
            </strong>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-blue-500/5">
            <span className="text-slate-500 text-sm">Mobile Home</span>
            <strong
              className={
                property.mobileHomeAllowed
                  ? "text-emerald-500"
                  : "text-red-500"
              }
            >
              {property.mobileHomeAllowed ? "Allowed" : "Not Allowed"}
            </strong>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-blue-500/5">
            <span className="text-slate-500 text-sm">RV Living</span>
            <strong
              className={
                property.rvAllowed ? "text-emerald-500" : "text-red-500"
              }
            >
              {property.rvAllowed ? "Allowed" : "Not Allowed"}
            </strong>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-slate-500 text-sm">Flood Zone</span>
            <strong
              className={
                property.floodZone === "X"
                  ? "text-emerald-500"
                  : "text-red-500"
              }
            >
              {property.floodZone}{" "}
              {property.floodZone === "X"
                ? "(Minimal Risk)"
                : "(Elevated Risk)"}
            </strong>
          </div>
        </div>

        {/* Utilities */}
        <div className="bg-[rgba(30,41,59,0.5)] rounded-xl p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-400 mb-3 pb-2 border-b border-blue-500/10">
            <Wifi size={16} /> Utilities
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <div
              className={`flex flex-col items-center gap-1 p-3 rounded-lg text-xs ${
                property.utilities?.water
                  ? "bg-emerald-500/15 text-emerald-500"
                  : "bg-red-500/10 text-slate-500"
              }`}
            >
              <Droplets size={16} />
              <span>Water</span>
            </div>
            <div
              className={`flex flex-col items-center gap-1 p-3 rounded-lg text-xs ${
                property.utilities?.electric
                  ? "bg-emerald-500/15 text-emerald-500"
                  : "bg-red-500/10 text-slate-500"
              }`}
            >
              <Zap size={16} />
              <span>Electric</span>
            </div>
            <div
              className={`flex flex-col items-center gap-1 p-3 rounded-lg text-xs ${
                property.utilities?.sewer
                  ? "bg-emerald-500/15 text-emerald-500"
                  : "bg-red-500/10 text-slate-500"
              }`}
            >
              <Building size={16} />
              <span>Sewer</span>
            </div>
          </div>
        </div>

        {/* Auction Info */}
        <div className="bg-[rgba(30,41,59,0.5)] rounded-xl p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-400 mb-3 pb-2 border-b border-blue-500/10">
            <Gavel size={16} /> Auction Info
          </h3>
          <div className="flex justify-between items-center py-2 border-b border-blue-500/5">
            <span className="text-slate-500 text-sm">Platform</span>
            <strong className="text-slate-50 text-sm">
              {property.platform}
            </strong>
          </div>
          {property.auctionDate && (
            <>
              <div className="flex justify-between items-center py-2 border-b border-blue-500/5">
                <span className="text-slate-500 text-sm">Auction Date</span>
                <strong className="text-slate-50 text-sm">
                  {new Date(property.auctionDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </strong>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-blue-500/5">
                <span className="text-slate-500 text-sm">Auction Time</span>
                <strong className="text-slate-50 text-sm">
                  {property.auctionTime}
                </strong>
              </div>
            </>
          )}
          {property.caseNumber && (
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500 text-sm">Case/ID</span>
              <strong className="text-slate-50 text-sm">
                {property.caseNumber}
              </strong>
            </div>
          )}
        </div>
      </div>

      {/* AI Analysis */}
      <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-5 mb-6">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-400 mb-4">
          <BarChart3 size={16} /> AI Analysis
        </h3>
        <div
          className="ai-verdict text-xl font-bold p-3 rounded-lg text-center mb-4"
          data-verdict={property.aiAnalysis?.verdict
            ?.toLowerCase()
            .replace(/\s+/g, "-")}
        >
          {property.aiAnalysis?.verdict}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="flex items-center gap-1.5 text-sm font-semibold mb-2 text-emerald-400">
              <CheckCircle size={14} /> Reasons to Buy
            </h4>
            <ul className="list-none text-sm space-y-1">
              {property.aiAnalysis?.reasons?.map((reason, i) => (
                <li key={i} className="pl-4 relative text-slate-400">
                  <span className="absolute left-0 text-emerald-500">
                    &bull;
                  </span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="flex items-center gap-1.5 text-sm font-semibold mb-2 text-amber-400">
              <AlertTriangle size={14} /> Risk Factors
            </h4>
            <ul className="list-none text-sm space-y-1">
              {property.aiAnalysis?.risks?.map((risk, i) => (
                <li key={i} className="pl-4 relative text-slate-400">
                  <span className="absolute left-0 text-amber-500">
                    &bull;
                  </span>
                  {risk}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-[rgba(30,41,59,0.5)] p-3 rounded-lg flex justify-between items-center">
          <span className="text-slate-500 text-sm">
            Investment Potential:
          </span>
          <strong className="text-blue-400">
            {property.aiAnalysis?.investmentPotential}
          </strong>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <a
          href={property.platformUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-[0_4px_15px_rgba(59,130,246,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] transition-all no-underline"
        >
          <ExternalLink size={16} />
          View on {property.platform}
        </a>
        <button className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold bg-[rgba(30,41,59,0.8)] border border-blue-500/30 text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-all cursor-pointer">
          <Heart size={16} />
          Save Property
        </button>
        <button className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold bg-[rgba(30,41,59,0.8)] border border-blue-500/30 text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-all cursor-pointer">
          <Bell size={16} />
          Set Alert
        </button>
      </div>
    </div>
  );
}
