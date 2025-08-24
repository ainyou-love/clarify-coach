import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { AIProvider, PracticeInput, FeedbackResponse, AIError } from '../types';
import { FEEDBACK_GENERATION_PROMPT, TOPIC_GENERATION_PROMPT, SYSTEM_PROMPTS } from '../prompts';

export class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI;
  private model: GenerativeModel;
  private modelName = 'gemini-1.5-flash';

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GOOGLE_AI_API_KEY;
    if (!key) {
      throw new Error('Google AI API key is required');
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

      const feedbackText = response.text().trim();
      
      // Parse JSON response
      let feedbackData: FeedbackResponse;
      try {
        feedbackData = JSON.parse(feedbackText);
      } catch (parseError) {
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