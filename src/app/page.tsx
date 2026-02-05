"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Map,
  Search,
  Brain,
  Shield,
  TrendingUp,
  Globe,
  Zap,
  Database,
  Calculator,
  Star,
  ChevronRight,
  MapPin,
  ArrowRight,
  Check,
  Play,
  BarChart3,
  Lock,
  Layers,
  Sparkles,
} from "lucide-react";

/* ---------- Animated counter hook ---------- */
function useCounter(target: number, duration = 2000) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const step = target / (duration / 16);
          const interval = setInterval(() => {
            start += step;
            if (start >= target) {
              setValue(target);
              clearInterval(interval);
            } else {
              setValue(Math.floor(start));
            }
          }, 16);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return { value, ref };
}

/* ---------- Main Landing Page ---------- */
export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false);

  const properties = useCounter(46000, 2000);
  const states = useCounter(50, 1500);
  const users = useCounter(2800, 1800);
  const saved = useCounter(1200000, 2500);

  return (
    <div className="min-h-screen bg-[#050a14] text-slate-200 overflow-x-hidden">
      {/* ========== NAVBAR ========== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[rgba(5,10,20,0.85)] backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-3 no-underline group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-[0_4px_20px_rgba(59,130,246,0.4)] group-hover:shadow-[0_4px_30px_rgba(59,130,246,0.6)] transition-all">
              <Map size={22} color="white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              LandScout
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors no-underline">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-slate-400 hover:text-white transition-colors no-underline">
              How It Works
            </a>
            <a href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors no-underline">
              Pricing
            </a>
            <Link
              href="/login"
              className="text-sm text-slate-300 hover:text-white transition-colors no-underline"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white text-sm font-semibold no-underline hover:shadow-[0_4px_25px_rgba(59,130,246,0.5)] transition-all"
            >
              Get Started Free
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-slate-400 bg-transparent border-0 cursor-pointer"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            <Layers size={24} />
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileMenu && (
          <div className="md:hidden bg-[rgba(5,10,20,0.95)] border-t border-white/5 px-6 py-4 space-y-3">
            <a href="#features" className="block text-sm text-slate-400 no-underline">Features</a>
            <a href="#how-it-works" className="block text-sm text-slate-400 no-underline">How It Works</a>
            <a href="#pricing" className="block text-sm text-slate-400 no-underline">Pricing</a>
            <Link href="/login" className="block text-sm text-slate-300 no-underline">Log In</Link>
            <Link href="/signup" className="block text-sm text-blue-400 font-semibold no-underline">Get Started Free</Link>
          </div>
        )}
      </nav>

      {/* ========== HERO ========== */}
      <section className="relative pt-32 pb-24 md:pt-44 md:pb-36 px-6">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-[500px] h-[500px] bg-purple-500/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
            <Sparkles size={14} />
            The Zillow for Off-Gridders
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 tracking-tight">
            Find Affordable Land
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Before Anyone Else
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            LandScout aggregates sheriff sales, tax deed auctions, foreclosures, and surplus land
            from every county in America — then uses AI to score each deal so you never overpay.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/signup"
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-semibold text-lg no-underline flex items-center gap-2 hover:shadow-[0_8px_40px_rgba(59,130,246,0.4)] transition-all"
            >
              Start Scouting Free
              <ArrowRight size={20} />
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 rounded-xl text-slate-300 font-medium text-lg no-underline flex items-center gap-2 border border-white/10 hover:bg-white/5 transition-all"
            >
              <Play size={18} />
              See How It Works
            </a>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div ref={properties.ref} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white font-mono">
                {properties.value.toLocaleString()}+
              </div>
              <div className="text-sm text-slate-500 mt-1">Properties Tracked</div>
            </div>
            <div ref={states.ref} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white font-mono">
                {states.value}
              </div>
              <div className="text-sm text-slate-500 mt-1">States Covered</div>
            </div>
            <div ref={users.ref} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white font-mono">
                {users.value.toLocaleString()}+
              </div>
              <div className="text-sm text-slate-500 mt-1">Active Scouts</div>
            </div>
            <div ref={saved.ref} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white font-mono">
                ${(saved.value / 1000000).toFixed(1)}M
              </div>
              <div className="text-sm text-slate-500 mt-1">Saved by Users</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== WHAT IS LANDSCOUT ========== */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What is LandScout?
          </h2>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Most people don&apos;t know that thousands of land parcels sell at government auctions
            for <strong className="text-white">pennies on the dollar</strong> every single week.
            Tax deed sales, sheriff auctions, and surplus property listings are scattered across
            hundreds of county websites with zero standardization. LandScout brings it all
            into one place, scores every parcel with AI, and tells you exactly what to bid.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-[rgba(15,23,42,0.9)] to-[rgba(15,23,42,0.4)] border border-blue-500/10 hover:border-blue-500/30 transition-all group">
            <div className="w-14 h-14 rounded-xl bg-blue-500/15 flex items-center justify-center mb-5 group-hover:bg-blue-500/25 transition-all">
              <Globe size={28} className="text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">Aggregate Everything</h3>
            <p className="text-slate-400 leading-relaxed">
              We scrape and normalize data from county auction sites, tax collectors,
              real estate platforms, and government surplus listings across all 50 states into one unified feed.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-br from-[rgba(15,23,42,0.9)] to-[rgba(15,23,42,0.4)] border border-purple-500/10 hover:border-purple-500/30 transition-all group">
            <div className="w-14 h-14 rounded-xl bg-purple-500/15 flex items-center justify-center mb-5 group-hover:bg-purple-500/25 transition-all">
              <Brain size={28} className="text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">AI-Powered Scoring</h3>
            <p className="text-slate-400 leading-relaxed">
              Every property gets an AI score (0–100) based on value gap, location quality,
              utility access, zoning flexibility, flood risk, and comparable sales. No guessing.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-br from-[rgba(15,23,42,0.9)] to-[rgba(15,23,42,0.4)] border border-emerald-500/10 hover:border-emerald-500/30 transition-all group">
            <div className="w-14 h-14 rounded-xl bg-emerald-500/15 flex items-center justify-center mb-5 group-hover:bg-emerald-500/25 transition-all">
              <TrendingUp size={28} className="text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">Buy Below Market</h3>
            <p className="text-slate-400 leading-relaxed">
              Our users find land at 40–80% below market value. Set alerts, get notified the
              moment a deal drops, and place confident bids with full AI-backed analysis.
            </p>
          </div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section id="features" className="py-24 px-6 border-t border-white/5 bg-[rgba(10,15,25,0.5)]">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to Scout Land
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            From discovery to due diligence to financing, LandScout has every tool in one platform.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: Search,
              title: "Smart Property Search",
              desc: "Filter by state, county, acreage, price, auction type, RV-friendliness, mobile home zones, and flood risk.",
              color: "blue",
            },
            {
              icon: MapPin,
              title: "Interactive Map",
              desc: "See every property on a live map with satellite imagery. Click to inspect parcel details, nearby amenities, and AI analysis.",
              color: "emerald",
            },
            {
              icon: Brain,
              title: "AI Deal Assistant",
              desc: "Ask our AI anything about any property. It reads all your data, understands your budget, and gives personalized recommendations.",
              color: "purple",
            },
            {
              icon: BarChart3,
              title: "Analytics Dashboard",
              desc: "Track portfolio value, market trends, state-by-state breakdowns, auction schedules, and top-scoring deals in real time.",
              color: "amber",
            },
            {
              icon: Calculator,
              title: "NACA Calculator",
              desc: "Calculate your NACA mortgage affordability instantly. See loan amounts, DTI ratios, and qualification thresholds.",
              color: "rose",
            },
            {
              icon: Database,
              title: "Multi-Source Data Engine",
              desc: "Powered by Firecrawl, RapidAPI, and Apify. Real auction data from Zillow, Realty Mole, Rentcast, LandWatch, and county portals.",
              color: "cyan",
            },
            {
              icon: Shield,
              title: "Due Diligence Toolkit",
              desc: "Flood zone data, utility access checks, comparable sales, tax history, and zoning verification — all in one view.",
              color: "emerald",
            },
            {
              icon: Zap,
              title: "Instant Alerts",
              desc: "Set custom search alerts. Get notified by email the second a property matching your criteria hits any auction platform.",
              color: "amber",
            },
            {
              icon: Lock,
              title: "Secure & Personal",
              desc: "Your saved properties, searches, and settings are encrypted and private. Only you can access your data.",
              color: "blue",
            },
          ].map((feature, i) => {
            const colorMap: Record<string, string> = {
              blue: "text-blue-400 bg-blue-500/15",
              emerald: "text-emerald-400 bg-emerald-500/15",
              purple: "text-purple-400 bg-purple-500/15",
              amber: "text-amber-400 bg-amber-500/15",
              rose: "text-rose-400 bg-rose-500/15",
              cyan: "text-cyan-400 bg-cyan-500/15",
            };
            const Icon = feature.icon;
            const [textColor, bgColor] = (
              colorMap[feature.color] || colorMap.blue
            ).split(" ");
            return (
              <div
                key={i}
                className="p-6 rounded-2xl bg-[rgba(15,23,42,0.6)] border border-white/5 hover:border-white/15 transition-all"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center mb-4`}
                >
                  <Icon size={24} className={textColor} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section id="how-it-works" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            From signup to closing a deal — three steps is all it takes.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Set Your Criteria",
              desc: "Tell us your budget, preferred states, acreage range, and what matters to you — RV access, well water, no HOA, whatever.",
              gradient: "from-blue-500 to-blue-600",
            },
            {
              step: "02",
              title: "AI Finds Your Deals",
              desc: "Our engine scans hundreds of auction platforms, county sites, and listing services every day. AI scores and ranks every match.",
              gradient: "from-purple-500 to-purple-600",
            },
            {
              step: "03",
              title: "Bid With Confidence",
              desc: "Review the full analysis — comps, tax history, flood risk, zoning — and place bids knowing exactly what the land is worth.",
              gradient: "from-emerald-500 to-emerald-600",
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div
                className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-2xl font-bold text-white shadow-lg`}
              >
                {item.step}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                {item.title}
              </h3>
              <p className="text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========== WHY IT EXISTS ========== */}
      <section className="py-24 px-6 border-t border-white/5 bg-[rgba(10,15,25,0.5)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
            Why LandScout Exists
          </h2>
          <div className="text-lg text-slate-400 leading-relaxed space-y-6 text-center max-w-3xl mx-auto">
            <p>
              The American dream of owning land is broken. Median home prices have surged past
              $400K. Institutional investors are buying up neighborhoods in cash.
              First-time buyers are priced out.
            </p>
            <p>
              But every week, <strong className="text-white">thousands of parcels</strong> sell
              at government tax auctions for <strong className="text-white">$500 to $15,000</strong>.
              Most people don&apos;t even know these sales exist. The information is buried in county
              websites, PDF lists, and obscure legal notices.
            </p>
            <p>
              <strong className="text-blue-400">LandScout changes that.</strong> We believe
              everyone deserves a shot at owning a piece of land — whether you&apos;re building
              a homestead, parking an RV, or investing for the future.
              We built the tool we wished existed.
            </p>
          </div>
        </div>
      </section>

      {/* ========== PRICING ========== */}
      <section id="pricing" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Start free, upgrade when you&apos;re ready. No hidden fees. Cancel anytime.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free */}
          <div className="p-8 rounded-2xl bg-[rgba(15,23,42,0.8)] border border-white/10 flex flex-col">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-300 mb-1">Scout</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-slate-500">/month</span>
              </div>
              <p className="text-sm text-slate-500 mt-2">Perfect for exploring</p>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {[
                "Browse all 50 states",
                "Basic property filters",
                "View AI scores",
                "5 saved properties",
                "NACA calculator",
                "Community support",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-400">
                  <Check size={16} className="text-slate-600 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="block text-center py-3 rounded-xl border border-white/15 text-slate-300 font-medium no-underline hover:bg-white/5 transition-all"
            >
              Get Started
            </Link>
          </div>

          {/* Pro */}
          <div className="p-8 rounded-2xl bg-gradient-to-b from-blue-500/10 to-purple-500/10 border border-blue-500/30 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-xs font-bold text-white">
              MOST POPULAR
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-blue-400 mb-1">Pro</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">$29</span>
                <span className="text-slate-500">/month</span>
              </div>
              <p className="text-sm text-slate-500 mt-2">For serious land buyers</p>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {[
                "Everything in Scout",
                "Unlimited saved properties",
                "Full AI assistant access",
                "Advanced filters & map",
                "Email & SMS alerts",
                "Comparable sales data",
                "Flood zone analysis",
                "Due diligence reports",
                "Priority support",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                  <Check size={16} className="text-blue-400 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/signup?plan=pro"
              className="block text-center py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold no-underline hover:shadow-[0_4px_25px_rgba(59,130,246,0.4)] transition-all"
            >
              Start 14-Day Free Trial
            </Link>
          </div>

          {/* Enterprise */}
          <div className="p-8 rounded-2xl bg-[rgba(15,23,42,0.8)] border border-white/10 flex flex-col">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-300 mb-1">Enterprise</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">$99</span>
                <span className="text-slate-500">/month</span>
              </div>
              <p className="text-sm text-slate-500 mt-2">For investors & teams</p>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {[
                "Everything in Pro",
                "API access",
                "Bulk data export (CSV/JSON)",
                "Priority scraping queue",
                "Custom alert rules",
                "Firecrawl + Apify access",
                "RapidAPI valuation engine",
                "Team collaboration",
                "Dedicated account manager",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-400">
                  <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/signup?plan=enterprise"
              className="block text-center py-3 rounded-xl border border-white/15 text-slate-300 font-medium no-underline hover:bg-white/5 transition-all"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* ========== DATA SOURCES TRUST BAR ========== */}
      <section className="py-16 px-6 border-t border-white/5 bg-[rgba(10,15,25,0.5)]">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm text-slate-500 uppercase tracking-widest mb-8">
            Powered by trusted data sources
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-4 text-slate-500">
            {[
              "Firecrawl",
              "RapidAPI",
              "Apify",
              "Zillow API",
              "Realty Mole",
              "Rentcast",
              "LandWatch",
              "Auction.com",
            ].map((name) => (
              <span
                key={name}
                className="text-sm font-mono font-medium opacity-50 hover:opacity-100 transition-opacity"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="py-24 px-6 border-t border-white/5 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Stop Overpaying for Land.
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Start Scouting Today.
            </span>
          </h2>
          <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
            Join thousands of smart buyers who find land at 40–80% below market using AI-powered auction intelligence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-semibold text-lg no-underline flex items-center gap-2 hover:shadow-[0_8px_40px_rgba(59,130,246,0.4)] transition-all"
            >
              Create Free Account
              <ChevronRight size={20} />
            </Link>
          </div>
          <p className="text-sm text-slate-600 mt-6">No credit card required. Free forever plan available.</p>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Map size={16} color="white" />
              </div>
              <span className="font-bold text-white">LandScout</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              The smartest way to find affordable land in America.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3">Product</h4>
            <ul className="space-y-2 list-none p-0">
              <li><a href="#features" className="text-sm text-slate-500 hover:text-slate-300 no-underline">Features</a></li>
              <li><a href="#pricing" className="text-sm text-slate-500 hover:text-slate-300 no-underline">Pricing</a></li>
              <li><a href="#how-it-works" className="text-sm text-slate-500 hover:text-slate-300 no-underline">How It Works</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3">Resources</h4>
            <ul className="space-y-2 list-none p-0">
              <li><span className="text-sm text-slate-500">Documentation</span></li>
              <li><span className="text-sm text-slate-500">API Reference</span></li>
              <li><span className="text-sm text-slate-500">Blog</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3">Legal</h4>
            <ul className="space-y-2 list-none p-0">
              <li><span className="text-sm text-slate-500">Privacy Policy</span></li>
              <li><span className="text-sm text-slate-500">Terms of Service</span></li>
              <li><span className="text-sm text-slate-500">Contact</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-white/5 text-center text-sm text-slate-600">
          &copy; {new Date().getFullYear()} LandScout by Liv8. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
