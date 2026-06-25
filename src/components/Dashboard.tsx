import React from "react";
import { User, Assessment, LearningRoadmap } from "../types";
import { 
  Sparkles, 
  Map, 
  Layers, 
  GraduationCap, 
  Briefcase, 
  ClipboardList, 
  Compass, 
  ArrowRight,
  TrendingUp,
  UserCheck
} from "lucide-react";

interface DashboardProps {
  user: User;
  onNavigate: (page: string) => void;
  assessment: Assessment | null;
  roadmap: LearningRoadmap | null;
}

export default function Dashboard({ user, onNavigate, assessment, roadmap }: DashboardProps) {
  // Array describing the 8 specialized agents of MACGS
  const AGENTS = [
    { id: "A-001", name: "User Profile Agent", desc: "Coordinates candidate portfolios and credentials.", color: "bg-teal-500", icon: UserCheck },
    { id: "A-002", name: "Assessment Agent", desc: "Administers logic, interests, and logic flow queries.", color: "bg-blue-500", icon: ClipboardList },
    { id: "A-003", name: "Recommendation Agent", desc: "Aligns profiles into concrete career pathway targets.", color: "bg-violet-500", icon: Compass },
    { id: "A-004", name: "Skill Gap Agent", desc: "Audits candidate competencies against industry standards.", color: "bg-rose-500", icon: Layers },
    { id: "A-005", name: "Resource Agent", desc: "Curates time-bound, weekly study modules and tutorials.", color: "bg-amber-500", icon: GraduationCap },
    { id: "A-006", name: "Job Market Agent", desc: "Aggregates real salary, forecasts, and top hiring firms.", color: "bg-emerald-500", icon: TrendingUp },
    { id: "A-007", name: "Interview Prep Agent", desc: "Generates tailored mock drills and evaluates responses.", color: "bg-sky-500", icon: Briefcase },
    { id: "A-008", name: "Orchestration Agent", desc: "Governs collaborative messaging outputs into Reports.", color: "bg-purple-500", icon: Sparkles },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transform translate-x-5 -translate-y-5">
          <Sparkles className="w-48 h-48 text-indigo-400" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-600 text-white mb-4 tracking-wider uppercase">
            Active Multi-Agent Model
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mb-6 leading-relaxed">
            Your MACGS environment is active and running. Based on your current portfolio, eight coordinated software agents are collaborating in the background to refine your professional pathway.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate("assessment")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer inline-flex items-center"
            >
              Take Assessment <ArrowRight className="w-4.5 h-4.5 ml-1.5" />
            </button>
            <button
              onClick={() => onNavigate("profile")}
              className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white text-xs sm:text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Update Portfolio
            </button>
          </div>
        </div>
      </div>

      {/* Progress & Quick Stats */}
      <h2 className="text-lg font-bold text-gray-800 tracking-tight">Active Progress & Credentials</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Assessment Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <ClipboardList className="w-5 h-5" />
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase ${
                assessment?.completed ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
              }`}>
                {assessment?.completed ? "Completed" : "Not Started"}
              </span>
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Adaptive Assessment</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4 leading-relaxed">
              {assessment?.completed 
                ? `Mapped: ${assessment.personalityType}. Aptitude Score: ${assessment.aptitudeScore}%`
                : "Evaluate logic, interests, and profile tendencies to seed LLM models."
              }
            </p>
          </div>
          <button
            onClick={() => onNavigate("assessment")}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center justify-start mt-2 cursor-pointer"
          >
            {assessment?.completed ? "Retake Exam" : "Launch Questionnaires"} <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        {/* Roadmap Indicator */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Map className="w-5 h-5" />
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full uppercase bg-slate-100 text-slate-700">
                {roadmap ? `${roadmap.progressPct}% Complete` : "Inactive"}
              </span>
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Learning Roadmap</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4 leading-relaxed">
              {roadmap 
                ? `Custom 12-week curriculum generated for: ${roadmap.role}`
                : "Select a recommended career role to generate a personalized weekly learning path."
              }
            </p>
          </div>
          <button
            onClick={() => {
              if (roadmap) onNavigate("roadmap");
              else onNavigate("recommendations");
            }}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center justify-start mt-2 cursor-pointer"
          >
            {roadmap ? "Explore Details" : "View Recommendations"} <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        {/* Portfolio Density */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <Layers className="w-5 h-5" />
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full uppercase bg-purple-50 text-purple-700">
                Data Density
              </span>
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Professional Portfolio</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4 leading-relaxed">
              Stated skills: <b className="text-gray-800">{user.profile?.skills?.length ?? 0}</b>. Certifications: <b className="text-gray-800">{user.profile?.certifications?.length ?? 0}</b>. Targets: <b className="text-gray-800">{user.profile?.targetRole || "None listed"}</b>.
            </p>
          </div>
          <button
            onClick={() => onNavigate("profile")}
            className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center justify-start mt-2 cursor-pointer"
          >
            Enhance Portfolio <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>
      </div>

      {/* Agents Collaborative Framework View */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-md font-bold text-gray-900 mb-2">Our Coordinated Multi-Agent Core Layout</h3>
        <p className="text-xs text-gray-500 mb-6 leading-relaxed">
          The system leverages eight independent, synchronized AI agents to handle specialized processes, passing message states via a collaborative orchestrator mapping.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {AGENTS.map((agent) => {
            const IconComp = agent.icon;
            return (
              <div key={agent.id} className="p-4 rounded-xl border border-slate-150 hover:border-indigo-200 hover:bg-indigo-50/10 transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${agent.color}`} />
                    <span className="text-[10px] font-bold text-gray-400 tracking-wider font-mono uppercase">{agent.id}</span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-xs group-hover:text-indigo-600 transition-colors">{agent.name}</h4>
                  <p className="text-[11px] text-gray-400 mt-1 leading-normal">{agent.desc}</p>
                </div>
                <div className="flex justify-end mt-3">
                  <IconComp className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
