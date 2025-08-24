import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/prisma';
import { aiRouter } from '@/lib/ai';
import { PracticeInput, FeedbackResponse } from '@/lib/ai/types';

// Request validation schema
const practiceSubmissionSchema = z.object({
  topic: z.string().min(1, 'Topic is required').max(500, 'Topic too long'),
  goal: z.string().min(1, 'Goal is required').max(500, 'Goal too long'),
  mainPoints: z.array(z.string()).min(1, 'At least one main point is required').max(10, 'Too many main points'),
  pitch: z.string().min(10, 'Pitch must be at least 10 characters').max(5000, 'Pitch too long'),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = practiceSubmissionSchema.parse(body);

    const practiceInput: PracticeInput = {
      topic: validatedData.topic,
      goal: validatedData.goal,
      mainPoints: validatedData.mainPoints,
      pitch: validatedData.pitch,
    };

    // Generate feedback using AI router
    let feedback: FeedbackResponse;
    try {
      feedback = await aiRouter.generateFeedback(practiceInput);
    } catch (aiError) {
      console.error('AI feedback generation failed:', aiError);
      return NextResponse.json(
        { 
          error: 'Unable to generate feedback at this time. Please try again later.',
          details: aiError instanceof Error ? aiError.message : 'Unknown AI error'
        },
        { status: 503 }
      );
    }

    // Validate score is within expected range
    if (feedback.score < 1 || feedback.score > 10) {
      console.warn('Invalid score received from AI:', feedback.score);
      feedback.score = Math.max(1, Math.min(10, feedback.score));
    }

    // Save practice session to database
    const practiceSession = await prisma.practiceSession.create({
      data: {
        userId: session.user.id,
        topic: validatedData.topic,
        goal: validatedData.goal,
        mainPoints: JSON.stringify(validatedData.mainPoints),
        pitch: validatedData.pitch,
        score: Math.round(feedback.score),
        feedback: JSON.stringify(feedback),
      },
    });

    // Update user progress
    await updateUserProgress(session.user.id, Math.round(feedback.score));

    // Return feedback response
    const responseData = {
      sessionId: practiceSession.id,
      feedback: {
        score: feedback.score,
        strengths: feedback.strengths,
        improvements: feedback.improvements,
        improvedVersions: feedback.improvedVersions,
        original: {
          topic: validatedData.topic,
          mainPoints: validatedData.mainPoints,
          pitch: validatedData.pitch,
        },
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Practice submission error:', error);

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

async function updateUserProgress(userId: string, newScore: number) {
  try {
    // Get current progress or create if doesn't exist
    const currentProgress = await prisma.userProgress.findUnique({
      where: { userId },
    });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (currentProgress) {
      // Calculate new streak
      let newStreak = currentProgress.streak;
      const lastPracticeDate = currentProgress.lastPracticeDate;
      
      if (lastPracticeDate) {
        const lastPracticeDay = new Date(
          lastPracticeDate.getFullYear(),
          lastPracticeDate.getMonth(),
          lastPracticeDate.getDate()
        );
        
        const daysDiff = Math.floor((today.getTime() - lastPracticeDay.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          // Consecutive day, increment streak
          newStreak += 1;
        } else if (daysDiff > 1) {
          // Streak broken, reset to 1
          newStreak = 1;
        }
        // If same day (daysDiff === 0), keep current streak
      } else {
        // First practice, start streak
        newStreak = 1;
      }

      // Calculate new average score
      const totalSessions = currentProgress.totalSessions + 1;
      const currentTotal = currentProgress.averageScore * currentProgress.totalSessions;
      const newAverageScore = (currentTotal + newScore) / totalSessions;

      // Update progress
      await prisma.userProgress.update({
        where: { userId },
        data: {
          streak: newStreak,
          totalSessions: totalSessions,
          averageScore: newAverageScore,
          lastPracticeDate: now,
        },
      });
    } else {
      // Create new progress record
      await prisma.userProgress.create({
        data: {
          userId,
          streak: 1,
          totalSessions: 1,
          averageScore: newScore,
          lastPracticeDate: now,
        },
      });
    }
  } catch (error) {
    console.error('Error updating user progress:', error);
    // Don't throw error here - progress update failure shouldn't fail the whole request
  }
}