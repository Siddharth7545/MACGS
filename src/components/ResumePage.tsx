import React, { useState } from "react";
import { User } from "../types";
import { FileText, Sparkles, CheckCircle, AlertOctagon, HelpCircle, ArrowRight } from "lucide-react";

interface ResumePageProps {
  user: User;
}

export default function ResumePage({ user }: ResumePageProps) {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim() || !jobDescription.trim()) return;
    setLoading(true);
    setResult(null);

    const payload = { resumeText, jobDescription };

    try {
      const res = await fetch(`/api/agent/resume-optimize/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setResult(data.optimization);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono">
            Keyword Alignment Engine
          </span>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight font-sans">
            Resume Optimiser & Audit
          </h1>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-100/50 text-indigo-800 text-xs font-semibold">
          <FileText className="w-4 h-4 text-indigo-600" /> A-001 Sync Active
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Paste Fields */}
        <form onSubmit={handleAudit} className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Paste Resume Content (Education, Skills, Projects):
            </label>
            <textarea
              rows={6}
              placeholder="Paste your CV text content..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Paste Target Job Description:
            </label>
            <textarea
              rows={5}
              placeholder="Paste target job descriptions, list of competencies, or title expectations..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !resumeText.trim() || !jobDescription.trim()}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 font-bold text-white rounded-xl text-xs cursor-pointer focus:outline-none disabled:opacity-40"
          >
            {loading ? "Analyzing Keyword Densities..." : "Optimize Resume"}
          </button>
        </form>

        {/* Audit Report Result cards */}
        <div className="space-y-4 flex flex-col justify-between">
          {loading ? (
            <div className="py-24 text-center space-y-3 bg-white border rounded-2xl flex-1 flex flex-col justify-center items-center">
              <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400 font-medium font-sans">Cross-referencing terminology matrices via LLM...</p>
            </div>
          ) : result ? (
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-5 flex-1">
              {/* Compatibility Score */}
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider font-mono">Alignment Match Score</span>
                  <h3 className="text-sm font-bold text-slate-800">Job Compatibility Summary</h3>
                </div>
                <div className="text-center p-2 bg-slate-50 rounded-xl min-w-[70px]">
                  <span className="text-xl font-extrabold text-indigo-600">{result.compatibilityScore}%</span>
                </div>
              </div>

              {/* Keyword checklists */}
              <div className="space-y-3">
                {/* Matching */}
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 block mb-1">✓ Matching Keywords Found:</span>
                  <div className="flex flex-wrap gap-1">
                    {result.matchingKeywords.map((tag: string) => (
                      <span key={tag} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded font-semibold text-[10px]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing */}
                <div>
                  <span className="text-[10px] font-bold text-rose-700 block mb-1">✗ Missing Keywords Needed:</span>
                  <div className="flex flex-wrap gap-1">
                    {result.missingKeywords.map((tag: string) => (
                      <span key={tag} className="px-2 py-0.5 bg-rose-50 text-rose-800 rounded font-semibold text-[10px]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div className="space-y-3 pt-3 border-t border-gray-100">
                <span className="text-[10px] font-bold text-indigo-700 block uppercase tracking-wide flex items-center animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Actionable Recommendations:
                </span>
                <ul className="space-y-2 text-xs text-gray-650 leading-relaxed pl-1">
                  {result.suggestions.map((s: string, idx: number) => (
                    <li key={idx} className="flex gap-2.5 items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed rounded-2xl flex-1 flex flex-col justify-center items-center p-8 text-center space-y-3 text-gray-410 min-h-[300px]">
              <HelpCircle className="w-10 h-10 text-slate-300" />
              <p className="text-xs leading-normal max-w-[240px]">
                Enter your current resume text and target Job brief keywords above to audit.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
