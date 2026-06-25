import React, { useState, useEffect } from "react";
import { User, CompositeReport } from "../types";
import { Sparkles, Printer, ClipboardList, Layers, GraduationCap, Compass, Briefcase, Award } from "lucide-react";

interface OrchestratorReportProps {
  user: User;
}

export default function OrchestratorReport({ user }: OrchestratorReportProps) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<CompositeReport | null>(null);

  useEffect(() => {
    fetchCompiledReport();
  }, []);

  const fetchCompiledReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/agent/compile-report/${user.id}`);
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest font-mono">
            Guidance & Orchestration report compilation
          </span>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight font-sans">
            Career Guidance Report
          </h1>
        </div>
        <div className="flex gap-2">
          {report && (
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-slate-900 text-white font-semibold hover:bg-slate-850 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4" /> Print Document
            </button>
          )}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 border border-purple-100 text-purple-800 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-purple-600" /> A-008 Active
          </span>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center space-y-3 bg-white border rounded-2xl">
          <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-semibold">Orchestrator Agent compiling multi-agent outputs, scores, and roadmaps...</p>
        </div>
      ) : report ? (
        <div className="space-y-6">
          {/* Main Printable Document Certificate Box */}
          <div className="bg-white border-2 border-gray-150 p-6 sm:p-10 rounded-2xl shadow-sm relative overflow-hidden space-y-7 print-only">
            {/* Stamp decoration */}
            <div className="absolute top-0 right-0 p-8 flex flex-col items-center">
              <div className="border-4 border-emerald-500/30 text-emerald-600 rounded-full w-20 h-20 flex flex-col items-center justify-center font-bold tracking-widest text-[9px] font-mono transform rotate-12 bg-white/80 select-none">
                <span className="block leading-none">VERIFIED</span>
                <span className="block text-[7px] text-gray-450 mt-1">{report.systemCertificateId.split("-")[2]}</span>
              </div>
            </div>

            {/* Header description */}
            <div className="border-b-2 border-gray-100 pb-5">
              <h2 className="text-xl font-extrabold text-slate-950 font-sans tracking-tight">MULTI-AGENT CAREER GUIDANCE DOSSIER</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 text-xs text-gray-500 mt-3 gap-y-1">
                <div>Candidate Profile: <b className="text-slate-800">{report.userName}</b></div>
                <div>Synapse Token: <b className="text-slate-800 font-mono text-[10px]">{report.systemCertificateId}</b></div>
                <div>Account Classification: <b className="text-slate-800 capitalize">{report.userType}</b></div>
                <div>Compilation Date: <b className="text-slate-800">{new Date(report.compiledAt).toLocaleDateString()}</b></div>
              </div>
            </div>

            {/* Section 1: Psychometrics analysis */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
                <ClipboardList className="w-4 h-4 text-amber-500 shrink-0" /> I. Psychometrics & Aptitude Scorecard
              </h3>
              {report.assessmentResult ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-50/50 p-4 rounded-xl border">
                  <div className="md:col-span-2 space-y-2">
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest font-mono">Profile Archetype</span>
                    <h4 className="text-sm font-extrabold text-slate-900 leading-tight">{report.assessmentResult.personalityType}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed pr-2">{report.assessmentResult.analysisText}</p>
                  </div>
                  <div className="text-center sm:border-l border-gray-100 pl-2 self-center space-y-2">
                    <div>
                      <span className="block text-[8.5px] font-bold text-gray-400 uppercase tracking-widest">Logic Aptitude</span>
                      <span className="text-xl font-extrabold text-amber-600 block">{report.assessmentResult.aptitudeScore}%</span>
                    </div>
                    <div>
                      <span className="block text-[8.5px] font-bold text-gray-400 uppercase tracking-widest">General Score</span>
                      <span className="text-md font-extrabold text-slate-800 block">{report.assessmentResult.score}%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No psychometric answers logged or analyzed yet.</p>
              )}
            </div>

            {/* Section 2: Recommended Careers */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
                <Compass className="w-4 h-4 text-violet-600 shrink-0" /> II. Top Aligned Career Pathway
              </h3>
              {report.recommendedPaths && report.recommendedPaths.length > 0 ? (
                <div className="space-y-4">
                  {report.recommendedPaths.slice(0, 2).map((rec, idx) => (
                    <div key={rec.role} className="border border-gray-100 p-4 rounded-xl bg-violet-50/10 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-900">{idx + 1}. {rec.role}</span>
                        <span className="text-[10px] font-bold text-violet-700 bg-violet-50 px-2 rounded-full uppercase tracking-wide">
                          Match: {rec.matchPercentage}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{rec.justification}</p>
                      <div className="flex flex-wrap gap-1 pt-1.5">
                        <span className="text-[9px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">Matched: {rec.matchedSkills.slice(0, 3).join(", ")}</span>
                        <span className="text-[9px] font-semibold text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded">Gaps: {rec.missingSkills.slice(0, 3).join(", ")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">Career suggestions have not been queried or completed yet.</p>
              )}
            </div>

            {/* Section 3: Learning path metrics */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
                <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" /> III. 12-Week Roadmap Status
              </h3>
              {report.currentRoadmap ? (
                <div className="p-4 border rounded-xl bg-emerald-50/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider font-mono">Active Target Track</span>
                    <h4 className="text-xs font-bold text-slate-900">{report.currentRoadmap.role}</h4>
                    <span className="block text-[11px] text-gray-500">Duration: 12 detailed curricular modules</span>
                  </div>
                  <div className="flex sm:flex-col justify-between sm:justify-center items-center text-center sm:border-l border-gray-100 pl-4 shrink-0">
                    <div>
                      <span className="block text-[8.5px] font-bold text-gray-400 uppercase tracking-widest leading-none">Modules Done</span>
                      <span className="text-lg font-extrabold text-slate-900 mt-1 block">{report.currentRoadmap.progressPct}%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No targeted roadmap progress active or initiated.</p>
              )}
            </div>

            {/* Section 4: Interview assessments */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
                <Briefcase className="w-4 h-4 text-sky-600 shrink-0" /> IV. Interactive Mock Drill Metrics
              </h3>
              {report.interviewPerformance ? (
                <div className="p-4 border rounded-xl bg-sky-50/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <span className="text-[9px] font-bold text-sky-700 uppercase tracking-wider font-mono">Interactive Drills Topic</span>
                    <h4 className="text-xs font-bold text-slate-900">{report.interviewPerformance.role}</h4>
                    <span className="block text-[11px] text-gray-500">Evaluated Questions Count: {report.interviewPerformance.questionsCount}</span>
                  </div>
                  <div className="flex sm:flex-col justify-between sm:justify-center items-center text-center sm:border-l border-gray-100 pl-4 shrink-0">
                    <div>
                      <span className="block text-[8.5px] font-bold text-gray-400 uppercase tracking-widest leading-none font-sans">Average Score</span>
                      <span className="text-lg font-extrabold text-amber-600 mt-1 block">{report.interviewPerformance.averageScore}%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No mock interview practice drills submitted or graded yet.</p>
              )}
            </div>

            {/* Verification Footer block */}
            <div className="pt-6 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-450 uppercase tracking-wider font-semibold font-mono">
              <span>CAREERMATE MACGS INC</span>
              <span>VERIFICATION NODE: SECURE</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center text-slate-400 text-xs font-medium border border-dashed rounded-2xl">
          Complete individual processes (Assessment, Career pathways, Roadmaps) to compile report indices.
        </div>
      )}
    </div>
  );
}
