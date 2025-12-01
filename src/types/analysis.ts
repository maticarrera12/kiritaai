export interface AnalysisInsights {
  summary: string;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  business_opportunity: {
    score: number;
    verdict: string;
    monetization_analysis: string;
    market_gap: string;
  };
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  user_personas: Array<{
    title: string;
    pain: string;
    goal: string;
  }>;
  marketing_hooks: string[];
  mvp_roadmap: Array<{
    phase: string;
    features: string[];
  }>;
  pain_points: Array<{
    title: string;
    description: string;
    frequency: "HIGH" | "MEDIUM" | "LOW";
    severity: "CRITICAL" | "HIGH" | "MEDIUM";
  }>;
  feature_requests: Array<{
    title: string;
    description: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    sentiment: "suggestion" | "demand";
  }>;
}
