"use client";

import { ExternalLink } from "lucide-react";
import { AUCTION_PLATFORMS } from "@/data/properties";

interface PlatformDirectoryProps {
  state: "florida" | "georgia";
}

export default function PlatformDirectory({ state }: PlatformDirectoryProps) {
  const platforms = AUCTION_PLATFORMS[state] || [];

  return (
    <div className="bg-[rgba(15,23,42,0.8)] border border-blue-500/15 rounded-2xl p-5">
      <h3 className="flex items-center gap-2 text-[0.95rem] font-semibold text-slate-50 mb-4">
        <ExternalLink size={16} />{" "}
        {state === "florida" ? "Florida" : "Georgia"} Auction Platforms
      </h3>
      <div className="flex flex-col gap-2">
        {platforms.map((platform, i) => (
          <a
            key={i}
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-[rgba(30,41,59,0.5)] border border-blue-500/10 rounded-xl no-underline transition-all hover:bg-blue-500/10 hover:border-blue-500/30"
          >
            <div className="flex-1">
              <span className="block text-slate-50 text-sm font-medium">
                {platform.name}
              </span>
              <span className="text-slate-500 text-[0.7rem] capitalize">
                {platform.type.replace("_", " ")}
              </span>
            </div>
            <span className="text-slate-400 text-xs">
              {platform.schedule}
            </span>
            <ExternalLink size={14} className="text-blue-500" />
          </a>
        ))}
      </div>
    </div>
  );
}
