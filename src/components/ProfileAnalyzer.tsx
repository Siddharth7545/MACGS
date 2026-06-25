import React, { useState } from "react";
import { User, UserType } from "../types";
import { 
  GraduationCap, 
  Award, 
  RefreshCw, 
  Briefcase, 
  Sparkles, 
  ArrowRight, 
  Terminal, 
  CheckCircle2, 
  Loader2, 
  UserCheck, 
  SlidersHorizontal,
  ChevronRight,
  Plus,
  X
} from "lucide-react";

interface ProfileAnalyzerProps {
  user: User;
  onAnalysisCompleted: (updatedUser: User) => void;
  isUpdatingLater?: boolean;
  onCancelUpdate?: () => void;
}

type AllowedUserType = "student" | "graduate" | "career_changer" | "job_seeker";

export default function ProfileAnalyzer({ 
  user, 
  onAnalysisCompleted,
  isUpdatingLater = false,
  onCancelUpdate
}: ProfileAnalyzerProps) {
  const [selectedType, setSelectedType] = useState<AllowedUserType | null>(
    (user.userType !== "admin" ? user.userType : "student") as AllowedUserType
  );
  
  // Form fields
  const [targetRole, setTargetRole] = useState(user.profile?.targetRole || "");
  const [currentRole, setCurrentRole] = useState(user.profile?.currentRole || "");
  const [skillsText, setSkillsText] = useState(user.profile?.skills?.join(", ") || "");
  const [interestsText, setInterestsText] = useState(user.profile?.interests?.join(", ") || "");
  
  // Student-specific fields
  const [institute, setInstitute] = useState(user.profile?.education?.[0] || "");
  const [gradYear, setGradYear] = useState("");
  
  // Graduate-specific fields
  const [degree, setDegree] = useState("");
  const [majorProject, setMajorProject] = useState("");

  // Career Changer-specific fields
  const [prevIndustry, setPrevIndustry] = useState("");
  const [keyTransferable, setKeyTransferable] = useState("");

  // Active Job Seeker-specific fields
  const [recentCompany, setRecentCompany] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");

  // Multi-Agent phase states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [agentLogs, setAgentLogs] = useState<string[]>([]);
  const [completedReport, setCompletedReport] = useState<any | null>(null);

  const CARDS = [
    {
      id: "student",
      title: "Student / Class 12th (Undergrad)",
      desc: "Currently studying in school (Class 12th / boards), college, or university, looking to discover early career routes to technology.",
      icon: GraduationCap,
      color: "border-indigo-200 bg-indigo-50/40 text-indigo-700 hover:border-indigo-400",
      activeColor: "ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/80"
    },
    {
      id: "graduate",
      title: "Recent Graduate / 12th Pass",
      desc: "Completed collegiate degree or successfully finished Class 12 (Higher Secondary) recently. Ready to jumpstart vocational or entry software tracks.",
      icon: Award,
      color: "border-emerald-200 bg-emerald-50/40 text-emerald-700 hover:border-emerald-400",
      activeColor: "ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/80"
    },
    {
      id: "career_changer",
      title: "Career Changer",
      desc: "Leveraging a different commercial background to transition systematically into technology pathways.",
      icon: RefreshCw,
      color: "border-purple-200 bg-purple-50/40 text-purple-700 hover:border-purple-400",
      activeColor: "ring-2 ring-purple-500 border-purple-500 bg-purple-50/80"
    },
    {
      id: "job_seeker",
      title: "Active Job Seeker",
      desc: "Has formal/informal tech experience, targeting custom roles or rapid wage-tier optimizations.",
      icon: Briefcase,
      color: "border-blue-200 bg-blue-50/40 text-blue-700 hover:border-blue-400",
      activeColor: "ring-2 ring-blue-500 border-blue-500 bg-blue-50/80"
    }
  ];

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleStartAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;

    setIsAnalyzing(true);
    setAnalysisStep(1);
    setAgentLogs([]);

    // 1. Initiate Profile Agent
    setAgentLogs(prev => [...prev, "[A-001 User Profile Agent] Initializing credentials alignment sequence..."]);
    await sleep(900);
    setAgentLogs(prev => [...prev, `[A-001 User Profile Agent] Parsing candidate archetype to '${selectedType.toUpperCase()}'.`]);
    setAgentLogs(prev => [...prev, `[A-001 User Profile Agent] Target trajectory mapped: ${targetRole || "Technical Specialist"}.`]);
    await sleep(800);
    setAnalysisStep(2);

    // 2. Initiate Skill Gap Agent
    setAgentLogs(prev => [...prev, "[A-004 Skill Gap Agent] Cross-referencing competency vectors with market taxonomies..."]);
    const parsedSkills = skillsText.split(",").map(s => s.trim()).filter(Boolean);
    setAgentLogs(prev => [...prev, `[A-004 Skill Gap Agent] Stated core skills identified: ${parsedSkills.join(", ") || "None registered"}`]);
    await sleep(900);
    setAgentLogs(prev => [...prev, `[A-004 Skill Gap Agent] Querying requirement databases for standard '${targetRole || "Technical Architect"}' roles...`]);
    await sleep(700);
    setAnalysisStep(3);

    // 3. Initiate Recommendation Agent
    setAgentLogs(prev => [...prev, "[A-003 Recommendation Agent] Plotting optimal transition pipelines based on status data..."]);
    if (selectedType === "career_changer") {
      setAgentLogs(prev => [...prev, `[A-003 Recommendation Agent] Transferable context detected from '${prevIndustry || "Non-tech Industry"}'.`]);
    } else if (selectedType === "student") {
      setAgentLogs(prev => [...prev, `[A-003 Recommendation Agent] Student track recognized. Allocating intern benchmarks.`]);
    }
    await sleep(900);
    setAnalysisStep(4);

    // 4. Finalize Orchestrator report synthesis
    setAgentLogs(prev => [...prev, "[A-008 Orchestration Agent] Synthesizing comprehensive portfolio and finalizing authorization access..."]);
    await sleep(1000);

    // Submit state to backend
    const builtExperience = [];
    if (selectedType === "career_changer" && prevIndustry) {
      builtExperience.push(`Previous Career: ${prevIndustry}`);
      if (keyTransferable) builtExperience.push(`Transferable Skills: ${keyTransferable}`);
    } else if (selectedType === "job_seeker") {
      builtExperience.push(`Role at previous company ${recentCompany || "Industry Tech"}: ${yearsExperience || "1"} year(s)`);
    } else if (selectedType === "graduate" && majorProject) {
      builtExperience.push(`Lead Collegiate Project: ${majorProject}`);
    } else {
      builtExperience.push("Academic Training / Classroom Labs");
    }

    const builtEducation = [];
    if (selectedType === "student" && institute) {
      builtEducation.push(`${institute} (Expected Class of ${gradYear || "2027"})`);
    } else if (selectedType === "graduate" && degree) {
      builtEducation.push(`${degree} from ${institute || "University"}`);
    } else if (institute) {
      builtEducation.push(institute);
    } else {
      builtEducation.push("Self-Directed Learning / Modern Bootcamps");
    }

    const payload = {
      name: user.name,
      userType: selectedType,
      currentRole: currentRole || (selectedType === "student" ? "Undergraduate Student" : selectedType.toUpperCase().replace("_", " ")),
      targetRole: targetRole || "Full-Stack Web Developer",
      skills: parsedSkills,
      interests: interestsText.split(",").map(i => i.trim()).filter(Boolean),
      experience: builtExperience,
      education: builtEducation,
      certifications: selectedType === "job_seeker" ? ["Active Career-Mate Assessment Token"] : [],
      profileAnalyzed: true
    };

    try {
      const response = await fetch(`/api/profile/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to secure agent alignments in DB node.");
      }

      const resData = await response.json();
      
      setAgentLogs(prev => [...prev, "[SYSTEM SUCCESS] Alignment verified! Career-Mate workspace is now fully functional and calibrated."]);
      await sleep(600);

      const finalUser: User = {
        ...user,
        userType: selectedType,
        profile: resData.profile,
        profileAnalyzed: true
      };

      onAnalysisCompleted(finalUser);
    } catch (err: any) {
      setAgentLogs(prev => [...prev, `[SYSTEM ERROR] Failed saving telemetry: ${err.message}`]);
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4">
      {/* Upper header */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100/50 text-indigo-700 text-xs font-semibold animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Executive Multi-Agent Alignment Layer Active
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Configure Your Professional Archetype
        </h1>
        <p className="text-sm text-gray-500 max-w-xl mx-auto">
          Our autonomous system agents analyze your background parameters live to formulate optimal skill tracks, customized roadmaps, and wage-growth maps.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main interactive segment */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-150 shadow-sm p-6 sm:p-8 space-y-6">
          
          {/* Card status row */}
          <div>
            <div className="flex items-center justify-between mb-3 text-sm font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                1. Select Your Current Career Status
              </span>
              {isUpdatingLater && onCancelUpdate && (
                <button 
                  onClick={onCancelUpdate}
                  className="px-2.5 py-1 text-[11px] text-gray-500 bg-gray-150 rounded-lg hover:text-gray-900 cursor-pointer flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Cancel
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CARDS.map((card) => {
                const Icon = card.icon;
                const isActive = selectedType === card.id;
                return (
                  <button
                    type="button"
                    key={card.id}
                    onClick={() => {
                      if (!isAnalyzing) {
                        setSelectedType(card.id as AllowedUserType);
                      }
                    }}
                    className={`p-4 rounded-xl text-left border flex flex-col gap-3 transition-all cursor-pointer ${
                      isActive ? card.activeColor : card.color
                    }`}
                    disabled={isAnalyzing}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`p-2 rounded-lg ${isActive ? "bg-indigo-600 text-white" : "bg-white border text-gray-700"}`}>
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className="font-bold text-xs">{card.title}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-gray-500">
                      {card.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stepped custom fields */}
          {selectedType && (
            <form onSubmit={handleStartAnalysis} className="space-y-4 pt-4 border-t border-gray-100">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                <ChevronRight className="w-4 h-4 text-indigo-600" />
                2. Complete Archetype Requirements
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Target Role input (all) */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide">
                    Target Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Frontend Engineer, Cloud Analyst"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={isAnalyzing}
                  />
                </div>

                {/* Specific Role label (all) */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide">
                    Current Formal Description / Role Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science Student, Job Applicant"
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={isAnalyzing}
                  />
                </div>

                {/* Sub-form inputs conditional on status */}
                {selectedType === "student" && (
                  <>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide">
                        School Board, College, or University Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. CBSE Board, Kendriya Vidyalaya, or local State Board"
                        value={institute}
                        onChange={(e) => setInstitute(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={isAnalyzing}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide">
                        Target Passing or Graduation Year (e.g., 2026)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 2026"
                        value={gradYear}
                        onChange={(e) => setGradYear(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={isAnalyzing}
                      />
                    </div>
                  </>
                )}

                {selectedType === "graduate" && (
                  <>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide">
                        Qualification Conferred (e.g. 12th Pass, Diploma, B.S.)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 12th Pass / HSC, Diploma in Tech, B.Sc"
                        value={degree}
                        onChange={(e) => setDegree(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={isAnalyzing}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide">
                        School Board, College, or University Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. CBSE Board, St. Xavier School, ABC College"
                        value={institute}
                        onChange={(e) => setInstitute(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={isAnalyzing}
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide">
                        Major Class Project / Core Work (or specify 'None')
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Python basic billing calculator, high school web labs, or Self Lab work"
                        value={majorProject}
                        onChange={(e) => setMajorProject(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={isAnalyzing}
                      />
                    </div>
                  </>
                )}

                {selectedType === "career_changer" && (
                  <>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide">
                        Previous Commercial Industry / Job
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. High School Mathematics Teacher"
                        value={prevIndustry}
                        onChange={(e) => setPrevIndustry(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={isAnalyzing}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide">
                        Primary Transferable Skills (logic, management, etc)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Statistical research, Lesson planning"
                        value={keyTransferable}
                        onChange={(e) => setKeyTransferable(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={isAnalyzing}
                      />
                    </div>
                  </>
                )}

                {selectedType === "job_seeker" && (
                  <>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide">
                        Most Recent Employer / Project Org
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Acme Tech Solutions LLC"
                        value={recentCompany}
                        onChange={(e) => setRecentCompany(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={isAnalyzing}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide">
                        Years of Industry Experience
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 2 years"
                        value={yearsExperience}
                        onChange={(e) => setYearsExperience(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={isAnalyzing}
                      />
                    </div>
                  </>
                )}

              </div>

              {/* Skills text */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide">
                  Your Pre-existing Technical Competencies (comma-separated) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JavaScript, Python, React, SQL, Git, HTML, Docker"
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={isAnalyzing}
                />
                <p className="text-[10px] text-gray-400">
                  Multiple agents will instantly utilize these to search for learning module resources matching gaps.
                </p>
              </div>

              {/* Interests text */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide">
                  Main Technical Fields of Interest (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Web Development, Cloud Computing, Game Development, Cybersecurity"
                  value={interestsText}
                  onChange={(e) => setInterestsText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={isAnalyzing}
                />
              </div>

              {/* Trigger Button */}
              <button
                type="submit"
                disabled={isAnalyzing || !targetRole.trim() || !skillsText.trim()}
                className="w-full mt-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center gap-2 font-sans shadow-md"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Multi-Agent Synthesis In Progress...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white" />
                    Authorize Multi-Agent Profile Analyzer <ArrowRight className="w-4 h-4 text-white" />
                  </>
                )}
              </button>

            </form>
          )}

        </div>

        {/* Real-time Multi-Agent Diagnostics Panel */}
        <div className="bg-slate-900 text-slate-300 rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-extrabold font-mono tracking-widest text-indigo-400 uppercase flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-indigo-500" />
                Agent Pipeline Terminal
              </span>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>

            {/* Simulated Live diagnostics */}
            <div className="space-y-3 font-mono text-[10.5px] leading-relaxed max-h-[300px] overflow-y-auto pr-1">
              {agentLogs.length === 0 ? (
                <div className="text-slate-500 italic py-12 text-center space-y-2">
                  <p>Awaiting profile authorization to trigger the 8 autonomous system components...</p>
                  <p className="text-[9.5px]">Select card, input coordinates, and press Analyze.</p>
                </div>
              ) : (
                agentLogs.map((log, index) => {
                  let colorClass = "text-slate-300";
                  if (log.includes("[A-001")) colorClass = "text-teal-400 font-semibold";
                  if (log.includes("[A-004")) colorClass = "text-rose-400 font-semibold";
                  if (log.includes("[A-003")) colorClass = "text-violet-400 font-semibold";
                  if (log.includes("[A-008")) colorClass = "text-indigo-400 font-semibold";
                  if (log.includes("[SYSTEM SUCCESS")) colorClass = "text-emerald-400 font-bold";
                  return (
                    <div key={index} className={`${colorClass} border-l-2 pl-2 border-slate-800`}>
                      {log}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Stepped visual progress tracker */}
          <div className="mt-8 border-t border-slate-800 pt-5 space-y-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Alignment Progress:
            </span>
            <div className="grid grid-cols-4 gap-2">
              <div className={`h-1.5 rounded-full ${analysisStep >= 1 ? "bg-teal-400" : "bg-slate-850"}`} />
              <div className={`h-1.5 rounded-full ${analysisStep >= 2 ? "bg-rose-400" : "bg-slate-850"}`} />
              <div className={`h-1.5 rounded-full ${analysisStep >= 3 ? "bg-violet-400" : "bg-slate-850"}`} />
              <div className={`h-1.5 rounded-full ${analysisStep >= 4 ? "bg-indigo-400" : "bg-slate-850"}`} />
            </div>
            <div className="flex justify-between text-[9px] text-gray-500 font-mono">
              <span>Profile (A-001)</span>
              <span>Gaps (A-004)</span>
              <span>Tracks (A-003)</span>
              <span>Report (A-008)</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
