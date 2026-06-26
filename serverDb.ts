import fs from "fs";
import path from "path";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";

// Simple database path
const DB_PATH = path.join(process.cwd(), "db.json");

export interface UserProfile {
  currentRole: string;
  targetRole: string;
  skills: string[];
  interests: string[];
  experience: string[];
  education: string[];
  certifications: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  userType: "student" | "graduate" | "career_changer" | "job_seeker" | "admin";
  status: "active" | "inactive";
  registeredAt: string;
  lastLogin: string;
  profile: UserProfile;
  profileAnalyzed?: boolean;
}

export interface Assessment {
  userId: string;
  answers: { [questionId: string]: string };
  completed: boolean;
  score: number;
  aptitudeScore: number;
  interestsScore: { [key: string]: number };
  personalityType: string;
  analysisText?: string;
  completedAt?: string;
}

export interface CareerRecommendation {
  role: string;
  confidenceScore: number;
  matchPercentage: number;
  justification: string;
  matchedSkills: string[];
  missingSkills: string[];
  demandLevel: "High" | "Medium" | "Low";
  salaryRange: string;
}

export interface SkillGap {
  skillName: string;
  severity: "Critical" | "Moderate" | "Minor";
  description: string;
  timeCommitment: string;
}

export interface LearningResource {
  title: string;
  platform: string;
  url: string;
  type: "course" | "video" | "book" | "documentation";
  durationWeeks?: number;
  completed?: boolean;
}

export interface LearningMilestone {
  week: number;
  focus: string;
  description: string;
  resources: LearningResource[];
  hoursPerWeek: number;
  completed: boolean;
}

export interface LearningRoadmap {
  userId: string;
  role: string;
  milestones: LearningMilestone[];
  skillsAcquired: string[];
  progressPct: number;
  startedAt: string;
}

export interface InterviewQuestion {
  id: string;
  type: "Technical" | "Behavioral" | "Situational";
  question: string;
  userAnswer?: string;
  score?: number;
  feedback?: string;
}

export interface InterviewSession {
  userId: string;
  role: string;
  questions: InterviewQuestion[];
  completed: boolean;
}

export interface JobMarketInsight {
  role: string;
  demandRate: string;
  salaryPercentiles: {
    p25: number;
    p50: number;
    p75: number;
  };
  topCompanies: string[];
  growthTrend: string;
  hotSkills: string[];
}

interface DatabaseSchema {
  users: User[];
  assessments: { [userId: string]: Assessment };
  recommendations: { [userId: string]: CareerRecommendation[] };
  roadmaps: { [userId: string]: LearningRoadmap };
  interviews: { [userId: string]: InterviewSession };
  jobInsights: { [roleName: string]: JobMarketInsight };
  systemConfig: {
    platformName: string;
    maintenanceMode: boolean;
    defaultModel: string;
  };
}

// Initial default database structure
const DEFAULT_DB: DatabaseSchema = {
  users: [
    {
      id: "admin",
      name: "System Admin",
      email: "admin@macgs.edu",
      passwordHash: "admin123", // Humble admin fallback
      userType: "admin",
      status: "active",
      registeredAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      profile: {
        currentRole: "System Admin",
        targetRole: "Cloud Platform Manager",
        skills: ["Security Architectures", "Server Administration", "Docker", "Express"],
        interests: ["System Orchestration", "AI Integration", "Performance Security"],
        experience: ["3 years managing college labs"],
        education: ["B.E. Computer Science"],
        certifications: ["CompTIA Security+"]
      }
    }
  ],
  assessments: {},
  recommendations: {},
  roadmaps: {},
  interviews: {},
  jobInsights: {},
  systemConfig: {
    platformName: "CAREER-MATE MACGS",
    maintenanceMode: false,
    defaultModel: "gemini-3.5-flash"
  }
};

class FileDatabase {
  private cache: DatabaseSchema | null = null;
  private usingFirestore = false;
  private firestoreDb: any = null;

  constructor() {
    this.ensureDbExists();
  }

  private ensureDbExists() {
    try {
      if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2), "utf8");
      }
    } catch (err) {
      console.error("Error creating local database file, using in-memory model", err);
    }
  }

  private read(): DatabaseSchema {
    if (this.cache) return this.cache;
    try {
      this.ensureDbExists();
      if (fs.existsSync(DB_PATH)) {
        const data = fs.readFileSync(DB_PATH, "utf8");
        this.cache = JSON.parse(data);
      } else {
        this.cache = JSON.parse(JSON.stringify(DEFAULT_DB));
      }
    } catch {
      this.cache = JSON.parse(JSON.stringify(DEFAULT_DB));
    }
    return this.cache!;
  }

  private write(data: DatabaseSchema) {
    this.cache = data;
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
    } catch (err) {
      console.error("Failed to commit database changes to disk", err);
    }
  }

  // Firestore background bootstrap & sync loop
  async initialize() {
    console.log("Using robust local file logic for database.");
    this.usingFirestore = false;
    this.cache = this.read();
  }

  // Database persistence handlers
  private removeUndefined(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(this.removeUndefined.bind(this));
    const newObj: any = {};
    for (const key in obj) {
      if (obj[key] !== undefined) {
        newObj[key] = this.removeUndefined(obj[key]);
      }
    }
    return newObj;
  }

  private persistUser(user: User) {
    if (!this.usingFirestore || !this.firestoreDb) return;
    setDoc(doc(this.firestoreDb, "users", user.id), this.removeUndefined(user)).catch((err: any) => {
      console.error("Firestore error persisting user:", err);
    });
  }

  private persistAssessment(userId: string, assessment: Assessment) {
    if (!this.usingFirestore || !this.firestoreDb) return;
    setDoc(doc(this.firestoreDb, "assessments", userId), this.removeUndefined(assessment)).catch((err: any) => {
      console.error("Firestore error persisting assessment:", err);
    });
  }

  private persistRecommendations(userId: string, recs: CareerRecommendation[]) {
    if (!this.usingFirestore || !this.firestoreDb) return;
    setDoc(doc(this.firestoreDb, "recommendations", userId), this.removeUndefined({ recs })).catch((err: any) => {
      console.error("Firestore error persisting recommendations:", err);
    });
  }

  private persistRoadmap(userId: string, roadmap: LearningRoadmap) {
    if (!this.usingFirestore || !this.firestoreDb) return;
    setDoc(doc(this.firestoreDb, "roadmaps", userId), this.removeUndefined(roadmap)).catch((err: any) => {
      console.error("Firestore error persisting roadmap:", err);
    });
  }

  private persistInterview(userId: string, interview: InterviewSession) {
    if (!this.usingFirestore || !this.firestoreDb) return;
    setDoc(doc(this.firestoreDb, "interviews", userId), this.removeUndefined(interview)).catch((err: any) => {
      console.error("Firestore error persisting interview session:", err);
    });
  }

  private persistJobInsight(insight: JobMarketInsight) {
    if (!this.usingFirestore || !this.firestoreDb) return;
    const docId = insight.role.toLowerCase().trim().replace(/[^a-z0-9]/g, "_");
    setDoc(doc(this.firestoreDb, "jobInsights", docId), this.removeUndefined(insight)).catch((err: any) => {
      console.error("Firestore error persisting job insights:", err);
    });
  }

  private persistSystemConfig(config: DatabaseSchema["systemConfig"]) {
    if (!this.usingFirestore || !this.firestoreDb) return;
    setDoc(doc(this.firestoreDb, "systemConfig", "default"), this.removeUndefined(config)).catch((err: any) => {
      console.error("Firestore error persisting system settings:", err);
    });
  }

  // User Operations
  getUsers(): User[] {
    return this.read().users;
  }

  getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  addUser(user: User) {
    const db = this.read();
    db.users.push(user);
    this.write(db);
    this.persistUser(user);
  }

  updateUserProfile(userId: string, profile: UserProfile, details?: Partial<User>) {
    const db = this.read();
    const user = db.users.find((u) => u.id === userId);
    if (user) {
      user.profile = { ...user.profile, ...profile };
      if (details) {
        if (details.name) user.name = details.name;
        if (details.userType) user.userType = details.userType;
        if (details.lastLogin) user.lastLogin = details.lastLogin;
        if (details.profileAnalyzed !== undefined) user.profileAnalyzed = details.profileAnalyzed;
      }
      this.write(db);
      this.persistUser(user);
    }
  }

  // Assessments
  getAssessment(userId: string): Assessment | undefined {
    return this.read().assessments[userId];
  }

  saveAssessment(userId: string, assessment: Assessment) {
    const db = this.read();
    db.assessments[userId] = assessment;
    this.write(db);
    this.persistAssessment(userId, assessment);
  }

  // Career Recommendations
  getRecommendations(userId: string): CareerRecommendation[] {
    return this.read().recommendations[userId] || [];
  }

  saveRecommendations(userId: string, recs: CareerRecommendation[]) {
    const db = this.read();
    db.recommendations[userId] = recs;
    this.write(db);
    this.persistRecommendations(userId, recs);
  }

  // Learning Roadmaps
  getRoadmap(userId: string): LearningRoadmap | undefined {
    return this.read().roadmaps[userId];
  }

  saveRoadmap(userId: string, roadmap: LearningRoadmap) {
    const db = this.read();
    db.roadmaps[userId] = roadmap;
    this.write(db);
    this.persistRoadmap(userId, roadmap);
  }

  updateRoadmapMilestone(userId: string, weekIndex: number, completed: boolean) {
    const db = this.read();
    const roadmap = db.roadmaps[userId];
    if (roadmap && roadmap.milestones[weekIndex]) {
      roadmap.milestones[weekIndex].completed = completed;
      roadmap.milestones[weekIndex].resources.forEach(r => r.completed = completed);
      
      const total = roadmap.milestones.length;
      const done = roadmap.milestones.filter(m => m.completed).length;
      roadmap.progressPct = total > 0 ? Math.round((done / total) * 100) : 0;
      this.write(db);
      this.persistRoadmap(userId, roadmap);
    }
  }

  updateRoadmapResource(userId: string, weekIndex: number, resourceTitle: string, completed: boolean) {
    const db = this.read();
    const roadmap = db.roadmaps[userId];
    if (roadmap && roadmap.milestones[weekIndex]) {
      const res = roadmap.milestones[weekIndex].resources.find(r => r.title === resourceTitle);
      if (res) {
        res.completed = completed;
      }
      const allResDone = roadmap.milestones[weekIndex].resources.every(r => r.completed);
      roadmap.milestones[weekIndex].completed = allResDone;

      const total = roadmap.milestones.length;
      const done = roadmap.milestones.filter(m => m.completed).length;
      roadmap.progressPct = total > 0 ? Math.round((done / total) * 100) : 0;
      this.write(db);
      this.persistRoadmap(userId, roadmap);
    }
  }

  // Interview Sessions
  getInterview(userId: string): InterviewSession | undefined {
    return this.read().interviews[userId];
  }

  saveInterview(userId: string, interview: InterviewSession) {
    const db = this.read();
    db.interviews[userId] = interview;
    this.write(db);
    this.persistInterview(userId, interview);
  }

  submitInterviewAnswer(userId: string, questionId: string, answer: string, score: number, feedback: string) {
    const db = this.read();
    const interview = db.interviews[userId];
    if (interview) {
      const q = interview.questions.find((qi) => qi.id === questionId);
      if (q) {
        q.userAnswer = answer;
        q.score = score;
        q.feedback = feedback;
      }
      this.write(db);
      this.persistInterview(userId, interview);
    }
  }

  markInterviewCompleted(userId: string) {
    const db = this.read();
    const interview = db.interviews[userId];
    if (interview) {
      interview.completed = true;
      this.write(db);
      this.persistInterview(userId, interview);
    }
  }

  // Job Insights
  getJobInsight(role: string): JobMarketInsight | undefined {
    return this.read().jobInsights[role.toLowerCase().trim()];
  }

  saveJobInsight(insight: JobMarketInsight) {
    const db = this.read();
    db.jobInsights[insight.role.toLowerCase().trim()] = insight;
    this.write(db);
    this.persistJobInsight(insight);
  }

  // Admin Config
  getSystemConfig() {
    return this.read().systemConfig;
  }

  updateSystemConfig(platformName: string, maintenanceMode: boolean) {
    const db = this.read();
    db.systemConfig.platformName = platformName;
    db.systemConfig.maintenanceMode = maintenanceMode;
    this.write(db);
    this.persistSystemConfig(db.systemConfig);
  }
}

export const fileDb = new FileDatabase();
