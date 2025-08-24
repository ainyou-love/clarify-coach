import { PracticeInput } from './types';

export const FEEDBACK_GENERATION_PROMPT = (input: PracticeInput) => `
You are a professional communication coach specializing in helping people improve their communication skills for various contexts (presentations, meetings, interviews, etc.).

Analyze the following communication practice session where the user practiced CONCISE communication:

**Topic Scenario:** ${input.topic}
**Communication Goal (max 100 chars):** ${input.goal}
**Main Points (each max 50 chars):** ${input.mainPoints.join(', ')}
**Concise Pitch (max 150 chars):** ${input.pitch}

IMPORTANT: This is a CONCISENESS exercise. The user was given a detailed scenario and asked to summarize it within strict character limits:
- Goal: 100 characters maximum
- Each Main Point: 50 characters maximum  
- Pitch: 150 characters maximum

Your improved versions MUST demonstrate even BETTER conciseness within these same limits.

Please provide feedback in the following JSON format (respond with valid JSON only, no markdown formatting):

{
  "score": [number between 1-10],
  "strengths": [
    "specific strength about their concise communication",
    "specific strength about clarity or structure",
    "specific strength about impact or effectiveness"
  ],
  "improvements": [
    "how to be even more concise while maintaining clarity",
    "how to better prioritize key information",
    "how to improve word choice for maximum impact"
  ],
  "improvedVersions": {
    "topic": "ultra-concise topic (max 100 chars)",
    "mainPoints": [
      "point 1 - max 50 chars",
      "point 2 - max 50 chars",
      "point 3 - max 50 chars"
    ],
    "pitch": "concise, impactful pitch - max 150 chars"
  }
}

Evaluation criteria:
- CONCISENESS: How well they conveyed the message within limits
- CLARITY: Whether the core message is clear despite brevity
- PRIORITIZATION: Did they focus on the most important points?
- IMPACT: Does the short message still persuade/inform effectively?
- STRUCTURE: Logical flow even in condensed form

Remember: The improved versions should show mastery of concise communication - using fewer words for greater impact.
`;

export const TOPIC_GENERATION_PROMPT = (role: string) => `
Generate a DETAILED, realistic communication scenario for someone in the "${role}" role to practice CONCISE communication.

The scenario should be:
- A complex situation with multiple details and context
- 200-300 characters long (detailed enough that summarizing it will be challenging)
- Include specific stakeholders, problems, constraints, and desired outcomes
- Realistic and commonly encountered in this role

IMPORTANT: Make the scenario intentionally detailed and verbose. The user will practice by summarizing this into concise communication.

Examples of detailed scenarios:
- Software Engineer: "You need to explain to the VP of Sales why the new CRM integration will be delayed by 3 weeks due to unexpected API limitations discovered during testing, while also proposing an interim solution using webhooks that could deliver 70% of the functionality by the original deadline, but you need their buy-in to reduce scope."
- Marketing Manager: "Q3 campaign underperformed by 23% on lead generation despite 15% budget increase, primarily due to iOS privacy changes affecting attribution. You must present this to the board while requesting an additional $50K for Q4 to test new channels including podcast advertising and LinkedIn sponsored content."
- Product Manager: "Customer churn increased 18% last month due to a competitor's new feature. You need engineering to pause their current roadmap and build a similar feature in 4 weeks, but the team is already committed to a major infrastructure upgrade that the CTO considers critical for scalability."

Respond with ONLY the detailed scenario text (200-300 chars), no additional formatting or labels.
`;

export const SYSTEM_PROMPTS = {
  anthropic: "You are a professional communication coach. Provide helpful, specific, and actionable feedback to improve communication skills.",
  gemini: "You are an expert communication coach specializing in professional development. Your feedback should be constructive, detailed, and practical."
} as const;