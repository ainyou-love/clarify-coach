import Anthropic from '@anthropic-ai/sdk';
import { AIProvider, PracticeInput, FeedbackResponse, AIError } from '../types';
import { FEEDBACK_GENERATION_PROMPT, TOPIC_GENERATION_PROMPT, SYSTEM_PROMPTS } from '../prompts';

export class AnthropicProvider implements AIProvider {
  private client: Anthropic;
  private model = 'claude-3-haiku-20240307';

  constructor(apiKey?: string) {
    if (!apiKey && !process.env.ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key is required');
    }

    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY!,
    });
  }

  async generateFeedback(input: PracticeInput): Promise<FeedbackResponse> {
    try {
      const prompt = FEEDBACK_GENERATION_PROMPT(input);

      // Debug log the input
      if (process.env.NODE_ENV === 'development') {
        console.log('[Anthropic] Input:', JSON.stringify(input, null, 2));
        console.log('[Anthropic] Prompt sent:', prompt);
      }

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4000,
        system: SYSTEM_PROMPTS.anthropic,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent structured output
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw this.createAIError('Invalid response type from Anthropic', 'INVALID_RESPONSE');
      }

      let feedbackText = content.text.trim();
      
      // Debug log the raw response
      if (process.env.NODE_ENV === 'development') {
        console.log('[Anthropic] Raw response:', feedbackText);
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
          console.log('[Anthropic] Parsed response:', JSON.stringify(feedbackData, null, 2));
        }
      } catch (parseError) {
        // Log the exact text that failed to parse for debugging
        console.error('[Anthropic] Failed to parse JSON. Text was:', feedbackText);
        throw this.createAIError(
          `Failed to parse Anthropic response as JSON: ${parseError}`,
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
        // Check for specific Anthropic errors
        if (error.message.includes('rate_limit')) {
          throw this.createAIError(
            'Anthropic rate limit exceeded',
            'RATE_LIMIT',
            true
          );
        }
        
        if (error.message.includes('invalid_request')) {
          throw this.createAIError(
            'Invalid request to Anthropic',
            'INVALID_REQUEST'
          );
        }

        throw this.createAIError(
          `Anthropic API error: ${error.message}`,
          'API_ERROR',
          true
        );
      }

      throw this.createAIError(
        'Unknown error occurred with Anthropic provider',
        'UNKNOWN_ERROR',
        true
      );
    }
  }

  async generateTopic(role: string): Promise<string> {
    try {
      const prompt = TOPIC_GENERATION_PROMPT(role);

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 200,
        system: SYSTEM_PROMPTS.anthropic,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7, // Higher temperature for more creative topic generation
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw this.createAIError('Invalid response type from Anthropic', 'INVALID_RESPONSE');
      }

      const topic = content.text.trim();
      
      if (!topic || topic.length < 10) {
        throw this.createAIError('Generated topic is too short or empty', 'INVALID_RESPONSE');
      }

      return topic;
    } catch (error) {
      if (error instanceof AIError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.message.includes('rate_limit')) {
          throw this.createAIError(
            'Anthropic rate limit exceeded',
            'RATE_LIMIT',
            true
          );
        }

        throw this.createAIError(
          `Anthropic API error: ${error.message}`,
          'API_ERROR',
          true
        );
      }

      throw this.createAIError(
        'Unknown error occurred with Anthropic provider',
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
    return new AIError(message, 'anthropic', code, retryable);
  }
}