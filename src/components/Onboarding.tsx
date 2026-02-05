"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Search,
  MapPin,
  Crosshair,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Map,
} from "lucide-react";

const STORAGE_KEY = "landscout_onboarding_complete";

interface Step {
  icon: React.ReactNode;
  gradient: string;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: <Map className="w-16 h-16 text-white" />,
    gradient: "from-blue-600 to-purple-600",
    title: "Welcome to LandScout",
    description:
      "LandScout helps you discover affordable land opportunities at tax deed and surplus auctions across the country. We aggregate listings, score them with AI, and give you every tool you need to research, evaluate, and acquire properties \u2014 all in one place.",
  },
  {
    icon: <LayoutDashboard className="w-16 h-16 text-white" />,
    gradient: "from-cyan-600 to-blue-600",
    title: "Dashboard",
    description:
      "Your analytics command center. Track key performance indicators like total properties monitored, average AI scores, upcoming auction dates, and market trends. The dashboard gives you a real-time pulse on your pipeline so you never miss a high-value opportunity.",
  },
  {
    icon: <Search className="w-16 h-16 text-white" />,
    gradient: "from-violet-600 to-indigo-600",
    title: "Properties",
    description:
      "Browse and filter thousands of land parcels sourced from auctions nationwide. Each listing is enhanced with an AI-generated score that factors in location, market value, zoning, and comparable sales \u2014 so you can instantly spot the best deals and filter out the noise.",
  },
  {
    icon: <MapPin className="w-16 h-16 text-white" />,
    gradient: "from-emerald-600 to-teal-600",
    title: "Map View",
    description:
      "Visualize every property on an interactive map with color-coded markers based on AI score and auction status. Zoom into neighborhoods, toggle satellite imagery, and click any marker to pull up full property details without leaving the map.",
  },
  {
    icon: <Crosshair className="w-16 h-16 text-white" />,
    gradient: "from-orange-600 to-rose-600",
    title: "Canvas & Skip Trace",
    description:
      "Head into the field with our GPS-powered door-knocking tool. Canvas mode plots nearby property owners on your phone, provides turn-by-turn walking routes, and lets you log contact attempts on the spot. Skip trace integration pulls owner phone numbers and emails so you can follow up fast.",
  },
  {
    icon: <Sparkles className="w-16 h-16 text-white" />,
    gradient: "from-pink-600 to-purple-600",
    title: "AI Assistant",
    description:
      "Your personal research analyst. The AI chat assistant has full read access to every property, auction, and data point in the app. Ask it to compare parcels, summarize county regulations, estimate rehab costs, or help you craft an offer strategy \u2014 it\u2019s context-aware and always up to date.",
  },
];

export default function Onboarding() {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeState, setFadeState] = useState<"in" | "out">("in");

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      setVisible(true);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  const transitionTo = (nextStep: number) => {
    setFadeState("out");
    setTimeout(() => {
      setCurrentStep(nextStep);
      setFadeState("in");
    }, 200);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      transitionTo(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      transitionTo(currentStep - 1);
    }
  };

  if (!visible) return null;

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050a14]/90 backdrop-blur-sm">
      <button
        onClick={completeOnboarding}
        className="absolute top-6 right-6 p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors"
        aria-label="Close onboarding"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="relative w-full max-w-lg mx-4">
        <div
          className="transition-all duration-200 ease-in-out"
          style={{
            opacity: fadeState === "in" ? 1 : 0,
            transform: fadeState === "in" ? "translateY(0)" : "translateY(8px)",
          }}
        >
          <div className="rounded-2xl border border-white/10 bg-[#0a1628] shadow-2xl overflow-hidden">
            {/* Illustration area */}
            <div
              className={`flex items-center justify-center h-52 bg-gradient-to-br ${step.gradient}`}
            >
              <div className="flex items-center justify-center w-28 h-28 rounded-full bg-white/15 backdrop-blur-sm">
                {step.icon}
              </div>
            </div>

            {/* Content */}
            <div className="px-8 pt-6 pb-8">
              <h2 className="text-2xl font-bold text-white mb-3">
                {step.title}
              </h2>
              <p className="text-slate-300 leading-relaxed text-sm">
                {step.description}
              </p>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2 mt-6">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => transitionTo(index)}
                    className={`rounded-full transition-all duration-300 ${
                      index === currentStep
                        ? "w-8 h-2.5 bg-blue-500"
                        : "w-2.5 h-2.5 bg-slate-600 hover:bg-slate-500"
                    }`}
                    aria-label={`Go to step ${index + 1}`}
                  />
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between mt-6">
                <div>
                  {!isFirstStep && (
                    <button
                      onClick={handlePrevious}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {!isLastStep && (
                    <button
                      onClick={completeOnboarding}
                      className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      Skip
                    </button>
                  )}

                  {isLastStep ? (
                    <button
                      onClick={completeOnboarding}
                      className="flex items-center gap-1.5 px-6 py-2.5 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-600/25"
                    >
                      Get Started
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-1.5 px-6 py-2.5 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-600/25"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
