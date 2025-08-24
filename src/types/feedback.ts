// Types for feedback and API responses
export interface FeedbackData {
  score: number;
  strengths: string[];
  improvements: string[];
  improvedVersions: {
    topic: string;
    mainPoints: string[];
    pitch: string;
  };
  original: {
    topic: string;
    mainPoints: string[];
    pitch: string;
  };
}

export interface PracticeSubmissionRequest {
  topic: string;
  goal: string;
  mainPoints: string[];
  pitch: string;
}

export interface PracticeSubmissionResponse {
  sessionId: string;
  feedback: FeedbackData;
}

export interface TopicGenerationRequest {
  role: string;
}

export interface TopicGenerationResponse {
  topic: string;
  role: string;
  generatedAt: string;
}

export interface UserProgress {
  totalSessions: number;
  averageScore: number;
  streak: number;
  lastPracticeDate: string | null;
  practiceFrequency: number;
  improvementTrend: 'improving' | 'stable' | 'declining';
  userLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  daysSinceLastPractice: number | null;
  recentSessions: Array<{
    score: number;
    date: string;
    topic: string;
  }>;
  goals: {
    weeklyTarget: number;
    streakTarget: number;
    scoreTarget: number;
  };
  goalsProgress: {
    weeklyProgress: number;
    streakProgress: number;
    scoreProgress: number;
  };
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    earned: boolean;
    earnedAt?: string;
  }>;
  updatedAt: string;
}

export interface APIError {
  error: string;
  details?: string | string[];
}