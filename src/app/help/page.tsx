"use client";

import { useState } from "react";
import AIAssistant from "@/components/AIAssistant";
import {
  HelpCircle,
  Search,
  MapPin,
  Brain,
  Calculator,
  Database,
  Crosshair,
  Shield,
  Bookmark,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
  Lightbulb,
  DollarSign,
  FileText,
  Users,
  Zap,
} from "lucide-react";

/* ─── FAQ Data ───────────────────────────────────────────────── */
const FAQ_SECTIONS = [
  {
    title: "Getting Started",
    icon: Lightbulb,
    questions: [
      {
        q: "What is LandScout?",
        a: "LandScout is an AI-powered real estate intelligence platform that aggregates sheriff sales, tax deed auctions, foreclosures, tax lien sales, and surplus land listings from across all 50 states. We use AI to score every deal so you can find affordable land before anyone else.",
      },
      {
        q: "Who is LandScout for?",
        a: "Everyone from first-time land buyers with zero experience to seasoned investors. Our tools are designed to be approachable for beginners (with built-in education and AI guidance) while offering the depth and data that experts need.",
      },
      {
        q: "How do I get started?",
        a: "After signing up, you'll see a quick onboarding walkthrough. Start by browsing properties on the Dashboard, use the Map to explore geographically, or set up search filters on the Properties page. The AI Assistant (sparkle icon, bottom right) can help guide you at any time.",
      },
      {
        q: "Is there a free plan?",
        a: "Yes! The Scout plan is free forever. It includes browsing all 50 states, basic filters, AI scores, 5 saved properties, and the NACA calculator. Upgrade to Pro ($29/mo) for unlimited saves, full AI assistant, alerts, and due diligence reports.",
      },
    ],
  },
  {
    title: "Properties & Search",
    icon: Search,
    questions: [
      {
        q: "What types of properties are listed?",
        a: "We track four main types: Sheriff Sales (court-ordered), Tax Deed Sales (sold for unpaid taxes), Foreclosures (lender-initiated), and Direct Listings (from landowners/platforms). Each type is color-coded on the map.",
      },
      {
        q: "What do the AI scores mean?",
        a: "Every property gets a score from 0-100 based on: value gap (how much below market), location quality, utility access, zoning flexibility, flood risk, and comparable sales. Scores 85+ are 'Excellent', 70-84 are 'Good', below 70 need caution.",
      },
      {
        q: "How often is data updated?",
        a: "Our scrapers run daily across county auction sites, real estate platforms, and government portals. New listings appear within 24 hours of being posted on their source platform.",
      },
      {
        q: "Can I filter by specific criteria?",
        a: "Yes. Filter by state, price range, acreage, auction type, AI score, RV-friendliness, mobile home zoning, and flood zone status. Filters are available on the Properties page.",
      },
    ],
  },
  {
    title: "Tax Liens & Tax Deeds",
    icon: FileText,
    questions: [
      {
        q: "What's the difference between a tax lien and a tax deed?",
        a: "Tax Lien: You buy the lien (the debt), not the property. The owner pays you back with interest (8-36% depending on state). If they don't pay, you can eventually foreclose. Tax Deed: The county sells the actual property to recover unpaid taxes. You get the deed directly. Tax deeds are more straightforward but usually more competitive.",
      },
      {
        q: "Which states are tax lien states vs tax deed states?",
        a: "Tax Lien states include: AZ, FL (hybrid), IL, IN, IA, KY, MD, MS, MO, MT, NE, NJ, ND, OH, OK, SC, SD, VT, WV, WY. Tax Deed states include: AR, CA, CO, CT, DE, FL (hybrid), GA, HI, ID, KS, ME, MA, MI, MN, NV, NH, NM, NY, NC, OR, PA, RI, TN, TX, UT, VA, WA. Some states are hybrid (like FL).",
      },
      {
        q: "How do I find upcoming tax sales?",
        a: "Use the Tax Liens page to browse upcoming auction dates by state and county. We aggregate sale calendars from county tax collector websites and provide direct links to the source.",
      },
      {
        q: "What are the risks of buying tax liens?",
        a: "Main risks: property may have environmental issues, other liens (IRS, municipal), or be in poor condition. The redemption period means the owner can pay off the lien and you get your investment back with interest but don't get the property. Always do due diligence.",
      },
    ],
  },
  {
    title: "Map & Canvas",
    icon: MapPin,
    questions: [
      {
        q: "Why don't I see markers on the map?",
        a: "Make sure you're zoomed in enough. At the country level, markers may overlap. Use the state filter dropdown to focus on a specific state. Markers are color-coded: red (sheriff sale), gold (tax deed), orange (tax lien), purple (foreclosure), green (listing).",
      },
      {
        q: "What is Canvas mode?",
        a: "Canvas is our GPS-powered door-knocking tool. It uses your device's location to find nearby parcels, then runs a skip trace to reveal owner details — name, mailing address, tax history, equity estimates, and more. Built for 'driving for dollars' and field research.",
      },
      {
        q: "Does Canvas work on mobile?",
        a: "Yes. Canvas is mobile-optimized. Open it on your phone's browser, enable GPS, and it will show parcels around your current location. You can switch between dark and satellite map views.",
      },
    ],
  },
  {
    title: "AI Assistant",
    icon: Brain,
    questions: [
      {
        q: "What can the AI assistant do?",
        a: "The AI reads all your current app data — properties you're viewing, filters you've set, calculator inputs, and selected properties — and gives personalized advice. Ask it things like: 'What's the best deal in Florida under $5,000?', 'Is this property worth bidding on?', or 'Explain tax deed investing to me.'",
      },
      {
        q: "Is the AI assistant available on every page?",
        a: "Yes. The sparkle icon in the bottom-right corner is available on every page. The AI automatically gets context from whatever page you're on.",
      },
    ],
  },
  {
    title: "NACA Calculator",
    icon: Calculator,
    questions: [
      {
        q: "What is NACA?",
        a: "NACA (Neighborhood Assistance Corporation of America) offers a mortgage program with no down payment, no closing costs, no PMI, and below-market interest rates. It's one of the best programs for first-time buyers.",
      },
      {
        q: "How does the calculator work?",
        a: "Enter your annual income, monthly debt, expected interest rate, and loan term. The calculator shows your max loan amount, DTI ratios, and whether you qualify under NACA's guidelines (max 31% front-end DTI, 43% back-end DTI).",
      },
    ],
  },
  {
    title: "Account & Security",
    icon: Shield,
    questions: [
      {
        q: "Is my data secure?",
        a: "Passwords are bcrypt-hashed with 12 rounds. Sessions use encrypted JWT tokens with 30-day expiry. Your saved properties, searches, and personal data are private and only accessible when logged in.",
      },
      {
        q: "Can I change my plan?",
        a: "Yes. You can upgrade or downgrade anytime from your account settings. Upgrades take effect immediately. Downgrades take effect at the end of your current billing period.",
      },
    ],
  },
];

/* ─── Glossary ───────────────────────────────────────────────── */
const GLOSSARY = [
  { term: "Tax Deed", def: "A legal document granting ownership of a property to a government body when the owner fails to pay taxes. The government then sells the property." },
  { term: "Tax Lien", def: "A legal claim on a property due to unpaid taxes. Investors can purchase the lien and earn interest when the owner pays it off." },
  { term: "Sheriff Sale", def: "A court-ordered auction of property to satisfy a judgment, mortgage default, or tax delinquency." },
  { term: "Foreclosure", def: "The process by which a lender takes possession of a property when the borrower fails to make mortgage payments." },
  { term: "Opening Bid", def: "The minimum starting bid at an auction, usually set by the county or court." },
  { term: "Redemption Period", def: "The timeframe after a tax sale during which the original owner can reclaim their property by paying the debt plus interest." },
  { term: "Due Diligence", def: "The research and investigation performed before purchasing a property — checking title, liens, zoning, flood zones, and condition." },
  { term: "Parcel ID", def: "A unique number assigned by the county to identify a specific piece of land." },
  { term: "Assessed Value", def: "The value assigned to a property by the county tax assessor for property tax purposes. Often lower than market value." },
  { term: "Estimated Market Value", def: "The approximate price a property would sell for on the open market, calculated using comparable sales and algorithms." },
  { term: "Equity", def: "The difference between a property's market value and what is owed on it (mortgages, liens, taxes)." },
  { term: "Zoning", def: "Local regulations that control how land can be used — residential, agricultural, commercial, industrial, etc." },
  { term: "Flood Zone", def: "FEMA-designated areas with different levels of flood risk. Zone X is minimal risk. Zones A and V are high risk." },
  { term: "Absentee Owner", def: "A property owner whose mailing address differs from the property address, suggesting they don't live there." },
  { term: "DTI (Debt-to-Income)", def: "The percentage of your gross monthly income that goes toward debt payments. Used by lenders to determine affordability." },
  { term: "NACA", def: "Neighborhood Assistance Corporation of America — a nonprofit offering mortgages with no down payment, no PMI, and below-market rates." },
  { term: "Skip Trace", def: "The process of finding a property owner's contact information (phone, email, mailing address) from public records." },
  { term: "Comparable Sales (Comps)", def: "Recent sales of similar properties in the same area, used to estimate a property's fair market value." },
  { term: "Driving for Dollars", def: "A real estate strategy where investors drive through neighborhoods looking for distressed or vacant properties to make offers on." },
];

/* ─── Main Page ──────────────────────────────────────────────── */
export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"faq" | "glossary" | "guides">("faq");

  const toggleFaq = (key: string) => {
    setOpenFaq(openFaq === key ? null : key);
  };

  const filteredFaq = FAQ_SECTIONS.map((section) => ({
    ...section,
    questions: section.questions.filter(
      (q) =>
        !searchTerm ||
        q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.a.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter((section) => section.questions.length > 0);

  const filteredGlossary = GLOSSARY.filter(
    (g) =>
      !searchTerm ||
      g.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.def.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-[900px] mx-auto">
      <AIAssistant appContext={{ currentPage: "help" }} />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3 mb-2">
            <HelpCircle size={24} className="text-blue-500" />
            Help & Documentation
          </h1>
          <p className="text-slate-500">
            Everything you need to know about LandScout
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          type="text"
          placeholder="Search help topics, glossary terms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-[rgba(30,41,59,0.8)] border border-blue-500/20 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-[rgba(30,41,59,0.5)] rounded-xl p-1">
        {(
          [
            { id: "faq", label: "FAQ", icon: HelpCircle },
            { id: "glossary", label: "Glossary", icon: BookOpen },
            { id: "guides", label: "Quick Guides", icon: Lightbulb },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all border-0 ${
                activeTab === tab.id
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* FAQ Tab */}
      {activeTab === "faq" && (
        <div className="space-y-6">
          {filteredFaq.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title}>
                <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-3">
                  <Icon size={16} className="text-blue-400" />
                  {section.title}
                </h2>
                <div className="space-y-2">
                  {section.questions.map((item) => {
                    const key = `${section.title}-${item.q}`;
                    const isOpen = openFaq === key;
                    return (
                      <div
                        key={key}
                        className="rounded-xl border border-blue-500/10 overflow-hidden"
                      >
                        <button
                          onClick={() => toggleFaq(key)}
                          className="w-full flex items-center justify-between p-4 bg-[rgba(15,23,42,0.6)] hover:bg-[rgba(15,23,42,0.8)] transition-colors cursor-pointer border-0 text-left"
                        >
                          <span className="text-sm font-medium text-slate-200 pr-4">
                            {item.q}
                          </span>
                          {isOpen ? (
                            <ChevronUp
                              size={16}
                              className="text-slate-500 shrink-0"
                            />
                          ) : (
                            <ChevronDown
                              size={16}
                              className="text-slate-500 shrink-0"
                            />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 bg-[rgba(15,23,42,0.4)]">
                            <p className="text-sm text-slate-400 leading-relaxed">
                              {item.a}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {filteredFaq.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <p className="text-sm">No results found for &ldquo;{searchTerm}&rdquo;</p>
            </div>
          )}
        </div>
      )}

      {/* Glossary Tab */}
      {activeTab === "glossary" && (
        <div className="space-y-2">
          {filteredGlossary.map((item) => (
            <div
              key={item.term}
              className="p-4 rounded-xl bg-[rgba(15,23,42,0.6)] border border-blue-500/10"
            >
              <div className="text-sm font-semibold text-blue-400 mb-1">
                {item.term}
              </div>
              <div className="text-sm text-slate-400 leading-relaxed">
                {item.def}
              </div>
            </div>
          ))}
          {filteredGlossary.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <p className="text-sm">No glossary matches for &ldquo;{searchTerm}&rdquo;</p>
            </div>
          )}
        </div>
      )}

      {/* Quick Guides Tab */}
      {activeTab === "guides" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              icon: DollarSign,
              title: "Buy Your First Tax Deed",
              steps: [
                "Create a free LandScout account",
                "Go to Properties and filter by 'Tax Deed'",
                "Sort by AI Score to find the best deals",
                "Click a property to view full details and risks",
                "Check the source link to view the official auction listing",
                "Register on the county auction site and place your bid",
                "If you win, follow the county's closing process",
              ],
              color: "emerald",
            },
            {
              icon: FileText,
              title: "Invest in Tax Liens",
              steps: [
                "Go to the Tax Liens page",
                "Browse upcoming tax lien sales by state",
                "Research interest rates (varies 8-36% by state)",
                "Register with the county's auction portal",
                "Bid on liens — lower interest = winning bid in most states",
                "Wait for the owner to redeem (you earn the interest)",
                "If not redeemed, begin the foreclosure process",
              ],
              color: "blue",
            },
            {
              icon: Crosshair,
              title: "Drive for Dollars with Canvas",
              steps: [
                "Open Canvas from the sidebar",
                "Enable GPS or search an address",
                "Set your scan radius (250m to 2km)",
                "Browse nearby parcels in the sidebar",
                "Click any parcel for full skip trace data",
                "Note owner details, equity, and tax status",
                "Reach out to owners via mail or phone",
              ],
              color: "purple",
            },
            {
              icon: Brain,
              title: "Use the AI Assistant",
              steps: [
                "Click the sparkle icon (bottom-right on any page)",
                "Ask about specific properties or general advice",
                "Try: 'What's the best deal under $5K in Texas?'",
                "Try: 'Explain the risks of this property'",
                "Try: 'Help me calculate if I can afford this'",
                "The AI sees your current filters and selected data",
                "Use quick prompts for common questions",
              ],
              color: "amber",
            },
            {
              icon: Users,
              title: "Set Up Alerts (Pro)",
              steps: [
                "Upgrade to the Pro plan",
                "Go to Properties and set your desired filters",
                "Click 'Save as Alert' (coming soon)",
                "Choose notification method: email or SMS",
                "Get notified instantly when matching properties appear",
                "Review and bid before the competition",
              ],
              color: "rose",
            },
            {
              icon: Zap,
              title: "Export Data (Enterprise)",
              steps: [
                "Upgrade to the Enterprise plan",
                "Access the Data Sources page",
                "Run scrapes across all connected providers",
                "Use the API endpoints for bulk data access",
                "Export to CSV or JSON for your CRM/spreadsheet",
                "Set up automated pipelines with Apify actors",
              ],
              color: "cyan",
            },
          ].map((guide) => {
            const Icon = guide.icon;
            const colorMap: Record<string, string> = {
              emerald: "text-emerald-400 bg-emerald-500/15 border-emerald-500/20",
              blue: "text-blue-400 bg-blue-500/15 border-blue-500/20",
              purple: "text-purple-400 bg-purple-500/15 border-purple-500/20",
              amber: "text-amber-400 bg-amber-500/15 border-amber-500/20",
              rose: "text-rose-400 bg-rose-500/15 border-rose-500/20",
              cyan: "text-cyan-400 bg-cyan-500/15 border-cyan-500/20",
            };
            const colors = (colorMap[guide.color] || colorMap.blue).split(" ");
            return (
              <div
                key={guide.title}
                className={`p-5 rounded-xl bg-[rgba(15,23,42,0.6)] border ${colors[2]}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl ${colors[1]} flex items-center justify-center`}
                  >
                    <Icon size={20} className={colors[0]} />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200">
                    {guide.title}
                  </h3>
                </div>
                <ol className="space-y-2">
                  {guide.steps.map((step, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-slate-400"
                    >
                      <span className="text-xs font-bold text-slate-600 mt-0.5 w-4 shrink-0">
                        {i + 1}.
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
