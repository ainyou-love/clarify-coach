import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const practiceSession = await prisma.practiceSession.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    });

    if (!practiceSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Parse JSON strings
    const mainPoints = JSON.parse(practiceSession.mainPoints);
    const feedback = JSON.parse(practiceSession.feedback);

    return NextResponse.json({
      id: practiceSession.id,
      topic: practiceSession.topic,
      goal: practiceSession.goal,
      mainPoints,
      pitch: practiceSession.pitch,
      score: practiceSession.score,
      feedback,
      createdAt: practiceSession.createdAt.toISOString(),
      date: practiceSession.createdAt.toISOString()
    });
  } catch (error) {
    console.error('Error fetching practice session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch practice session' },
      { status: 500 }
    );
  }
}