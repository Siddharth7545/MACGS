import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { 
  MessageSquare, 
  Send, 
  RotateCcw, 
  Bot, 
  Terminal, 
  Sparkles, 
  FileCheck, 
  UserPlus, 
  Cpu, 
  ChevronRight,
  User,
  Zap,
  Award
} from "lucide-react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
}

interface CoachRole {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  badge: string;
  systemInstruction: string;
  starters: string[];
}

const COACH_ROLES: CoachRole[] = [
  {
    id: "mentor",
    title: "Senior Tech Architect",
    description: "Cloud systems design, databases, architectural trade-offs, and microservices.",
    icon: Terminal,
    color: "indigo",
    badge: "System Architect",
    systemInstruction: "You are an elite Senior Tech Architect and seasoned engineering mentor. Give structural architectural recommendations, robust schema advices, and detailed cloud-native blueprints. Be highly technical, structure key metrics, and provide pseudo-code or architecture descriptions when helpful.",
    starters: [
      "Explain the trade-offs of using PostgreSQL (Cloud SQL) vs. DynamoDB for high-throughput messaging.",
      "How should I structure my database schema to track complex user roadmap milestones?",
      "Can you give some solid strategies to reduce server latency with intelligent CDN and cache configurations?"
    ]
  },
  {
    id: "resume",
    title: "Resume & Portfolio Coach",
    description: "Keywords optimization, metrics-targeting, clean summaries, and HR impact drafting.",
    icon: FileCheck,
    color: "emerald",
    badge: "Portfolio Strategist",
    systemInstruction: "You are an HR Executive Director and elite resume-auditing consultant. Guide the user to rephrase normal duties into high-impact metric-driven results using active verbs. Recommend portfolio frameworks, tech stacks showcase ideas, and professional summary polish.",
    starters: [
      "Rephrase this bullet: 'I was responsible for maintaining legacy database systems and writing SQL.'",
      "What are five powerful, modern action verbs to showcase leader-driven engineering impact?",
      "How do I structure a robust portfolio section for an AI project to grab recruiters' attention?"
    ]
  },
  {
    id: "behavioral",
    title: "Interview & Soft-Skills Prep",
    description: "STAR method rehearsal, salary negotiation strategies, and high-impact verbal frameworks.",
    icon: Sparkles,
    color: "amber",
    badge: "Negotiation Guide",
    systemInstruction: "You are an Executive Leadership and behavioral interview preparer. Teach the user to structure their experiences using Situation, Task, Action, Result (STAR). Audit their mock questions, prompt with realistic tech management scenarios, and teach positive compensation negotiation steps.",
    starters: [
      "Let's practice! Ask me a challenging behavioral question about resolving major conflicts in cross-functional squads.",
      "Explain how to structure a response for: 'What is your greatest technical oversight and what did you learn?'",
      "What are the best verbal scripts to counter-propose a salary offer without sounding defensive?"
    ]
  }
];

export default function ChatCoachPage() {
  const [activeRoleId, setActiveRoleId] = useState<string>("mentor");
  const [selectedModel, setSelectedModel] = useState<string>("gemini-3.5-flash");
  
  // Initialize dialogue with welcome text matching the chosen role
  const [chatHistory, setChatHistory] = useState<Record<string, ChatMessage[]>>({
    mentor: [
      {
        id: "init-m",
        role: "assistant",
        text: "Hi there! I am your Technical Architecture Mentor. Let's design scalable systems, review database schemas, or plan API boundaries. What stack are you hacking on today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ],
    resume: [
      {
        id: "init-r",
        role: "assistant",
        text: "Greetings! I'm your Resume and Portfolio Coach. Let's replace generic 'responsible for' bullet points with quantified engineering triumphs. Copy in any summary or draft bullet to begin!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ],
    behavioral: [
      {
        id: "init-b",
        role: "assistant",
        text: "Welcome to behavioral prep. I will help you master the STAR method. Choose a topic or ask me to mock-interview you, and let's craft stellar, leader-caliber answers.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]
  });

  const [inputText, setInputText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>("");
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, activeRoleId, isLoading]);

  const activeRole = COACH_ROLES.find(r => r.id === activeRoleId) || COACH_ROLES[0];
  const listMessages = chatHistory[activeRoleId] || [];

  const handleSendMessage = async (customPrompt?: string) => {
    const promptToSend = (customPrompt || inputText).trim();
    if (!promptToSend) return;

    if (!customPrompt) {
      setInputText("");
    }
    setErrorText("");

    // Create unique user ID for this message
    const userMsg: ChatMessage = {
      id: `msg-u-${Date.now()}`,
      role: "user",
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update active role's local history array
    const updatedMessages = [...listMessages, userMsg];
    setChatHistory(prev => ({
      ...prev,
      [activeRoleId]: updatedMessages
    }));

    setIsLoading(true);

    try {
      // Map frontend chat format into server payload
      const serverPayload = updatedMessages.map(msg => ({
        role: msg.role === "user" ? "user" : "assistant",
        text: msg.text
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: serverPayload,
          systemInstruction: activeRole.systemInstruction,
          model: selectedModel
        })
      });

      if (!res.ok) {
        throw new Error(`API returned an error state: ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `msg-a-${Date.now()}`,
        role: "assistant",
        text: data.text || "I was unable to compile a response.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatHistory(prev => ({
        ...prev,
        [activeRoleId]: [...updatedMessages, assistantMsg]
      }));

    } catch (err: any) {
      console.error("Failed to generate chat response:", err);
      setErrorText("Failed to compile advice. Check if server backend is configured properly.");
      
      const errorMsg: ChatMessage = {
        id: `msg-e-${Date.now()}`,
        role: "assistant",
        text: `⚠️ **System Compilation Error**: I was unable to connect to the custom multi-agent routing loop. Please verify your internet connection or try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatHistory(prev => ({
        ...prev,
        [activeRoleId]: [...updatedMessages, errorMsg]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setErrorText("");
    setInputText("");
    setChatHistory(prev => {
      let welcomeMsg = "";
      if (activeRoleId === "mentor") {
        welcomeMsg = "Hi there! I am your Technical Architecture Mentor. Let's design scalable systems, review database schemas, or plan API boundaries. What stack are you hacking on today?";
      } else if (activeRoleId === "resume") {
        welcomeMsg = "Greetings! I'm your Resume and Portfolio Coach. Let's replace generic 'responsible for' bullet points with quantified engineering triumphs. Copy in any summary or draft bullet to begin!";
      } else {
        welcomeMsg = "Welcome to behavioral prep. I will help you master the STAR method. Choose a topic or ask me to mock-interview you, and let's craft stellar, leader-caliber answers.";
      }

      return {
        ...prev,
        [activeRoleId]: [
          {
            id: `init-reset-${Date.now()}`,
            role: "assistant",
            text: welcomeMsg,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      };
    });
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <span className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-semibold px-2 py-1 rounded text-[10px] tracking-wider uppercase font-mono mb-2">
            <Cpu className="w-3.5 h-3.5" />
            SYNAPSE-COACH A-05
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Conversational AI Coach
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 max-w-2xl">
            Interact with specialized agent personas backed by multi-turn memory to simulate technical interviews, optimize your portfolio, or map high-throughput cloud architectures.
          </p>
        </div>

        {/* Model option configurator */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono uppercase">
            Model:
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="text-xs font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-lg p-1 px-1.5 focus:outline-none cursor-pointer"
          >
            <option value="gemini-3.5-flash">Gemini 3.5 Flash (Balanced)</option>
            <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Analytical)</option>
            <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash-Lite (Fast)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Profile/Role configurations pane (3 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
              Select Coach Persona
            </h3>

            <div className="space-y-2.5">
              {COACH_ROLES.map((role) => {
                const Icon = role.icon;
                const isSelected = activeRoleId === role.id;
                
                const activeBorder = isSelected 
                  ? role.id === "mentor" ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 text-indigo-950 dark:text-indigo-100"
                    : role.id === "resume" ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-100"
                    : "border-amber-500 bg-amber-50/20 dark:bg-amber-950/20 text-amber-950 dark:text-amber-100"
                  : "border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300";

                return (
                  <button
                    key={role.id}
                    onClick={() => setActiveRoleId(role.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-start gap-3 relative overflow-hidden group ${activeBorder}`}
                  >
                    <span className={`p-2 rounded-lg shrink-0 flex items-center justify-center ${
                      isSelected
                        ? role.id === "mentor" ? "bg-indigo-600 text-white"
                          : role.id === "resume" ? "bg-emerald-600 text-white"
                          : "bg-amber-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs uppercase tracking-wide">
                          {role.title}
                        </h4>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${
                          role.id === "mentor" ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-400"
                            : role.id === "resume" ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400"
                            : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400"
                        }`}>
                          {role.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {role.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-100 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/65 rounded-2xl p-4 text-xs space-y-3">
            <h4 className="font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5 font-sans">
              <Award className="w-4 h-4 text-amber-500" /> Professional Guardrails
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-405 leading-relaxed">
              These conversation systems leverage memory streams. Changing personas will keep their respective sessions intact, so you can dynamically swap between resume edits and system architecture design without losing place.
            </p>
          </div>
        </div>

        {/* Chat Thread Panel (8 cols) */}
        <div className="lg:col-span-8 flex flex-col h-[580px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          {/* Active Coach Banner Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20 shrink-0">
            <div className="flex items-center gap-2.5">
              <span className={`p-1.5 rounded-lg text-white font-bold flex items-center justify-center ${
                activeRole.id === "mentor" ? "bg-indigo-600"
                  : activeRole.id === "resume" ? "bg-emerald-600"
                  : "bg-amber-600"
              }`}>
                {(() => {
                  const Icon = activeRole.icon;
                  return <Icon className="w-4 h-4" />;
                })()}
              </span>
              <div>
                <h3 className="font-extrabold text-slate-905 dark:text-white text-xs uppercase tracking-wide">
                  Active Connection: {activeRole.title}
                </h3>
                <span className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-bold">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  STATEFUL CHANNEL ONLINE (PORT 3000 API)
                </span>
              </div>
            </div>

            <button
              onClick={handleResetChat}
              title="Reset Conversation History"
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Message Stream */}
          <div 
            ref={scrollRef}
            className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/30 dark:bg-slate-950/5"
          >
            {listMessages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"} items-start gap-2.5 max-w-[85%] ${
                    isUser ? "ml-auto" : "mr-auto"
                  }`}
                >
                  {!isUser && (
                    <div className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-705 dark:text-slate-302 rounded-lg shrink-0">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className={`p-3.5 rounded-2xl text-xs leading-relaxed font-sans shadow-sm ${
                      isUser
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 rounded-tr-none"
                        : "bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800/80 rounded-tl-none"
                    }`}>
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      ) : (
                        <div className="markdown-body text-slate-800 dark:text-slate-200">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                    <span className="block text-[9px] text-slate-400 font-mono text-right scale-90 px-1">
                      {msg.timestamp}
                    </span>
                  </div>

                  {isUser && (
                    <div className="p-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 rounded-lg shrink-0">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start items-center gap-2.5 max-w-[85%] mr-auto">
                <div className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg shrink-0 animate-bounce">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 bg-white dark:bg-slate-950 text-slate-400 border border-slate-200 dark:border-slate-800/80 rounded-2xl rounded-tl-none font-mono text-[11px] flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
                    <span className="inline-block w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping [animation-delay:0.2s]"></span>
                    <span className="inline-block w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping [animation-delay:0.4s]"></span>
                  </span>
                  Synapse Advisor formulating insights...
                </div>
              </div>
            )}

            {errorText && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/35 text-rose-800 dark:text-rose-400 rounded-xl text-xs text-center font-semibold">
                {errorText}
              </div>
            )}
          </div>

          {/* Starter Quick Chips (scrollable horizontally if needed) */}
          <div className="p-2 border-t border-slate-200/60 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-950/30 flex items-center gap-1.5 overflow-x-auto select-none shrink-0 no-scrollbar">
            <span className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase shrink-0 px-1 inline-flex items-center gap-0.5">
              <Zap className="w-3 h-3 text-amber-500" /> Starters:
            </span>
            {activeRole.starters.map((starter, itemIdx) => (
              <button
                key={itemIdx}
                disabled={isLoading}
                onClick={() => handleSendMessage(starter)}
                className="text-[10px] font-semibold text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap cursor-pointer transition-all disabled:opacity-50 active:scale-95"
              >
                {starter.length > 50 ? `${starter.slice(0, 48)}...` : starter}
              </button>
            ))}
          </div>

          {/* Input text controls */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputText}
              disabled={isLoading}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Query your Coach (${activeRole.title})...`}
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-sans"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-2.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-950 rounded-xl flex items-center justify-center transition-colors font-semibold shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
