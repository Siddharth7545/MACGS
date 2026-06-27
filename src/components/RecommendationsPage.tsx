import React, { useState, useEffect } from "react";
import { User, CareerRecommendation, Assessment } from "../types";
import { Compass, Sparkles, AlertTriangle, ArrowRight, Check, RefreshCw, BarChart2, DollarSign } from "lucide-react";

interface RecommendationsPageProps {
  user: User;
  assessment: Assessment | null;
  recommendations: CareerRecommendation[];
  onSetRecommendations: (recs: CareerRecommendation[]) => void;
  onSetTargetTrack: (roleName: string, missingSkills: string[]) => void;
  activeRoleTrack: string | null;
  onNavigateToAssessment?: () => void;
}

export default function RecommendationsPage({
  user,
  assessment,
  recommendations,
  onSetRecommendations,
  onSetTargetTrack,
  activeRoleTrack,
  onNavigateToAssessment
}: RecommendationsPageProps) {
  const [loading, setLoading] = useState(false);
  const [initiateLoading, setInitiateLoading] = useState<string | null>(null);
  const [selectedRec, setSelectedRec] = useState<CareerRecommendation | null>(null);

  // Auto-fetch standard recommendations on build if none exist
  useEffect(() => {
    if (recommendations.length === 0) {
      triggerCompileRecommendations();
    }
  }, []);

  const triggerCompileRecommendations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/agent/recommendations/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      onSetRecommendations(data.recommendations || []);
    } catch (err) {
      console.error("Failed recommendations compiling", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTrack = async (rec: CareerRecommendation) => {
    setInitiateLoading(rec.role);
    try {
      // Trigger Learning Roadmap Agent on backend which yields milestones
      const res = await fetch(`/api/agent/roadmap/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: rec.role, missingSkills: rec.missingSkills }),
      });
      const roadmapData = await res.json();
      
      // Sync on profile as target role too
      await fetch(`/api/profile/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole: rec.role }),
      });

      onSetTargetTrack(rec.role, rec.missingSkills);
    } catch (err) {
      console.error("Failed to compile learning roadmap for this track", err);
    } finally {
      setInitiateLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight font-sans">AI Career Path Recommendations</h1>
          <p className="text-xs text-gray-500">
            Assessed by Recommendation Agent (A-003) and filtered against live career databases.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={triggerCompileRecommendations}
            disabled={loading}
            className="px-3.5 py-1.5 border border-gray-250 hover:bg-slate-50 text-gray-700 bg-white shadow-sm rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Regenerate Suggestions
          </button>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-100/50 text-indigo-800 text-xs font-semibold">
            <Compass className="w-4 h-4 text-indigo-600" /> A-003 Active
          </span>
        </div>
      </div>

      {!assessment?.completed && (
        <div className="p-4 bg-amber-50 border border-amber-100 text-amber-900 text-xs rounded-xl flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <span className="font-bold block">Assessment pending.</span>
            Our recommendations currently utilize baseline profile matching. To gain highly precise, adaptive psychometric profiling, we strongly recommend taking the <button onClick={() => { if (onNavigateToAssessment) onNavigateToAssessment(); }} className="underline font-bold hover:text-amber-700 cursor-pointer">Adaptive Assessment questionnaire</button>!
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-400 font-medium font-sans">Deliberating recommendation graphs across 5,000 occupational coordinates...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Recommendations List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendations.map((rec) => {
                const isSelected = selectedRec?.role === rec.role;
                const isActiveTrack = activeRoleTrack === rec.role;
                return (
                  <div
                    key={rec.role}
                    onClick={() => setSelectedRec(rec)}
                    className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-md relative overflow-hidden flex flex-col justify-between ${
                      isSelected 
                        ? "border-indigo-500 ring-2 ring-indigo-500/10" 
                        : "border-gray-150"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-1 mb-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-800 uppercase tracking-wide">
                          Match: {rec.matchPercentage}%
                        </span>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold font-mono ${
                          rec.demandLevel === "High" ? "bg-emerald-50 text-emerald-800" : "bg-blue-50 text-blue-800"
                        }`}>
                          {rec.demandLevel} Demand
                        </span>
                      </div>
                      <h3 className="font-extrabold text-slate-950 text-sm tracking-tight">{rec.role}</h3>
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-3 leading-normal">{rec.justification}</p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 mt-4 flex justify-end items-center text-[11px]">
                      {isActiveTrack ? (
                        <span className="text-emerald-600 font-bold flex items-center">
                          <Check className="w-4.5 h-4.5 mr-0.5" /> Target Role
                        </span>
                      ) : (
                        <span className="text-gray-400 group-hover:text-amber-500 font-medium">Examine Gaps</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Gaps & Learning Agent Trigger */}
          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex flex-col justify-between">
            {selectedRec ? (
              <div className="space-y-5">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono">Specialized Audit</span>
                  <h3 className="text-md font-bold text-gray-900 tracking-tight mt-1">{selectedRec.role}</h3>
                  <div className="flex items-center justify-between text-xs mt-3 bg-slate-50 p-2.5 rounded-lg">
                    <span className="text-gray-500 font-medium flex items-center">
                      <BarChart2 className="w-4 h-4 text-gray-400 mr-1" /> Match Score:
                    </span>
                    <b className="text-slate-800 font-bold">{selectedRec.matchPercentage}%</b>
                  </div>
                </div>

                {/* Match justification */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-gray-800 tracking-wider uppercase">Alignment Justification:</h4>
                  <p className="text-xs text-gray-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-150">{selectedRec.justification}</p>
                </div>

                {/* Competency Gap checklists */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-bold text-orange-800 tracking-wider uppercase">Skills Gap Analyzed:</h4>
                  
                  {/* Matched */}
                  <div>
                    <span className="text-[10px] font-semibold text-emerald-700 block mb-1">✓ Matched Competencies:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedRec.matchedSkills.length === 0 ? (
                        <span className="text-[10px] text-gray-400 italic">None listed in profile</span>
                      ) : (
                        selectedRec.matchedSkills.map((s) => (
                          <span key={s} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded font-semibold text-[10px]">{s}</span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Missing */}
                  <div>
                    <span className="text-[10px] font-semibold text-rose-700 block mb-1">✗ Missing Gaps Required:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedRec.missingSkills.map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-rose-50 text-rose-800 rounded font-semibold text-[10px]">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Learning roadmap activator */}
                <div className="pt-2">
                  <button
                    onClick={() => handleSelectTrack(selectedRec)}
                    disabled={initiateLoading !== null}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-xs cursor-pointer flex items-center justify-center shadow-sm cursor-pointer"
                  >
                    {initiateLoading === selectedRec.role ? (
                      "Synthesizing 12-Week Roadmap..."
                    ) : (
                      <>
                        Activate Career Roadmap <ArrowRight className="w-4 h-4 ml-1.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center space-y-3 flex-1 flex flex-col justify-center items-center">
                <Compass className="w-12 h-12 text-slate-300 animate-spin" />
                <p className="text-xs text-gray-410 leading-normal max-w-[200px]">
                  Select one of the AI recommended pathways above to inspect its granular skill gaps.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
