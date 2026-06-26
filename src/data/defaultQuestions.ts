import { Question } from "../types";

export const DEFAULT_QUESTIONS: Question[] = [
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
