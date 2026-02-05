"use client";

export interface Filters {
  state: string;
  auctionType: string;
  maxPrice: number;
  minAcres: number;
  rvAllowed: boolean;
  mobileHomeAllowed: boolean;
  noFloodZone: boolean;
  minScore: number;
}

interface FiltersPanelProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export default function FiltersPanel({ filters, onChange }: FiltersPanelProps) {
  return (
    <div className="bg-[rgba(15,23,42,0.8)] border border-blue-500/20 rounded-2xl p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      <div>
        <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">
          State
        </label>
        <select
          value={filters.state}
          onChange={(e) => onChange({ ...filters, state: e.target.value })}
          className="w-full p-2.5 bg-[rgba(30,41,59,0.8)] border border-blue-500/20 rounded-lg text-slate-200 font-sans focus:outline-none focus:border-blue-500"
        >
          <option value="all">All States</option>
          <option value="FL">Florida</option>
          <option value="GA">Georgia</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">
          Auction Type
        </label>
        <select
          value={filters.auctionType}
          onChange={(e) =>
            onChange({ ...filters, auctionType: e.target.value })
          }
          className="w-full p-2.5 bg-[rgba(30,41,59,0.8)] border border-blue-500/20 rounded-lg text-slate-200 font-sans focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Types</option>
          <option value="tax_deed">Tax Deed</option>
          <option value="sheriff_sale">Sheriff Sale</option>
          <option value="foreclosure">Foreclosure</option>
          <option value="listing">Listing</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">
          Max Price:{" "}
          <span className="font-mono text-blue-400">
            ${filters.maxPrice.toLocaleString()}
          </span>
        </label>
        <input
          type="range"
          min="5000"
          max="100000"
          step="5000"
          value={filters.maxPrice}
          onChange={(e) =>
            onChange({ ...filters, maxPrice: parseInt(e.target.value) })
          }
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">
          Min Acres:{" "}
          <span className="font-mono text-blue-400">
            {filters.minAcres} ac
          </span>
        </label>
        <input
          type="range"
          min="0"
          max="5"
          step="0.25"
          value={filters.minAcres}
          onChange={(e) =>
            onChange({ ...filters, minAcres: parseFloat(e.target.value) })
          }
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">
          Min AI Score:{" "}
          <span className="font-mono text-blue-400">{filters.minScore}</span>
        </label>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={filters.minScore}
          onChange={(e) =>
            onChange({ ...filters, minScore: parseInt(e.target.value) })
          }
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">
          Requirements
        </label>
        <div className="flex flex-wrap gap-2">
          <label className="flex items-center gap-2 px-3 py-2 bg-[rgba(30,41,59,0.6)] border border-blue-500/20 rounded-lg cursor-pointer text-sm transition-all has-[:checked]:bg-blue-500/20 has-[:checked]:border-blue-500">
            <input
              type="checkbox"
              checked={filters.rvAllowed}
              onChange={(e) =>
                onChange({ ...filters, rvAllowed: e.target.checked })
              }
              className="accent-blue-500"
            />
            RV
          </label>
          <label className="flex items-center gap-2 px-3 py-2 bg-[rgba(30,41,59,0.6)] border border-blue-500/20 rounded-lg cursor-pointer text-sm transition-all has-[:checked]:bg-blue-500/20 has-[:checked]:border-blue-500">
            <input
              type="checkbox"
              checked={filters.mobileHomeAllowed}
              onChange={(e) =>
                onChange({
                  ...filters,
                  mobileHomeAllowed: e.target.checked,
                })
              }
              className="accent-blue-500"
            />
            Mobile
          </label>
          <label className="flex items-center gap-2 px-3 py-2 bg-[rgba(30,41,59,0.6)] border border-blue-500/20 rounded-lg cursor-pointer text-sm transition-all has-[:checked]:bg-blue-500/20 has-[:checked]:border-blue-500">
            <input
              type="checkbox"
              checked={filters.noFloodZone}
              onChange={(e) =>
                onChange({ ...filters, noFloodZone: e.target.checked })
              }
              className="accent-blue-500"
            />
            No Flood
          </label>
        </div>
      </div>
    </div>
  );
}
