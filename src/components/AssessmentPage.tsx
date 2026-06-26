import React, { useState, useEffect } from "react";
import { User, Assessment } from "../types";
import { ClipboardList, Sparkles, AlertCircle, ArrowLeft, ArrowRight, ShieldAlert, CheckCircle } from "lucide-react";

interface AssessmentPageProps {
  user: User;
  assessment: Assessment | null;
  onAssessmentCompleted: (assessment: Assessment) => void;
}

interface Question {
  id: string;
  category: "aptitude" | "interests" | "personality";
  text: string;
  options: { label: string; value: string }[];
}

// Fixed comprehensive set of adaptive questionnaire questions
const QUESTIONS: Question[] = [
  // Aptitude
  {
    id: "apt_1",
    category: "aptitude",
    text: "Q1: If a system needs to communicate securely globally, which design pattern blocks client-side API exposure?",
    options: [
      { label: "Client-side state synchronization (localStorage)", value: "incorrect_1" },
      { label: "Server-side routing proxy utilizing dotenv configurations", value: "correct" },
      { label: "Standard client-side AJAX requests with encoded key strings", value: "incorrect_2" },
      { label: "Integrating third party static embeds on our index.html", value: "incorrect_3" },
    ],
  },
  {
    id: "apt_2",
    category: "aptitude",
    text: "Q2: Calculate structural time: If a 12-week roadmap mandates 8 hours of learning weekly, what is the total hours required?",
    options: [
      { label: "84 hours", value: "incorrect_1" },
      { label: "96 hours", value: "correct" },
      { label: "120 hours", value: "incorrect_2" },
      { label: "72 hours", value: "incorrect_3" },
    ],
  },
  {
    id: "apt_3",
    category: "aptitude",
    text: "Q3: Complete the logic: Node is to JavaScript as Drizzle is to...",
    options: [
      { label: "MongoDB", value: "incorrect_1" },
      { label: "SQL/PostgreSQL Database ORM", value: "correct" },
      { label: "Vite Asset Bundler", value: "incorrect_2" },
      { label: "HTML Templates", value: "incorrect_3" },
    ],
  },
  {
    id: "apt_4",
    category: "aptitude",
    text: "Q4: If process.env.NODE_ENV is set to production, how does a standard modular server serve static files?",
    options: [
      { label: "Vite Hot Module Replacement (HMR) websocket handles it dynamically", value: "incorrect_1" },
      { label: "Express server serves compiled index.html from dist directory", value: "correct" },
      { label: "Client bundle executes live compile server-side", value: "incorrect_2" },
      { label: "Requires an external secondary container routing logic on port 4000", value: "incorrect_3" },
    ],
  },
  // Interests (Holland Occupational Codes seed)
  {
    id: "int_1",
    category: "interests",
    text: "Which of these tasks makes you lose track of time?",
    options: [
      { label: "Drafting layout designs or sketching animation frames (Creative)", value: "A" },
      { label: "Auditing database schemas and optimizing SQL latency (Analytical)", value: "B" },
      { label: "Mentoring junior engineers or coordinating client deliverables (Social)", value: "C" },
      { label: "Writing raw logic algorithms or packaging reusable NPM utilities (Technical)", value: "D" },
      { label: "Spearheading business acquisitions and launching software start-ups (Managerial)", value: "E" },
    ],
  },
  {
    id: "int_2",
    category: "interests",
    text: "How do you prefer to solve standard operational backlogs?",
    options: [
      { label: "Proposing a completely unique aesthetic or wireframe shift", value: "A" },
      { label: "Running meticulous benchmarks to discover the exact bottleneck", value: "B" },
      { label: "Syncing with the group to ensure roles are delegated properly", value: "C" },
      { label: "Developing automated custom scripts to clear errors automatically", value: "D" },
      { label: "Analyzing industry statistics and rewriting standard parameters", value: "E" },
    ],
  },
  {
    id: "int_3",
    category: "interests",
    text: "Which career resource topic sounds most compelling to read about?",
    options: [
      { label: "Aesthetic Design Patterns and Typography pair choices", value: "A" },
      { label: "Security auditing and column-encryption standards for PII safety", value: "B" },
      { label: "Interactive workshop facilitation and empathetic communication", value: "C" },
      { label: "LangGraph-based state machine architecture and LLM agents parameters", value: "D" },
      { label: "Strategic fundraising matrices and scale scaling configurations", value: "E" },
    ],
  },
  // Personality
  {
    id: "per_1",
    category: "personality",
    text: "In a hectic team environment, I tend to structure my tasks:",
    options: [
      { label: "Spontaneously, adapting quickly to aesthetic inspirations", value: "A" },
      { label: "Strictly systematically, working through a structured kanban queue", value: "B" },
      { label: "Empathetically, aligning my deliverables to help other colleagues", value: "C" },
      { label: "Technologically, optimizing my code workspace for maximal pipeline speed", value: "D" },
    ],
  },
  {
    id: "per_2",
    category: "personality",
    text: "When an unfamiliar system error suddenly halts your deployment script, you immediately:",
    options: [
      { label: "Search StackOverflow and brainstorm non-standard visual fixes", value: "A" },
      { label: "Trace the logs step-by-step from the initial entry point", value: "B" },
      { label: "Ping the lead DevOps engineer to establish a collaborative diagnostic session", value: "C" },
      { label: "Audit the dependency versions in our package-lock.json directly", value: "D" },
    ],
  },
  {
    id: "per_3",
    category: "personality",
    text: "Which of these best describes your ultimate ideal professional environment?",
    options: [
      { label: "A futuristic studio offering creative license and layout experimentation", value: "A" },
      { label: "A stable, highly rigorous firm with strict standard operating protocols", value: "B" },
      { label: "An open collaborative tech-hub focused on positive global impact", value: "C" },
      { label: "A fast-paced core platform scaling advanced computer integrations", value: "D" },
    ],
  },
];

export default function AssessmentPage({ user, assessment, onAssessmentCompleted }: AssessmentPageProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<{ [qId: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Sync existing answers if user already undertook partial assessment
  useEffect(() => {
    if (assessment && assessment.completed) {
      setAnswers(assessment.answers || {});
    }
  }, [assessment]);

  const currentQuestion = QUESTIONS[currentIdx];

  const handleSelectOption = (value: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: value });
  };

  const handleNext = () => {
    if (!answers[currentQuestion.id]) {
      setErrorMsg("Please select an answer to progress");
      return;
    }
    setErrorMsg("");
    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    setErrorMsg("");
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSubmit = async () => {
    if (!answers[currentQuestion.id]) {
      setErrorMsg("Please select an answer for this final question");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/assessment/${user.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "Assessment Agent returned a faulty status");
      }

      const updatedAssessment = await res.json();
      onAssessmentCompleted(updatedAssessment);
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong submitting answers");
    } finally {
      setSubmitting(false);
    }
  };

  const currentSelection = answers[currentQuestion?.id] || "";

  // If already completed, show results dashboard
  if (assessment && assessment.completed) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight font-sans">Assessment Metrics</h1>
            <p className="text-xs text-gray-500">
              Evaluated in real-time by our Adaptive Assessment Agent (A-002) and scored using LLM parameters.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-100/50 text-indigo-800 text-xs font-semibold">
            <ClipboardList className="w-4 h-4 text-indigo-600" /> A-002 Active
          </span>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-150 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5 gap-4">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider font-mono">
                Your Career Archetype
              </span>
              <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight mt-1">
                {assessment.personalityType}
              </h2>
            </div>
            <div className="flex gap-4">
              <div className="text-center p-3.5 bg-slate-50 border border-gray-100 rounded-xl min-w-[100px]">
                <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                  Aptitude Score
                </span>
                <span className="block text-2xl font-extrabold text-indigo-600">
                  {assessment.aptitudeScore}%
                </span>
              </div>
              <div className="text-center p-3.5 bg-slate-50 border border-gray-100 rounded-xl min-w-[100px]">
                <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                  General Index
                </span>
                <span className="block text-2xl font-extrabold text-slate-800">
                  {assessment.score}%
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.1">
              <Sparkles className="w-4 h-4 text-indigo-500" /> Professional Environment Analysis
            </h3>
            <div className="text-xs text-gray-650 leading-relaxed space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p>{assessment.analysisText}</p>
            </div>
          </div>

          {/* Interests Breakdown Meters */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Adaptive Preference Matrix</h3>
            <div className="space-y-3">
              {assessment.interestsScore && Object.entries(assessment.interestsScore).map(([field, score]) => (
                <div key={field} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-gray-700 capitalize">
                    <span>{field} Potential</span>
                    <span>{score}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${score}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-8 border-t border-gray-100">
            <button
              onClick={async () => {
                if (window.confirm("Retake the assessment? Previous scores will be archived temporarily on server.")) {
                  setAnswers({});
                  setCurrentIdx(0);
                  try {
                    const res = await fetch(`/api/assessment/${user.id}/reset`, { method: "POST" });
                    if (res.ok) {
                      const nextAss = await res.json();
                      onAssessmentCompleted(nextAss);
                    } else {
                      const nextAss = { ...assessment, completed: false };
                      onAssessmentCompleted(nextAss);
                    }
                  } catch (e) {
                    const nextAss = { ...assessment, completed: false };
                    onAssessmentCompleted(nextAss);
                  }
                }
              }}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
            >
              Reset Assessment
            </button>
            <button
              onClick={() => onAssessmentCompleted(assessment)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs cursor-pointer flex items-center shadow-sm"
            >
              Examine Recommendations <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active exam render
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight font-sans">Adaptive Exam Terminal</h1>
          <p className="text-xs text-gray-500">
            Evaluating logic, critical design capabilities, and core personality tendencies.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-100/50 text-indigo-800 text-xs font-semibold">
          <ClipboardList className="w-4 h-4 text-indigo-600" /> Question {currentIdx + 1} of {QUESTIONS.length}
        </span>
      </div>

      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
        <div 
          className="bg-indigo-600 h-full transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / QUESTIONS.length) * 100}%` }}
        />
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex items-center">
          <AlertCircle className="w-4 h-4 mr-1.5 flex-shrink-0" /> {errorMsg}
        </div>
      )}

      {/* Dynamic Question Container */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-150 shadow-sm space-y-6">
        <div>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wider font-mono mb-3">
            Category: {currentQuestion.category}
          </span>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
            {currentQuestion.text}
          </h2>
        </div>

        <div className="space-y-2.5">
          {currentQuestion.options.map((opt, oIdx) => (
            <button
              key={`${oIdx}-${opt.value}`}
              type="button"
              onClick={() => handleSelectOption(opt.value)}
              className={`w-full text-left px-4 py-3.5 border rounded-xl text-xs sm:text-sm font-medium transition-colors flex items-center justify-between cursor-pointer ${
                currentSelection === opt.value
                  ? "bg-indigo-50/70 border-indigo-500 text-indigo-950 font-semibold"
                  : "border-gray-200 text-gray-700 hover:bg-slate-50"
              }`}
            >
              <span>{opt.label}</span>
              {currentSelection === opt.value && (
                <CheckCircle className="w-4 h-4 text-indigo-600" />
              )}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-gray-100">
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="px-4 py-2 border border-gray-250 text-gray-600 hover:text-gray-900 hover:bg-slate-50 disabled:opacity-30 rounded-lg text-xs cursor-pointer flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </button>

          {currentIdx === QUESTIONS.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting || !currentSelection}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-sm disabled:opacity-50"
            >
              {submitting ? "Analyzing Answers..." : "Submit Portfolio"}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!currentSelection}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs cursor-pointer flex items-center disabled:opacity-50"
            >
              Continue <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
