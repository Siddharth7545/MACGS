import React, { useState, useEffect } from "react";
import { User, InterviewSession, InterviewQuestion } from "../types";
import { Briefcase, Play, Send, RefreshCw, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";

interface InterviewPageProps {
  user: User;
  activeRoleTrack: string | null;
  onNavigate: (page: string) => void;
}

export default function InterviewPage({ user, activeRoleTrack, onNavigate }: InterviewPageProps) {
  const [roleInput, setRoleInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [feedback, setFeedback] = useState<{ score: number; text: string } | null>(null);

  useEffect(() => {
    setRoleInput(activeRoleTrack || user.profile?.targetRole || "Full-Stack Web Developer");
    // Fetch active session if exists
    fetchActiveSession();
  }, [activeRoleTrack]);

  const fetchActiveSession = async () => {
    try {
      const res = await fetch(`/api/agent/interview/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setSession(data);
        // find first unanswered question index
        const firstUnanswered = data.questions.findIndex((q: any) => !q.userAnswer);
        setCurrentQIndex(firstUnanswered !== -1 ? firstUnanswered : 0);
      }
    } catch (err) {
      console.warn("No prior interview session active.");
    }
  };

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleInput.trim()) return;
    setLoading(true);
    setFeedback(null);
    setTypedAnswer("");
    try {
      const res = await fetch(`/api/agent/interview/initiate/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: roleInput }),
      });
      const data = await res.json();
      setSession(data);
      setCurrentQIndex(0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!session || !typedAnswer.trim()) return;
    setSubmittingAnswer(true);
    const q = session.questions[currentQIndex];

    try {
      const res = await fetch(`/api/agent/interview/${user.id}/submit-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: q.id, userAnswer: typedAnswer }),
      });

      const data = await res.json();
      setFeedback({ score: data.score, text: data.feedback });
      
      // Update local session state
      const nextQuestions = [...session.questions];
      nextQuestions[currentQIndex] = {
        ...q,
        userAnswer: typedAnswer,
        score: data.score,
        feedback: data.feedback,
      };
      setSession({ ...session, questions: nextQuestions });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleNext = () => {
    setFeedback(null);
    setTypedAnswer("");
    if (session && currentQIndex < session.questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    }
  };

  const handleFinish = async () => {
    if (!session) return;
    setLoading(true);
    try {
      await fetch(`/api/agent/interview/${user.id}/complete`, {
        method: "POST",
      });
      // redirect to reports compile page!
      onNavigate("reports");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isLastQuestion = session && currentQIndex === session.questions.length - 1;
  const currentQ = session?.questions[currentQIndex];
  const totalQuestions = session?.questions.length || 0;
  const isQuestionAnswered = currentQ && !!currentQ.userAnswer;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono">
            Interactive LLM Training Simulator
          </span>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight font-sans">
            AI Interview Coach & Drill
          </h1>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-100/50 text-indigo-800 text-xs font-semibold">
          <Briefcase className="w-4 h-4 text-indigo-600" /> A-007 Active
        </span>
      </div>

      {!session ? (
        // Start interview state
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-150 shadow-sm space-y-6">
          <div className="max-w-md">
            <h2 className="text-base font-bold text-slate-900">Configure Practice Simulation</h2>
            <p className="text-xs text-gray-500 leading-relaxed mt-1">
              Select your target technology role or job description criteria. The Interview Preparation Agent (A-007) will dynamically draft five tailored questions (across Technical, Behavioral, and Situational types) to train and grade your technical delivery.
            </p>
          </div>

          <form onSubmit={handleInitiate} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="e.g. React Front-End Engineer"
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 font-semibold text-white rounded-xl text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-white" /> Initiate Mock Mock
            </button>
          </form>
        </div>
      ) : (
        // Session active question view
        <div className="space-y-6">
          {/* Timeline counter */}
          <div className="flex justify-between items-center bg-slate-100/60 border border-gray-150 rounded-xl px-4 py-2.5 text-xs text-gray-500">
            <span>Interview Topic Track: <b className="text-slate-800">{session.role}</b></span>
            <span>Question <b className="text-slate-800">{currentQIndex + 1}</b> of <b className="text-slate-800">{totalQuestions}</b></span>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-150 shadow-sm space-y-5">
            <div>
              <span className="inline-flex px-2 py-0.5 rounded text-[9.5px] font-bold font-mono uppercase bg-indigo-50 text-indigo-800 mb-2.5">
                Type: {currentQ?.type} Question
              </span>
              <h2 className="text-sm sm:text-base font-bold text-slate-950 leading-relaxed">
                {currentQ?.question}
              </h2>
            </div>

            {/* Answer textbox or answered review */}
            {isQuestionAnswered ? (
              <div className="space-y-4 pt-3 border-t border-gray-100">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your Submitted Answer:</span>
                  <div className="p-3 bg-slate-5 font-medium border border-gray-150 text-xs text-gray-700 rounded-xl whitespace-pre-line leading-relaxed">
                    {currentQ.userAnswer}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-indigo-950 flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-indigo-600" /> Executive AI Grade Evaluation:
                    </span>
                    <span className="text-md font-extrabold text-indigo-600">{currentQ.score}/100 Score</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{currentQ.feedback}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-3 border-t border-gray-100">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Type your practice response below (at least 2 explanatory sentences):
                </label>
                <textarea
                  rows={5}
                  placeholder="Draft your answer here outlining structures, paradigms, and direct project operations you command..."
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            <div className="flex justify-between items-center pt-5 border-t border-gray-100">
              <button
                onClick={() => {
                  if (window.confirm("Exit this drill? Current progress will remain logged.")) {
                    setSession(null);
                  }
                }}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
              >
                Quit Drill
              </button>

              <div className="flex gap-2">
                {!isQuestionAnswered ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={submittingAnswer || !typedAnswer.trim()}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5" /> {submittingAnswer ? "Evaluating Suitability..." : "Evaluate Answer"}
                  </button>
                ) : (
                  <>
                    {!isLastQuestion ? (
                      <button
                        onClick={handleNext}
                        className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1"
                      >
                        Next Question <Play className="w-3.5 h-3.5 fill-white" />
                      </button>
                    ) : (
                      <button
                        onClick={handleFinish}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1"
                      >
                        Save & View Report <CheckCircle2 className="w-4.5 h-4.5" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
