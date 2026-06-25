import React, { useState, useEffect } from "react";
import { User, JobMarketInsight } from "../types";
import { TrendingUp, RefreshCw, Sparkles, Building, Briefcase, Award, ArrowUpRight, ArrowRight } from "lucide-react";

interface JobMarketPageProps {
  user: User;
  activeRoleTrack: string | null;
}

export default function JobMarketPage({ user, activeRoleTrack }: JobMarketPageProps) {
  const [roleInput, setRoleInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<JobMarketInsight | null>(null);

  useEffect(() => {
    const defaultSearch = activeRoleTrack || user.profile?.targetRole || "Full-Stack Web Developer";
    setRoleInput(defaultSearch);
    fetchMarketStatus(defaultSearch);
  }, [activeRoleTrack]);

  const fetchMarketStatus = async (roleName: string) => {
    if (!roleName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/agent/job-market/${encodeURIComponent(roleName.trim())}`);
      const data = await res.json();
      setInsight(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuery = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMarketStatus(roleInput);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono">
            Demographic Metrics Analytics
          </span>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight font-sans">
            Job Market Intelligence
          </h1>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-100/50 text-indigo-800 text-xs font-semibold">
          <TrendingUp className="w-4 h-4 text-indigo-600" /> A-006 Active
        </span>
      </div>

      {/* Query Search Form */}
      <form onSubmit={handleQuery} className="bg-white p-4 rounded-2xl border border-gray-150 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search role statistics e.g. Cloud Engineer..."
            value={roleInput}
            onChange={(e) => setRoleInput(e.target.value)}
            className="w-full pl-3 pr-3 py-2 border border-gray-200 rounded-xl text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 bg-indigo-600 border border-indigo-700 font-semibold hover:bg-slate-800 hover:bg-indigo-700 text-white rounded-xl text-xs inline-flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
        >
          {loading ? "Querying database..." : "Evaluate Demographics"}
        </button>
      </form>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-400 font-medium font-sans">Querying active corporate databases and wage frameworks...</p>
        </div>
      ) : insight ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Wages and growth parameters */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-5">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono">Salary Scale Benchmarks (USD / Year)</span>
              <h3 className="text-base font-bold text-slate-950 tracking-tight">{insight.role}</h3>

              {/* Dynamic Percentages Wage graph bar charts */}
              <div className="space-y-4 pt-2">
                {/* 25th */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-gray-650">
                    <span>25th Percentile (Starting)</span>
                    <b className="text-slate-900">${insight.salaryPercentiles.p25.toLocaleString()}</b>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-400 rounded-full" style={{ width: "40%" }} />
                  </div>
                </div>

                {/* 50th */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-gray-650">
                    <span>50th Percentile (Median)</span>
                    <b className="text-slate-900">${insight.salaryPercentiles.p50.toLocaleString()}</b>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: "65%" }} />
                  </div>
                </div>

                {/* 75th */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-gray-650">
                    <span>75th Percentile (Experienced)</span>
                    <b className="text-slate-900">${insight.salaryPercentiles.p75.toLocaleString()}</b>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-800 rounded-full" style={{ width: "90%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Industrial Growth Vectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center gap-4">
                <span className="p-3 bg-indigo-50 rounded-xl text-indigo-650">
                  <TrendingUp className="w-6 h-6" />
                </span>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Hiring Vector</span>
                  <span className="text-sm font-extrabold text-slate-950 block mt-0.5">{insight.growthTrend}</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center gap-4">
                <span className="p-3 bg-indigo-50 rounded-xl text-indigo-650">
                  <Briefcase className="w-6 h-6" />
                </span>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Estimated General Demand</span>
                  <span className="text-sm font-extrabold text-slate-950 block mt-0.5">{insight.demandRate} Demand</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hiring Organizations & Hottest Stack */}
          <div className="space-y-6">
            {/* Organizations */}
            <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-100 pb-2">
                <Building className="w-4 h-4 text-emerald-600" /> Key Employers
              </h3>
              <ul className="divide-y divide-gray-100 text-xs">
                {insight.topCompanies.map((comp) => (
                  <li key={comp} className="py-2.5 flex items-center justify-between font-semibold text-gray-700">
                    <span>{comp}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-gray-400" />
                  </li>
                ))}
              </ul>
            </div>

            {/* Hottest Stacks */}
            <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-100 pb-2">
                <Award className="w-4 h-4 text-blue-600" /> Hottest Skills Asked
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {insight.hotSkills.map((s) => (
                  <span key={s} className="px-2.5 py-1 bg-amber-500/10 border border-amber-200/20 text-amber-800 font-semibold rounded text-[10px]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center text-slate-400 text-xs font-medium border border-dashed rounded-2xl">
          Enter a valid title and trigger calculations above to inspect workforce demographic coordinates.
        </div>
      )}
    </div>
  );
}
