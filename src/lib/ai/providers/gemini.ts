import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { AIProvider, PracticeInput, FeedbackResponse, AIError } from '../types';
import { FEEDBACK_GENERATION_PROMPT, TOPIC_GENERATION_PROMPT, SYSTEM_PROMPTS } from '../prompts';

export class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI;
  private model: GenerativeModel;
  private modelName = 'gemini-1.5-flash';

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    if (!key) {
      throw new Error('Gemini API key is required (set GEMINI_API_KEY or GOOGLE_AI_API_KEY)');
    }

    this.client = new GoogleGenerativeAI(key);
    this.model = this.client.getGenerativeModel({ 
      model: this.modelName,
      systemInstruction: SYSTEM_PROMPTS.gemini,
    });
  }

  async generateFeedback(input: PracticeInput): Promise<FeedbackResponse> {
    try {
      const prompt = FEEDBACK_GENERATION_PROMPT(input);

      // Debug log the input
      if (process.env.NODE_ENV === 'development') {
        console.log('[Gemini] Input:', JSON.stringify(input, null, 2));
        console.log('[Gemini] Prompt sent:', prompt);
      }

      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3, // Lower temperature for more consistent structured output
          maxOutputTokens: 4000,
          candidateCount: 1,
        },
      });

      const response = result.response;
      
      if (!response || !response.text) {
        throw this.createAIError('No response received from Gemini', 'NO_RESPONSE');
      }

      let feedbackText = response.text().trim();
      
      // Debug log the raw response
      if (process.env.NODE_ENV === 'development') {
        console.log('[Gemini] Raw response:', feedbackText);
      }

      // Clean up the response - remove markdown code blocks if present
      // Handle multiple formats: ```json, ```, or just raw JSON
      if (feedbackText.startsWith('```')) {
        // Remove opening code block (with or without 'json' label)
        feedbackText = feedbackText.replace(/^```(?:json)?\s*\n?/, '');
        // Remove closing code block
        feedbackText = feedbackText.replace(/\n?```\s*$/, '');
        // Trim any remaining whitespace
        feedbackText = feedbackText.trim();
      }
      
      // Parse JSON response
      let feedbackData: FeedbackResponse;
      try {
        feedbackData = JSON.parse(feedbackText);
        
        // Debug log the parsed response
        if (process.env.NODE_ENV === 'development') {
          console.log('[Gemini] Parsed response:', JSON.stringify(feedbackData, null, 2));
        }
      } catch (parseError) {
        // Log the exact text that failed to parse for debugging
        console.error('[Gemini] Failed to parse JSON. Text was:', feedbackText);
        throw this.createAIError(
          `Failed to parse Gemini response as JSON: ${parseError}`,
          'PARSE_ERROR'
        );
      }

      // Validate required fields
      this.validateFeedbackResponse(feedbackData);

      return feedbackData;
    } catch (error) {
      if (error instanceof AIError) {
        throw error;
      }

      if (error instanceof Error) {
        // Check for specific Gemini errors
        if (error.message.includes('quota') || error.message.includes('rate limit')) {
          throw this.createAIError(
            'Gemini rate limit or quota exceeded',
            'RATE_LIMIT',
            true
          );
        }
        
        if (error.message.includes('SAFETY') || error.message.includes('blocked')) {
          throw this.createAIError(
            'Content was blocked by Gemini safety filters',
            'SAFETY_FILTER'
          );
        }

        if (error.message.includes('API_KEY')) {
          throw this.createAIError(
            'Invalid Gemini API key',
            'INVALID_API_KEY'
          );
        }

        throw this.createAIError(
          `Gemini API error: ${error.message}`,
          'API_ERROR',
          true
        );
      }

      throw this.createAIError(
        'Unknown error occurred with Gemini provider',
        'UNKNOWN_ERROR',
        true
      );
    }
  }

  async generateTopic(role: string): Promise<string> {
    try {
      const prompt = TOPIC_GENERATION_PROMPT(role);

      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7, // Higher temperature for more creative topic generation
          maxOutputTokens: 200,
          candidateCount: 1,
        },
      });

      const response = result.response;
      
      if (!response || !response.text) {
        throw this.createAIError('No response received from Gemini', 'NO_RESPONSE');
      }

      const topic = response.text().trim();
      
      if (!topic || topic.length < 10) {
        throw this.createAIError('Generated topic is too short or empty', 'INVALID_RESPONSE');
      }

      return topic;
    } catch (error) {
      if (error instanceof AIError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.message.includes('quota') || error.message.includes('rate limit')) {
          throw this.createAIError(
            'Gemini rate limit or quota exceeded',
            'RATE_LIMIT',
            true
          );
        }

        if (error.message.includes('SAFETY') || error.message.includes('blocked')) {
          throw this.createAIError(
            'Content was blocked by Gemini safety filters',
            'SAFETY_FILTER'
          );
        }

        throw this.createAIError(
          `Gemini API error: ${error.message}`,
          'API_ERROR',
          true
        );
      }

      throw this.createAIError(
        'Unknown error occurred with Gemini provider',
        'UNKNOWN_ERROR',
        true
      );
    }
  }

  private validateFeedbackResponse(response: any): asserts response is FeedbackResponse {
    if (!response || typeof response !== 'object') {
      throw this.createAIError('Response is not an object', 'VALIDATION_ERROR');
    }

    if (typeof response.score !== 'number' || response.score < 1 || response.score > 10) {
      throw this.createAIError('Score must be a number between 1-10', 'VALIDATION_ERROR');
    }

    if (!Array.isArray(response.strengths) || response.strengths.length === 0) {
      throw this.createAIError('Strengths must be a non-empty array', 'VALIDATION_ERROR');
    }

    if (!Array.isArray(response.improvements) || response.improvements.length === 0) {
      throw this.createAIError('Improvements must be a non-empty array', 'VALIDATION_ERROR');
    }

    if (!response.improvedVersions || typeof response.improvedVersions !== 'object') {
      throw this.createAIError('ImprovedVersions must be an object', 'VALIDATION_ERROR');
    }

    const { improvedVersions } = response;
    if (typeof improvedVersions.topic !== 'string' || !improvedVersions.topic.trim()) {
      throw this.createAIError('ImprovedVersions.topic must be a non-empty string', 'VALIDATION_ERROR');
    }

    if (!Array.isArray(improvedVersions.mainPoints) || improvedVersions.mainPoints.length === 0) {
      throw this.createAIError('ImprovedVersions.mainPoints must be a non-empty array', 'VALIDATION_ERROR');
    }

    if (typeof improvedVersions.pitch !== 'string' || !improvedVersions.pitch.trim()) {
      throw this.createAIError('ImprovedVersions.pitch must be a non-empty string', 'VALIDATION_ERROR');
    }
  }

  private createAIError(message: string, code: string, retryable: boolean = false): AIError {
    return new AIError(message, 'gemini', code, retryable);
  }
}