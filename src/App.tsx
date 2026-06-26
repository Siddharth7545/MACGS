import { useState, useEffect } from "react";
import { User, Assessment, LearningRoadmap, CareerRecommendation } from "./types";
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard";
import ProfilePage from "./components/ProfilePage";
import AssessmentPage from "./components/AssessmentPage";
import RecommendationsPage from "./components/RecommendationsPage";
import RoadmapPage from "./components/RoadmapPage";
import JobMarketPage from "./components/JobMarketPage";
import InterviewPage from "./components/InterviewPage";
import ResumePage from "./components/ResumePage";
import OrchestratorReport from "./components/OrchestratorReport";
import AdminPanel from "./components/AdminPanel";
import ProfileAnalyzer from "./components/ProfileAnalyzer";
import ChatCoachPage from "./components/ChatCoachPage";

import { 
  ShieldCheck, 
  Sparkles,
  LayoutDashboard,
  UserCheck,
  ClipboardList,
  Compass,
  GraduationCap,
  TrendingUp,
  Briefcase,
  FileText,
  LogOut,
  Sliders,
  Menu,
  X,
  Sun,
  Moon,
  MessageSquare
} from "lucide-react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("theme") as "light" | "dark") || "light"
  );
  const [platformName, setPlatformName] = useState("CAREER-MATE");
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [activeRoleTrack, setActiveRoleTrack] = useState<string | null>(null);
  const [missingSkills, setMissingSkills] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  // Parse cached user on boot
  useEffect(() => {
    const cachedUser = localStorage.getItem("macgs_user");
    if (cachedUser) {
      try {
        const u = JSON.parse(cachedUser);
        setUser(u);
        syncUserData(u.id);
      } catch {
        localStorage.removeItem("macgs_user");
      }
    }
  }, []);

  const syncUserData = async (userId: string) => {
    try {
      // Sync user profile state
      const meRes = await fetch(`/api/auth/me/${userId}`);
      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData);
        localStorage.setItem("macgs_user", JSON.stringify(meData));
      } else if (meRes.status === 404) {
        setUser(null);
        localStorage.removeItem("macgs_user");
        return;
      }

      // Sync assessment
      const assRes = await fetch(`/api/assessment/${userId}`);
      if (assRes.ok) {
        const assData = await assRes.json();
        setAssessment(assData.completed ? assData : null);
      }

      // Sync active roadmap
      const rmRes = await fetch(`/api/agent/roadmap/${userId}`);
      if (rmRes.ok) {
        const rmData = await rmRes.json();
        setRoadmap(rmData);
        setActiveRoleTrack(rmData.role);
      }
    } catch (err) {
      console.warn("Failed syncing portfolio states from database on init.");
    }
  };

  const handleAuthSuccess = (u: User) => {
    setUser(u);
    localStorage.setItem("macgs_user", JSON.stringify(u));
    syncUserData(u.id);
  };

  const handleLogout = () => {
    setUser(null);
    setAssessment(null);
    setRoadmap(null);
    setRecommendations([]);
    setActiveRoleTrack(null);
    localStorage.removeItem("macgs_user");
  };

  const handleSetTargetTrack = (roleName: string, gaps: string[]) => {
    setActiveRoleTrack(roleName);
    setMissingSkills(gaps);

    // immediately fetch details and show learning roadmap
    if (user) {
      syncUserData(user.id);
    }
    setActiveTab("roadmap");
  };

  if (!user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  // Force show Profile Analyzer if user has not analyzed their profile yet, or is explicitly re-analyzing
  const showAnalyzer = (!user.profileAnalyzed && user.userType !== "admin") || isReanalyzing;

  if (showAnalyzer) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4">
        <ProfileAnalyzer 
          user={user} 
          onAnalysisCompleted={(updatedUser) => {
            setUser(updatedUser);
            localStorage.setItem("macgs_user", JSON.stringify(updatedUser));
            setIsReanalyzing(false);
            syncUserData(updatedUser.id);
          }} 
          isUpdatingLater={isReanalyzing}
          onCancelUpdate={() => setIsReanalyzing(false)}
        />
      </div>
    );
  }

  // Define sidebar links layout
  const SIDEBAR_ITEMS = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "profile", label: "Professional Portfolio", icon: UserCheck },
    { id: "assessment", label: "Adaptive Assessment", icon: ClipboardList },
    { id: "recommendations", label: "Career Pathways", icon: Compass },
    { id: "roadmap", label: "Weekly Roadmap", icon: GraduationCap },
    { id: "jobmarket", label: "Market Intelligence", icon: TrendingUp },
    { id: "interview", label: "Interview Drill", icon: Briefcase },
    { id: "resume", label: "Resume Auditor", icon: FileText },
    { id: "reports", label: "Orchestrator Report", icon: Sparkles },
    { id: "chat", label: "AI Career Coach", icon: MessageSquare },
  ];

  if (user.userType === "admin") {
    SIDEBAR_ITEMS.push({ id: "admin", label: "Admin Panel", icon: Sliders });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 flex transition-colors duration-200">
      {/* Mobile responsive sidebar toggler */}
      <div className="lg:hidden absolute top-4 left-4 z-40 no-print">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2.5 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer shadow-sm text-slate-700 dark:text-slate-300"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Responsive Theme Toggle */}
      <div className="lg:hidden absolute top-4 right-4 z-40 no-print">
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="p-2.5 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer shadow-sm text-slate-700 dark:text-slate-350"
          title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
        >
          {theme === "light" ? <Moon className="w-5 h-5 text-indigo-500" /> : <Sun className="w-5 h-5 text-amber-500" />}
        </button>
      </div>

      {/* Primary Sidebar Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 border-r border-slate-800 text-slate-300 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static no-print shrink-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col justify-between">
          <div>
            {/* Sidebar Logo Header */}
            <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
              <span className="p-2 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <h1 className="font-extrabold text-white text-md tracking-tight font-sans">
                  {platformName}
                </h1>
                <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
                  Multi-Agent
                </span>
              </div>
            </div>

            {/* Sidebar Navigation Items */}
            <nav className="p-4 space-y-1">
              {SIDEBAR_ITEMS.map((item) => {
                const IconComp = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
                      isActive 
                        ? "bg-slate-800 text-white border-l-4 border-indigo-500" 
                        : "hover:bg-slate-850 hover:text-white"
                    }`}
                  >
                    <IconComp className={`w-4.5 h-4.5 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User logout and theme toggle footer block */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/20 space-y-3.5">
            <div className="flex items-center justify-between px-2 pb-1.5 border-b border-slate-800/60">
              <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Appearance</span>
              <button
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-slate-350 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/55 rounded-lg cursor-pointer transition-colors"
                title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
              >
                {theme === "light" ? (
                  <>
                    <Moon className="w-3.5 h-3.5 text-indigo-450" />
                    <span>Dark</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Light</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2.5 px-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-755 flex items-center justify-center font-bold text-white text-xs select-none">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-white truncate leading-tight">{user.name}</span>
                <span className="block text-[10px] text-slate-400 truncate tracking-wide mt-0.5 uppercase font-mono">{user.userType}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main container panel */}
      <main className="flex-1 min-w-0 p-6 sm:p-8 lg:p-10 lg:pl-10 h-screen overflow-y-auto print:p-0">
        <div className="max-w-5xl mx-auto py-4 lg:py-0">
          {activeTab === "dashboard" && (
            <Dashboard 
              user={user} 
              onNavigate={setActiveTab} 
              assessment={assessment} 
              roadmap={roadmap} 
            />
          )}

          {activeTab === "profile" && (
            <ProfilePage 
              user={user} 
              onProfileUpdate={(updatedUser) => {
                setUser(updatedUser);
                localStorage.setItem("macgs_user", JSON.stringify(updatedUser));
              }} 
              onTriggerReanalysis={() => setIsReanalyzing(true)}
            />
          )}

          {activeTab === "assessment" && (
            <AssessmentPage 
              user={user} 
              assessment={assessment} 
              onAssessmentCompleted={(nextAssessment) => {
                setAssessment(nextAssessment);
                syncUserData(user.id);
              }} 
            />
          )}

          {activeTab === "recommendations" && (
            <RecommendationsPage 
              user={user} 
              assessment={assessment} 
              recommendations={recommendations}
              onSetRecommendations={setRecommendations}
              onSetTargetTrack={handleSetTargetTrack}
              activeRoleTrack={activeRoleTrack}
            />
          )}

          {activeTab === "roadmap" && (
            <RoadmapPage 
              user={user} 
              roadmap={roadmap} 
              onUpdateRoadmap={setRoadmap} 
              onNavigate={setActiveTab} 
            />
          )}

          {activeTab === "jobmarket" && (
            <JobMarketPage 
              user={user} 
              activeRoleTrack={activeRoleTrack} 
            />
          )}

          {activeTab === "interview" && (
            <InterviewPage 
              user={user} 
              activeRoleTrack={activeRoleTrack} 
              onNavigate={setActiveTab} 
            />
          )}

          {activeTab === "resume" && (
            <ResumePage user={user} />
          )}

          {activeTab === "reports" && (
            <OrchestratorReport user={user} />
          )}

          {activeTab === "chat" && (
            <ChatCoachPage />
          )}

          {activeTab === "admin" && (
            <AdminPanel onConfigChange={setPlatformName} />
          )}
        </div>
      </main>
    </div>
  );
}
