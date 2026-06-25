import React, { useState } from "react";
import { User, UserType } from "../types";
import { ShieldCheck, ArrowRight, Sparkles, LogIn, UserPlus } from "lucide-react";

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<UserType>("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      setError("Please fill out all required fields");
      return;
    }

    setError("");
    setLoading(true);
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const payload = isLogin ? { email, password } : { name, email, password, userType };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      onAuthSuccess(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500 text-white shadow-md animate-pulse mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 font-sans">
          CAREER-MATE MACGS
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Multi-Agent Career Guidance System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl border border-gray-100 sm:px-10">
          <div className="flex justify-around mb-6 border-b border-gray-200 pb-3">
            <button
              onClick={() => {
                setIsLogin(true);
                setError("");
              }}
              className={`pb-2 text-sm font-medium transition-colors relative ${
                isLogin ? "text-amber-600 font-semibold" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Sign In
              {isLogin && <span className="absolute bottom-[-13px] left-0 right-0 h-1 bg-amber-500 rounded-full" />}
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError("");
              }}
              className={`pb-2 text-sm font-medium transition-colors relative ${
                !isLogin ? "text-amber-600 font-semibold" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Create Account
              {!isLogin && <span className="absolute bottom-[-13px] left-0 right-0 h-1 bg-amber-500 rounded-full" />}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-shadow"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-shadow"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-shadow"
              />
            </div>

            {/* User status will be selected post-login in the dynamic Profile Analyzer */}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors disabled:opacity-50 mt-6 cursor-pointer"
            >
              {loading ? (
                "Processing authentication..."
              ) : (
                <>
                  {isLogin ? (
                    <>
                      Sign In Now <LogIn className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Register & Initiate <UserPlus className="w-4 h-4 ml-2" />
                    </>
                  )}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-500 space-y-2">
            <div className="flex items-center justify-center text-amber-600 font-medium">
              <Sparkles className="w-3.5 h-3.5 mr-1" /> Multi-Agent Orchestration Enabled
            </div>
            <p>
              By accessing Career-Mate, autonomous software agents start synthesizing your data against active workforce taxonomies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
