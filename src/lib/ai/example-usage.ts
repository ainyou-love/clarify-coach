/**
 * Example usage of the AI integration layer
 * This file demonstrates how to use the AI providers and router
 */

import { aiRouter, createAIRouter, PracticeInput } from './index';
import { AnthropicProvider } from './providers/anthropic';
import { GeminiProvider } from './providers/gemini';

// Example 1: Using the default router
export async function exampleUsingDefaultRouter() {
  const practiceInput: PracticeInput = {
    topic: "Presenting Q3 Sales Results",
    goal: "Convince the board to increase marketing budget",
    mainPoints: [
      "Q3 exceeded targets by 15%",
      "Customer acquisition cost decreased by 20%",
      "New market segments showing strong growth"
    ],
    pitch: "Good morning everyone. Our Q3 results show exceptional growth. We exceeded our targets by 15%, which I think is pretty good. We also saved money on customer acquisition. I think we should invest more in marketing to capitalize on this momentum."
  };

  try {
    // Generate feedback
    const feedback = await aiRouter.generateFeedback(practiceInput);
    console.log('Feedback:', feedback);

    // Generate a practice topic
    const topic = await aiRouter.generateTopic("Product Manager");
    console.log('Generated topic:', topic);
  } catch (error) {
    console.error('Error using AI router:', error);
  }
}

// Example 2: Using a specific provider directly
export async function exampleUsingSpecificProvider() {
  try {
    const anthropicProvider = new AnthropicProvider();
    
    const topic = await anthropicProvider.generateTopic("Software Engineer");
    console.log('Anthropic generated topic:', topic);
  } catch (error) {
    console.error('Error using Anthropic provider:', error);
  }
}

// Example 3: Creating a custom router configuration
export async function exampleCustomRouterConfig() {
  const customRouter = createAIRouter({
    primaryProvider: 'gemini',
    fallbackProvider: 'anthropic',
    maxRetries: 5,
    timeoutMs: 45000
  });

  console.log('Available providers:', customRouter.getAvailableProviders());
  console.log('Router config:', customRouter.getConfig());
}

// Example 4: Error handling
export async function exampleErrorHandling() {
  try {
    const result = await aiRouter.generateFeedback({
      topic: "Test Topic",
      goal: "Test Goal", 
      mainPoints: ["Point 1"],
      pitch: "Test pitch"
    });
    console.log('Success:', result);
  } catch (error) {
    if (error instanceof Error && 'provider' in error) {
      const aiError = error as any; // AIError type
      console.error(`AI Error from ${aiError.provider}: ${aiError.code} - ${aiError.message}`);
      
      if (aiError.retryable) {
        console.log('This error is retryable');
      }
    } else {
      console.error('Unknown error:', error);
    }
  }
}

// Example 5: Using in a Next.js API route
export async function exampleAPIRouteUsage(practiceInput: PracticeInput) {
  try {
    const feedback = await aiRouter.generateFeedback(practiceInput);
    
    return {
      success: true,
      data: feedback
    };
  } catch (error) {
    console.error('API Error:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}