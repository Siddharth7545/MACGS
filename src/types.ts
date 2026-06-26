export type UserType = "student" | "graduate" | "career_changer" | "job_seeker" | "admin";

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
  userType: UserType;
  profile: UserProfile;
  profileAnalyzed?: boolean;
}

export interface Question {
  id: string;
  category: "aptitude" | "interests" | "personality";
  text: string;
  options: { label: string; value: string }[];
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
  questions?: Question[];
}

export interface CareerRecommendation {
  role: string;
  confidenceScore: number;
  matchPercentage: number;
  justification: string;
  matchedSkills: string[];
  missingSkills: string[];
  demandLevel: "High" | "Medium" | "Low";
}

export interface LearningResource {
  title: string;
  platform: string;
  url: string;
  type: "course" | "video" | "book" | "documentation";
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

export interface SystemConfig {
  platformName: string;
  maintenanceMode: boolean;
  defaultModel: string;
}

export interface CompositeReport {
  userId: string;
  userName: string;
  email: string;
  userType: UserType;
  profileSummary: UserProfile;
  assessmentResult: {
    score: number;
    aptitudeScore: number;
    personalityType: string;
    analysisText: string;
    completedAt: string;
  } | null;
  recommendedPaths: CareerRecommendation[];
  currentRoadmap: {
    role: string;
    progressPct: number;
    milestonesCount: number;
    startedAt: string;
  } | null;
  interviewPerformance: {
    role: string;
    questionsCount: number;
    averageScore: number;
  } | null;
  compiledAt: string;
  systemCertificateId: string;
}
