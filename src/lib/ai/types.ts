// Core types for AI integration layer

export interface PracticeInput {
  topic: string;
  goal: string;
  mainPoints: string[];
  pitch: string;
}

export interface FeedbackResponse {
  score: number; // 1-10 scale
  strengths: string[];
  improvements: string[];
  improvedVersions: {
    topic: string;
    mainPoints: string[];
    pitch: string;
  };
}

export interface TopicGenerationRequest {
  role: string;
}

export interface AIProvider {
  /**
   * Generate feedback for a practice session
   */
  generateFeedback(input: PracticeInput): Promise<FeedbackResponse>;
  
  /**
   * Generate a practice topic for a specific role
   */
  generateTopic(role: string): Promise<string>;
}

export type AIProviderType = 'anthropic' | 'gemini';

export class AIError extends Error {
  provider: string;
  code: string;
  retryable: boolean;

  constructor(message: string, provider: string, code: string, retryable: boolean = false) {
    super(message);
    this.name = 'AIError';
    this.provider = provider;
    this.code = code;
    this.retryable = retryable;
  }
}

export interface AIRouterConfig {
  primaryProvider: AIProviderType;
  fallbackProvider?: AIProviderType;
  maxRetries?: number;
  timeoutMs?: number;
}