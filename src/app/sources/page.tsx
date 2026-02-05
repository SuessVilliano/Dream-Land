"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Database,
  Plug,
  CheckCircle,
  XCircle,
  Loader2,
  Play,
  RefreshCw,
  Zap,
  Globe,
  Server,
  Shield,
} from "lucide-react";
import AIAssistant from "@/components/AIAssistant";

interface SourceStatus {
  id: string;
  name: string;
  provider: string;
  type: string;
  configured: boolean;
  states: string[];
}

interface PipelineStatus {
  sources: SourceStatus[];
  summary: {
    total: number;
    configured: number;
    unconfigured: number;
    providers: Record<string, boolean>;
  };
}

const PROVIDER_META: Record<
  string,
  { icon: typeof Plug; color: string; label: string }
> = {
  firecrawl: { icon: Globe, color: "text-orange-400", label: "Firecrawl" },
  rapidapi: { icon: Zap, color: "text-blue-400", label: "RapidAPI" },
  apify: { icon: Server, color: "text-green-400", label: "Apify" },
  direct: { icon: Shield, color: "text-slate-400", label: "Direct / Free" },
};

const TYPE_COLORS: Record<string, string> = {
  auction: "bg-amber-500/20 text-amber-300",
  listing: "bg-emerald-500/20 text-emerald-300",
  valuation: "bg-blue-500/20 text-blue-300",
  enrichment: "bg-purple-500/20 text-purple-300",
};

export default function SourcesPage() {
  const [status, setStatus] = useState<PipelineStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningPipeline, setRunningPipeline] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<Record<
    string,
    unknown
  > | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "status" }),
      });
      const data = await res.json();
      setStatus(data);
    } catch {
      // Pipeline endpoint may not be reachable in dev without env vars
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const triggerScrape = async (state?: string) => {
    setRunningPipeline(true);
    setPipelineResult(null);
    try {
      const res = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "scrape", state }),
      });
      const data = await res.json();
      setPipelineResult(data);
    } catch {
      setPipelineResult({ error: "Pipeline request failed" });
    }
    setRunningPipeline(false);
  };

  const providers = status?.summary?.providers || {};
  const grouped = (status?.sources || []).reduce(
    (acc, s) => {
      if (!acc[s.provider]) acc[s.provider] = [];
      acc[s.provider].push(s);
      return acc;
    },
    {} as Record<string, SourceStatus[]>
  );

  const aiContext = {
    currentPage: "sources",
    sourcesStatus: status,
    pipelineResult,
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <AIAssistant appContext={aiContext} />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3 mb-2">
            <Database size={24} className="text-blue-500" />
            Data Sources
          </h1>
          <p className="text-slate-500">
            Monitor and control your connected data providers
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => fetchStatus()}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-[rgba(30,41,59,0.8)] border border-blue-500/20 text-slate-300 text-sm font-medium flex items-center gap-2 cursor-pointer hover:border-blue-500/40 transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={() => triggerScrape()}
            disabled={runningPipeline}
            className="px-4 py-2.5 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-medium flex items-center gap-2 cursor-pointer hover:bg-blue-500/30 transition-all disabled:opacity-50"
          >
            {runningPipeline ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Play size={14} />
            )}
            Run Full Scrape
          </button>
        </div>
      </div>

      {/* Provider Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {(["firecrawl", "rapidapi", "apify"] as const).map((prov) => {
          const meta = PROVIDER_META[prov];
          const Icon = meta.icon;
          const configured = providers[prov] ?? false;
          const sourceCount =
            status?.sources?.filter((s) => s.provider === prov).length ?? 0;

          return (
            <div
              key={prov}
              className={`p-5 rounded-xl border transition-all ${
                configured
                  ? "bg-[rgba(15,23,42,0.8)] border-blue-500/20"
                  : "bg-[rgba(15,23,42,0.4)] border-slate-700/30"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon size={18} className={meta.color} />
                  <span className="font-semibold text-slate-200">
                    {meta.label}
                  </span>
                </div>
                {configured ? (
                  <CheckCircle size={16} className="text-emerald-400" />
                ) : (
                  <XCircle size={16} className="text-slate-600" />
                )}
              </div>
              <div className="text-xs text-slate-500 mb-2">
                {sourceCount} source{sourceCount !== 1 ? "s" : ""} registered
              </div>
              <div
                className={`text-xs font-mono px-2 py-1 rounded inline-block ${
                  configured
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-slate-700/30 text-slate-600"
                }`}
              >
                {configured ? "API Key Active" : "Not Configured"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Source List by Provider */}
      {loading && !status ? (
        <div className="text-center py-16 text-slate-500">
          <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin" />
          <p>Loading data sources...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([provider, sources]) => {
            const meta = PROVIDER_META[provider] || PROVIDER_META.direct;
            const Icon = meta.icon;

            return (
              <div key={provider}>
                <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-3">
                  <Icon size={16} className={meta.color} />
                  {meta.label}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sources.map((s) => (
                    <div
                      key={s.id}
                      className={`p-4 rounded-xl border transition-all ${
                        s.configured
                          ? "bg-[rgba(15,23,42,0.8)] border-blue-500/15"
                          : "bg-[rgba(15,23,42,0.4)] border-slate-700/20 opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-200">
                          {s.name}
                        </span>
                        {s.configured ? (
                          <CheckCircle
                            size={14}
                            className="text-emerald-400 shrink-0"
                          />
                        ) : (
                          <XCircle
                            size={14}
                            className="text-slate-600 shrink-0"
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[0.6rem] font-semibold uppercase px-2 py-0.5 rounded ${
                            TYPE_COLORS[s.type] || "bg-slate-700/30 text-slate-400"
                          }`}
                        >
                          {s.type}
                        </span>
                        {s.states[0] === "*" ? (
                          <span className="text-[0.6rem] text-slate-500">
                            All states
                          </span>
                        ) : (
                          <span className="text-[0.6rem] text-slate-500">
                            {s.states.join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pipeline Results */}
      {pipelineResult && (
        <div className="mt-8 p-5 rounded-xl bg-[rgba(15,23,42,0.9)] border border-blue-500/20">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">
            Pipeline Results
          </h3>
          {"error" in pipelineResult ? (
            <p className="text-sm text-red-400">
              {pipelineResult.error as string}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold font-mono text-slate-100">
                    {(pipelineResult.summary as Record<string, number>)
                      ?.totalSteps ?? 0}
                  </div>
                  <div className="text-[0.6rem] text-slate-500 uppercase">
                    Steps
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold font-mono text-emerald-400">
                    {(pipelineResult.summary as Record<string, number>)
                      ?.successful ?? 0}
                  </div>
                  <div className="text-[0.6rem] text-slate-500 uppercase">
                    Successful
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold font-mono text-red-400">
                    {(pipelineResult.summary as Record<string, number>)
                      ?.failed ?? 0}
                  </div>
                  <div className="text-[0.6rem] text-slate-500 uppercase">
                    Failed
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold font-mono text-slate-300">
                    {Math.round(
                      ((pipelineResult.summary as Record<string, number>)
                        ?.totalDurationMs ?? 0) / 1000
                    )}
                    s
                  </div>
                  <div className="text-[0.6rem] text-slate-500 uppercase">
                    Duration
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                {(
                  (pipelineResult.steps as Array<{
                    source: string;
                    status: string;
                    itemCount?: number;
                    error?: string;
                    durationMs?: number;
                  }>) || []
                ).map((step, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs py-1.5 px-2 rounded bg-[rgba(30,41,59,0.3)]"
                  >
                    <span className="text-slate-300 font-mono">
                      {step.source}
                    </span>
                    <div className="flex items-center gap-3">
                      {step.itemCount !== undefined && (
                        <span className="text-slate-500">
                          {step.itemCount} items
                        </span>
                      )}
                      <span
                        className={
                          step.status === "success"
                            ? "text-emerald-400"
                            : "text-red-400"
                        }
                      >
                        {step.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
