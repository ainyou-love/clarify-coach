import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { z } from 'zod';
import { aiRouter } from '@/lib/ai';

// Request validation schema
const topicGenerationSchema = z.object({
  role: z.string().min(1, 'Role is required').max(100, 'Role too long'),
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get and validate query parameters
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    if (!role) {
      return NextResponse.json(
        { error: 'Role parameter is required' },
        { status: 400 }
      );
    }

    const validatedData = topicGenerationSchema.parse({ role });

    // Generate topic using AI router
    let topic: string;
    try {
      topic = await aiRouter.generateTopic(validatedData.role);
    } catch (aiError) {
      console.error('AI topic generation failed:', aiError);
      return NextResponse.json(
        { 
          error: 'Unable to generate topic at this time. Please try again later.',
          details: aiError instanceof Error ? aiError.message : 'Unknown AI error'
        },
        { status: 503 }
      );
    }

    // Validate that we received a meaningful topic
    if (!topic || topic.trim().length === 0) {
      console.error('Empty topic received from AI');
      return NextResponse.json(
        { error: 'Unable to generate a valid topic. Please try again.' },
        { status: 503 }
      );
    }

    // Return the generated topic
    return NextResponse.json({
      topic: topic.trim(),
      role: validatedData.role,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Topic generation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid input data',
          details: error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`)
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = topicGenerationSchema.parse(body);

    // Generate topic using AI router
    let topic: string;
    try {
      topic = await aiRouter.generateTopic(validatedData.role);
    } catch (aiError) {
      console.error('AI topic generation failed:', aiError);
      return NextResponse.json(
        { 
          error: 'Unable to generate topic at this time. Please try again later.',
          details: aiError instanceof Error ? aiError.message : 'Unknown AI error'
        },
        { status: 503 }
      );
    }

    // Validate that we received a meaningful topic
    if (!topic || topic.trim().length === 0) {
      console.error('Empty topic received from AI');
      return NextResponse.json(
        { error: 'Unable to generate a valid topic. Please try again.' },
        { status: 503 }
      );
    }

    // Return the generated topic
    return NextResponse.json({
      topic: topic.trim(),
      role: validatedData.role,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Topic generation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid input data',
          details: error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`)
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}