// Main exports for AI integration layer
export * from './types';
export * from './router';
export * from './prompts';
export { AnthropicProvider } from './providers/anthropic';
export { GeminiProvider } from './providers/gemini';

// Re-export the default router instance for convenience
export { aiRouter as default } from './router';