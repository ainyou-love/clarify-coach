import { AIProvider, AIProviderType, AIRouterConfig, PracticeInput, FeedbackResponse, AIError } from './types';
import { AnthropicProvider } from './providers/anthropic';
import { GeminiProvider } from './providers/gemini';

export class AIRouter implements AIProvider {
  private providers: Map<AIProviderType, AIProvider> = new Map();
  private config: Required<AIRouterConfig>;

  constructor(config: AIRouterConfig) {
    this.config = {
      primaryProvider: config.primaryProvider,
      fallbackProvider: config.fallbackProvider || (config.primaryProvider === 'anthropic' ? 'gemini' : 'anthropic'),
      maxRetries: config.maxRetries || 3,
      timeoutMs: config.timeoutMs || 30000,
    };

    this.initializeProviders();
  }

  async generateFeedback(input: PracticeInput): Promise<FeedbackResponse> {
    const primaryProvider = this.providers.get(this.config.primaryProvider);
    
    if (!primaryProvider) {
      throw this.createRouterError(
        `Primary provider ${this.config.primaryProvider} not available`,
        'PROVIDER_UNAVAILABLE'
      );
    }

    // Try primary provider first
    try {
      return await this.executeWithTimeout(
        () => primaryProvider.generateFeedback(input),
        this.config.timeoutMs
      );
    } catch (error) {
      console.warn(`Primary provider ${this.config.primaryProvider} failed:`, error);
      
      const aiError = error as AIError;
      // If primary fails and it's retryable, try fallback
      if (aiError instanceof AIError && aiError.retryable && this.config.fallbackProvider) {
        const fallbackProvider = this.providers.get(this.config.fallbackProvider);
        
        if (fallbackProvider) {
          try {
            console.log(`Attempting fallback to ${this.config.fallbackProvider}`);
            return await this.executeWithTimeout(
              () => fallbackProvider.generateFeedback(input),
              this.config.timeoutMs
            );
          } catch (fallbackError) {
            console.error(`Fallback provider ${this.config.fallbackProvider} also failed:`, fallbackError);
            
            // If fallback also fails, try retrying primary with exponential backoff
            return await this.retryWithBackoff(
              () => primaryProvider.generateFeedback(input),
              this.config.maxRetries
            );
          }
        }
      }

      // If not retryable or no fallback, try retrying primary
      if (aiError instanceof AIError && aiError.retryable) {
        return await this.retryWithBackoff(
          () => primaryProvider.generateFeedback(input),
          this.config.maxRetries
        );
      }

      throw error;
    }
  }

  async generateTopic(role: string): Promise<string> {
    const primaryProvider = this.providers.get(this.config.primaryProvider);
    
    if (!primaryProvider) {
      throw this.createRouterError(
        `Primary provider ${this.config.primaryProvider} not available`,
        'PROVIDER_UNAVAILABLE'
      );
    }

    // Try primary provider first
    try {
      return await this.executeWithTimeout(
        () => primaryProvider.generateTopic(role),
        this.config.timeoutMs
      );
    } catch (error) {
      console.warn(`Primary provider ${this.config.primaryProvider} failed:`, error);
      
      const aiError = error as AIError;
      // If primary fails and it's retryable, try fallback
      if (aiError instanceof AIError && aiError.retryable && this.config.fallbackProvider) {
        const fallbackProvider = this.providers.get(this.config.fallbackProvider);
        
        if (fallbackProvider) {
          try {
            console.log(`Attempting fallback to ${this.config.fallbackProvider}`);
            return await this.executeWithTimeout(
              () => fallbackProvider.generateTopic(role),
              this.config.timeoutMs
            );
          } catch (fallbackError) {
            console.error(`Fallback provider ${this.config.fallbackProvider} also failed:`, fallbackError);
            
            // If fallback also fails, try retrying primary with exponential backoff
            return await this.retryWithBackoff(
              () => primaryProvider.generateTopic(role),
              this.config.maxRetries
            );
          }
        }
      }

      // If not retryable or no fallback, try retrying primary
      if (aiError instanceof AIError && aiError.retryable) {
        return await this.retryWithBackoff(
          () => primaryProvider.generateTopic(role),
          this.config.maxRetries
        );
      }

      throw error;
    }
  }

  private initializeProviders(): void {
    try {
      // Initialize Anthropic provider if API key is available
      if (process.env.ANTHROPIC_API_KEY) {
        this.providers.set('anthropic', new AnthropicProvider());
      }

      // Initialize Gemini provider if API key is available
      if (process.env.GOOGLE_AI_API_KEY) {
        this.providers.set('gemini', new GeminiProvider());
      }

      // Ensure primary provider is available
      if (!this.providers.has(this.config.primaryProvider)) {
        throw this.createRouterError(
          `Primary provider ${this.config.primaryProvider} could not be initialized. Check API key configuration.`,
          'PROVIDER_INIT_FAILED'
        );
      }

      console.log(`AI Router initialized with ${this.providers.size} providers`);
      console.log(`Primary: ${this.config.primaryProvider}, Fallback: ${this.config.fallbackProvider}`);
    } catch (error) {
      console.error('Failed to initialize AI providers:', error);
      throw error;
    }
  }

  private async executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      operation(),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(this.createRouterError(
            `Operation timed out after ${timeoutMs}ms`,
            'TIMEOUT'
          ));
        }, timeoutMs);
      }),
    ]);
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff: 1s, 2s, 4s, etc.
        const delayMs = 1000 * Math.pow(2, attempt - 1);
        console.log(`Retry attempt ${attempt}/${maxRetries} failed. Waiting ${delayMs}ms before retry...`);
        
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    throw this.createRouterError(
      `All ${maxRetries} retry attempts failed. Last error: ${lastError?.message || 'Unknown error'}`,
      'MAX_RETRIES_EXCEEDED'
    );
  }

  private createRouterError(message: string, code: string): AIError {
    return new AIError(message, 'router', code, false);
  }

  // Utility methods for getting provider status
  public getAvailableProviders(): AIProviderType[] {
    return Array.from(this.providers.keys());
  }

  public getConfig(): Required<AIRouterConfig> {
    return { ...this.config };
  }

  public isProviderAvailable(provider: AIProviderType): boolean {
    return this.providers.has(provider);
  }
}

// Factory function to create AIRouter with environment-based configuration
export function createAIRouter(overrides: Partial<AIRouterConfig> = {}): AIRouter {
  const defaultProvider: AIProviderType = (process.env.AI_PROVIDER as AIProviderType) || 'anthropic';
  
  const config: AIRouterConfig = {
    primaryProvider: defaultProvider,
    fallbackProvider: defaultProvider === 'anthropic' ? 'gemini' : 'anthropic',
    maxRetries: 3,
    timeoutMs: 30000,
    ...overrides,
  };

  return new AIRouter(config);
}

// Export a default instance for convenience
export const aiRouter = createAIRouter();