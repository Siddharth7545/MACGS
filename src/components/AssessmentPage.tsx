import React, { useState, useEffect } from "react";
import { User, Assessment, Question } from "../types";
import { DEFAULT_QUESTIONS } from "../data/defaultQuestions";
import { ClipboardList, Sparkles, AlertCircle, ArrowLeft, ArrowRight, ShieldAlert, CheckCircle } from "lucide-react";

interface AssessmentPageProps {
  user: User;
  assessment: Assessment | null;
  onAssessmentCompleted: (assessment: Assessment) => void;
}

export default function AssessmentPage({ user, assessment, onAssessmentCompleted }: AssessmentPageProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<{ [qId: string]: string }>({});
  
  const QUESTIONS = assessment?.questions || DEFAULT_QUESTIONS;
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
              onClick={async (e) => {
                const btn = e.currentTarget;
                if (btn.innerText === "Reset Assessment") {
                  btn.innerText = "Click again to confirm reset";
                  setTimeout(() => {
                    if (btn) btn.innerText = "Reset Assessment";
                  }, 3000);
                  return;
                }
                
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
