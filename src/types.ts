export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  role: "user" | "admin";
  createdAt: string;
}

export interface Project {
  id?: string;
  userId: string;
  name: string;
  idea: string;
  industry: string;
  city: string;
  state: string;
  country: string;
  budget: string;
  targetCustomers: string;
  stage: string;
  createdAt: string;
}

export interface MarketAnalysis {
  overview: string;
  demand: string;
  trends: string[];
  sizeEstimate: string;
}

export interface Competitor {
  name: string;
  strengths: string;
  weaknesses: string;
  advantages: string;
}

export interface CompetitorAnalysis {
  competitors: Competitor[];
}

export interface CustomerPersonas {
  demographics: string;
  interests: string[];
  incomeLevel: string;
  painPoints: string[];
  buyingBehavior: string;
}

export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface RiskAssessment {
  financial: string;
  operational: string;
  market: string;
  regulatory: string;
}

export interface ForecastPoint {
  year: string;
  value: string; // e.g. "$50,000" or numeric for graphing
}

export interface RevenueForecast {
  conservative: ForecastPoint[];
  realistic: ForecastPoint[];
  optimistic: ForecastPoint[];
}

export interface Roadmap {
  day30: string[];
  day90: string[];
  day180: string[];
}

export interface Report {
  id?: string;
  userId: string;
  projectId: string;
  projectName: string;
  score: number;
  scoreExplanation: string;
  marketAnalysis: MarketAnalysis;
  competitorAnalysis: CompetitorAnalysis;
  customerPersonas: CustomerPersonas;
  swotAnalysis: SWOTAnalysis;
  riskAssessment: RiskAssessment;
  revenueForecast: RevenueForecast;
  roadmap: Roadmap;
  investorSummary: string;
  createdAt: string;
}

export interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "alert" | "system" | "success";
  read: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id?: string;
  userId: string;
  userEmail: string;
  action: string;
  details: string;
  createdAt: string;
}

export interface SystemStats {
  totalUsers: number;
  totalReports: number;
  totalProjects: number;
  activeUsersCount: number;
  updatedAt: string;
}
