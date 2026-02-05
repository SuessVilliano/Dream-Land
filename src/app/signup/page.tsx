"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Map, Mail, Lock, User, Loader2, AlertCircle, Check } from "lucide-react";

const PLANS = [
  { id: "scout", name: "Scout", price: "Free", desc: "Basic access" },
  { id: "pro", name: "Pro", price: "$29/mo", desc: "Full AI + alerts" },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$99/mo",
    desc: "API + teams",
  },
];

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPlan = searchParams.get("plan") || "scout";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [plan, setPlan] = useState(preselectedPlan);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      name,
      email,
      password,
      action: "signup",
      plan,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#050a14] flex items-center justify-center px-6 py-12">
      {/* Background effects */}
      <div className="absolute top-20 right-1/3 w-[500px] h-[500px] bg-purple-500/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 left-1/3 w-[400px] h-[400px] bg-blue-500/6 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center justify-center gap-3 mb-10 no-underline"
        >
          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-[0_4px_20px_rgba(59,130,246,0.4)]">
            <Map size={22} color="white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            LandScout
          </span>
        </Link>

        {/* Card */}
        <div className="bg-[rgba(15,23,42,0.8)] border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Create Your Account
          </h1>
          <p className="text-slate-500 text-center text-sm mb-8">
            Start finding land deals in seconds
          </p>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-sm text-red-400">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Plan Selector */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Plan
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PLANS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlan(p.id)}
                    className={`p-3 rounded-xl border text-center cursor-pointer transition-all bg-transparent ${
                      plan === p.id
                        ? "border-blue-500/50 bg-blue-500/10"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div
                      className={`text-xs font-semibold mb-0.5 ${
                        plan === p.id ? "text-blue-400" : "text-slate-300"
                      }`}
                    >
                      {p.name}
                    </div>
                    <div className="text-[0.65rem] text-slate-500">
                      {p.price}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full py-3 pl-11 pr-4 bg-[rgba(30,41,59,0.8)] border border-white/10 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] placeholder:text-slate-600 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full py-3 pl-11 pr-4 bg-[rgba(30,41,59,0.8)] border border-white/10 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] placeholder:text-slate-600 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  className="w-full py-3 pl-11 pr-4 bg-[rgba(30,41,59,0.8)] border border-white/10 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] placeholder:text-slate-600 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold border-0 cursor-pointer flex items-center justify-center gap-2 hover:shadow-[0_4px_25px_rgba(59,130,246,0.4)] transition-all disabled:opacity-60"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-5 space-y-1">
            {[
              "Free forever plan with no credit card",
              "Upgrade or cancel anytime",
              "Your data is encrypted and private",
            ].map((note) => (
              <div
                key={note}
                className="flex items-center gap-2 text-xs text-slate-500"
              >
                <Check size={12} className="text-emerald-500 shrink-0" />
                {note}
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-400 no-underline hover:text-blue-300"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050a14]" />}>
      <SignupForm />
    </Suspense>
  );
}
