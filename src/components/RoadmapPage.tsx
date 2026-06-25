import React, { useState } from "react";
import { User, LearningRoadmap, LearningMilestone } from "../types";
import { 
  GraduationCap, 
  Map, 
  ArrowRight, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  FileText, 
  CheckCircle, 
  ExternalLink,
  Mail,
  X,
  Send,
  Sparkles,
  Inbox
} from "lucide-react";

interface RoadmapPageProps {
  user: User;
  roadmap: LearningRoadmap | null;
  onUpdateRoadmap: (rm: LearningRoadmap) => void;
  onNavigate: (page: string) => void;
}

interface MockEmail {
  id: string;
  subject: string;
  recipient: string;
  week: number;
  focus: string;
  body: string;
  sentAt: string;
}

export default function RoadmapPage({ user, roadmap, onUpdateRoadmap, onNavigate }: RoadmapPageProps) {
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);
  const [emails, setEmails] = useState<MockEmail[]>([]);

  if (!roadmap) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 font-sans">
        <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-full">
          <Map className="w-10 h-10" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">No Learning Roadmap Active</h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          You haven't designated a target role track yet. To construct a personalized weekly learning roadmap with curated courses, explore recommended careers.
        </p>
        <button
          onClick={() => onNavigate("recommendations")}
          className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer inline-flex items-center"
        >
          Explore Careers <ArrowRight className="w-4 h-4 ml-1.5" />
        </button>
      </div>
    );
  }

  const triggerToastNotification = (ms: LearningMilestone) => {
    const newEmail: MockEmail = {
      id: Math.random().toString(36).substring(2, 9),
      subject: `🏆 Milestone Achieved: Week ${ms.week} Coursework Unlocked!`,
      recipient: user.email || `${user.name.toLowerCase().replace(/\s+/g, "")}@example.com`,
      week: ms.week,
      focus: ms.focus,
      body: `Hi ${user.name}, Awesome work! Our Autonomous Curriculum Orchestration Agent (A-008) has detected that you successfully achieved the Week ${ms.week} Milestone: "${ms.focus}". Deep Research agent has queued advanced diagnostic modules for your next stage of prep!`,
      sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setEmails(prev => [newEmail, ...prev]);

    // Automatically dismiss the toast after 10 seconds
    setTimeout(() => {
      setEmails(prev => prev.filter(e => e.id !== newEmail.id));
    }, 10000);
  };

  const checkMilestoneAchievements = (oldRm: LearningRoadmap | null, newRm: LearningRoadmap) => {
    if (!oldRm) return;
    newRm.milestones.forEach((newMs, idx) => {
      const oldMs = oldRm.milestones[idx];
      // If the milestone is newly marked completed
      if (newMs.completed && (!oldMs || !oldMs.completed)) {
        triggerToastNotification(newMs);
      }
    });
  };

  const handleToggleResource = async (weekIndex: number, resourceTitle: string, currentCompleted: boolean) => {
    const key = `${weekIndex}_${resourceTitle}`;
    setToggleLoading(key);
    try {
      const res = await fetch(`/api/agent/roadmap/${user.id}/toggle-resource`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekIndex,
          resourceTitle,
          completed: !currentCompleted,
        }),
      });
      const data = await res.json();
      if (data.roadmap) {
        checkMilestoneAchievements(roadmap, data.roadmap);
        onUpdateRoadmap(data.roadmap);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setToggleLoading(null);
    }
  };

  const handleToggleMilestone = async (weekIndex: number, currentCompleted: boolean) => {
    const key = `week_${weekIndex}`;
    setToggleLoading(key);
    try {
      const res = await fetch(`/api/agent/roadmap/${user.id}/toggle-milestone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekIndex,
          completed: !currentCompleted,
        }),
      });
      const data = await res.json();
      if (data.roadmap) {
        checkMilestoneAchievements(roadmap, data.roadmap);
        onUpdateRoadmap(data.roadmap);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setToggleLoading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono">
            Active Study Plan Progress
          </span>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight font-sans">
            12-Week Roadmap: {roadmap.role}
          </h1>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-100/50 text-indigo-800 text-xs font-semibold">
          <GraduationCap className="w-4 h-4 text-indigo-600" /> Lesson Syllabuses Active
        </span>
      </div>

      {/* Progress Circle banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white rounded-2xl p-6 shadow-sm flex items-center gap-5">
        <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
          {/* Subtle circle bar progress */}
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="32" cy="32" r="28" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
            <circle 
              cx="32" 
              cy="32" 
              r="28" 
              fill="transparent" 
              stroke="#4f46e5" 
              strokeWidth="4" 
              strokeDasharray={2 * Math.PI * 28}
              strokeDashoffset={2 * Math.PI * 28 * (1 - roadmap.progressPct / 100)}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-xs font-bold leading-none">{roadmap.progressPct}%</span>
        </div>
        <div>
          <h3 className="font-bold text-sm">Skills Curriculum Tracker</h3>
          <p className="text-xs text-indigo-200/90 mt-1 max-w-xl leading-normal">
            Each week's milestones close specific skill vacancies identified by the Skill Gap Analysis Agent (A-004). Mark resources and completed checkpoints to sync your data.
          </p>
        </div>
      </div>

      {/* 12-Week Timeline */}
      <div className="space-y-4 relative before:absolute before:inset-0 before:left-6 before:w-0.5 before:bg-gray-200">
        {roadmap.milestones.map((milestone, idx) => {
          const isWeekCompleted = milestone.completed;
          const keyWeek = `week_${idx}`;
          return (
            <div key={idx} className="relative pl-12 group">
              {/* Timeline dot */}
              <button
                disabled={toggleLoading === keyWeek}
                onClick={() => handleToggleMilestone(idx, isWeekCompleted)}
                className={`absolute left-3.5 top-0.5 w-6 h-6 rounded-full border-2 bg-white flex items-center justify-center cursor-pointer transition-all ${
                  isWeekCompleted 
                    ? "border-emerald-500 text-emerald-500" 
                    : "border-gray-300 text-gray-400 font-mono text-[10px] hover:border-indigo-500"
                }`}
              >
                {isWeekCompleted ? (
                  <CheckCircle className="w-4 h-4 fill-emerald-50" />
                ) : (
                  <span>W{milestone.week}</span>
                )}
              </button>

              {/* Main week block */}
              <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm space-y-4 hover:border-gray-350 transition-colors">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm tracking-tight flex items-center gap-2">
                      Week {milestone.week}: {milestone.focus}
                    </h4>
                    <p className="text-xs text-gray-500 leading-relaxed mt-1">{milestone.description}</p>
                  </div>
                  <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 tracking-wider uppercase font-mono">
                    {milestone.hoursPerWeek} hrs/wk
                  </span>
                </div>

                {/* Week's resources */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                  {milestone.resources.map((res, rIdx) => {
                    const rKey = `${idx}_${res.title}`;
                    const isCompleted = res.completed;
                    return (
                      <div
                        key={rIdx}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                          isCompleted 
                            ? "bg-slate-50 border-gray-150" 
                            : "border-gray-100 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            disabled={toggleLoading === rKey || toggleLoading === keyWeek}
                            onClick={() => handleToggleResource(idx, res.title, !!isCompleted)}
                            className="text-gray-400 hover:text-indigo-500 cursor-pointer flex-shrink-0"
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
                            ) : (
                              <Circle className="w-4.5 h-4.5" />
                            )}
                          </button>
                          <div className="min-w-0">
                            <span className={`block text-xs font-bold truncate leading-tight ${isCompleted ? "text-gray-400 line-through" : "text-slate-800"}`}>
                              {res.title}
                            </span>
                            <span className="block text-[10px] text-gray-400 font-medium">
                              Platform: {res.platform} · <span className="uppercase">{res.type}</span>
                            </span>
                          </div>
                        </div>
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 text-gray-400 hover:text-indigo-600 cursor-pointer flex-shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Simulated Career-Coach SMTPS Log Widget */}
      <div className="bg-white rounded-2xl border border-gray-150 p-5 mt-10 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 font-sans">
                Simulated Career-Coach SMTP Terminal
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              </h3>
              <p className="text-[11px] text-gray-500 leading-normal">
                Autonomous system logs of triggered email transmissions dispatched precisely upon checking milestone items.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-[10px] font-extrabold bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg font-mono">
            {emails.length === 0 ? "0 DISPATCHED" : `${emails.length} DISPATCHED`}
          </span>
        </div>

        {emails.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-xl py-10 text-center text-xs text-gray-400 font-sans italic space-y-2">
            <Inbox className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="max-w-xs mx-auto">No milestone achievements registered in this session yet.</p>
            <p className="text-[10px] text-gray-300">Mark resources complete or cross-off a timeline week above to trigger SMTPS notifications!</p>
          </div>
        ) : (
          <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
            {emails.map((email) => (
              <div key={email.id} className="p-4 bg-slate-50 border border-gray-150 rounded-xl space-y-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
                <div className="flex justify-between items-start gap-4 font-sans text-xs border-b border-gray-150/60 pb-2 ml-1">
                  <div className="space-y-0.5">
                    <span className="block font-semibold text-slate-800 text-sm">{email.subject}</span>
                    <span className="block text-[11px] text-indigo-600 font-semibold">Recipient: {email.recipient}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 shrink-0 font-mono font-medium">{email.sentAt}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans ml-1 bg-white p-3 rounded-lg border border-gray-100 italic">
                  "{email.body}"
                </p>
                <div className="flex items-center justify-between text-[10px] text-emerald-600 font-sans ml-1">
                  <span className="flex items-center gap-1 font-bold">
                    <Send className="w-3.5 h-3.5 text-emerald-500 animate-pulse" /> SMTPS Outbox Delivery Confirmed
                  </span>
                  <span className="text-gray-400 font-mono text-[9px]">DIAG_ID: {email.id}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Toast Notification Stack in bottom corner */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-4 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
        {emails.slice(0, 3).map((email) => (
          <div 
            key={email.id} 
            className="bg-slate-900 border border-indigo-500/35 text-white rounded-2xl p-4 shadow-2xl space-y-3 font-sans relative pointer-events-auto animate-bounce"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 flex-shrink-0 animate-pulse">
                  <Mail className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="block text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest font-mono">Mail Transmitted</span>
                    <span className="px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-300 text-[8px] font-bold font-mono">MOCK SMTP</span>
                  </div>
                  <span className="block text-xs font-bold text-slate-100 truncate mt-0.5">{email.subject}</span>
                </div>
              </div>
              <button 
                onClick={() => setEmails(prev => prev.filter(e => e.id !== email.id))}
                className="text-gray-400 hover:text-white cursor-pointer hover:bg-slate-850 p-1 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-[11px] text-slate-350 leading-relaxed pt-2 border-t border-slate-800 space-y-2">
              <p className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850 font-sans text-xs select-none">
                {email.body}
              </p>
              <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono">
                <span>To: {email.recipient}</span>
                <span>{email.sentAt}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10.5px] font-sans font-bold pt-1 border-t border-slate-800/80">
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Injected STMP Loop Success
              </span>
              <button 
                onClick={() => setEmails(prev => prev.filter(e => e.id !== email.id))}
                className="text-indigo-400 hover:text-indigo-300 text-[10px] font-bold transition-colors cursor-pointer"
              >
                Dismiss Toast
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
