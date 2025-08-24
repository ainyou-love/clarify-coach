import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user progress data
    const userProgress = await prisma.userProgress.findUnique({
      where: { userId: session.user.id },
    });

    // Get recent practice sessions for additional statistics
    const recentSessions = await prisma.practiceSession.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        score: true,
        createdAt: true,
        topic: true,
      },
    });

    // Calculate additional statistics
    const totalSessions = recentSessions.length;
    let averageScore = 0;
    let streak = 0;
    let lastPracticeDate = null;

    if (userProgress) {
      averageScore = userProgress.averageScore;
      streak = userProgress.streak;
      lastPracticeDate = userProgress.lastPracticeDate;
    } else if (totalSessions > 0) {
      // Calculate average from recent sessions if no progress record exists
      const totalScore = recentSessions.reduce((sum, session) => sum + session.score, 0);
      averageScore = totalScore / totalSessions;
    }

    // Calculate practice frequency (sessions per week over last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSessionsCount = await prisma.practiceSession.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    const practiceFrequency = (recentSessionsCount / 4.3).toFixed(1); // sessions per week (30 days / 7 days)

    // Get score trend (last 5 sessions)
    const scoreTrend = recentSessions.slice(0, 5).map(session => ({
      score: session.score,
      date: session.createdAt.toISOString(),
      topic: session.topic,
    }));

    // Calculate improvement trend
    let improvementTrend = 'stable';
    if (scoreTrend.length >= 3) {
      const recentScores = scoreTrend.slice(0, 3).map(s => s.score);
      const olderScores = scoreTrend.slice(-3).map(s => s.score);
      const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
      const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;
      
      if (recentAvg > olderAvg + 0.5) {
        improvementTrend = 'improving';
      } else if (recentAvg < olderAvg - 0.5) {
        improvementTrend = 'declining';
      }
    }

    // Determine user level based on average score and total sessions
    let userLevel = 'Beginner';
    if (totalSessions >= 10 && averageScore >= 7) {
      userLevel = 'Advanced';
    } else if (totalSessions >= 5 && averageScore >= 5) {
      userLevel = 'Intermediate';
    }

    // Calculate days since last practice
    let daysSinceLastPractice = null;
    if (lastPracticeDate) {
      const today = new Date();
      const lastPractice = new Date(lastPracticeDate);
      daysSinceLastPractice = Math.floor((today.getTime() - lastPractice.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Build progress response
    const progressData = {
      // Core statistics
      totalSessions: userProgress?.totalSessions || totalSessions,
      averageScore: Math.round(averageScore * 10) / 10, // Round to 1 decimal place
      streak: streak,
      lastPracticeDate: lastPracticeDate?.toISOString() || null,
      
      // Additional insights
      practiceFrequency: parseFloat(practiceFrequency),
      improvementTrend: improvementTrend,
      userLevel: userLevel,
      daysSinceLastPractice: daysSinceLastPractice,
      
      // Recent performance
      recentSessions: scoreTrend,
      
      // Goals and milestones
      goals: {
        weeklyTarget: 3, // Sessions per week
        streakTarget: 7, // Days
        scoreTarget: 8.0, // Target average score
      },
      
      // Progress toward goals
      goalsProgress: {
        weeklyProgress: Math.min(recentSessionsCount / 3, 1), // Progress toward weekly target
        streakProgress: Math.min(streak / 7, 1), // Progress toward streak target
        scoreProgress: Math.min(averageScore / 8.0, 1), // Progress toward score target
      },
      
      // Achievements (simple badge system)
      achievements: calculateAchievements(userProgress, totalSessions, averageScore, streak),
      
      // Last updated
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(progressData);
  } catch (error) {
    console.error('User progress fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function calculateAchievements(
  userProgress: any, 
  totalSessions: number, 
  averageScore: number, 
  streak: number
): Array<{ id: string; name: string; description: string; earned: boolean; earnedAt?: string }> {
  const achievements = [
    {
      id: 'first_pitch',
      name: 'First Steps',
      description: 'Complete your first practice session',
      earned: totalSessions >= 1,
    },
    {
      id: 'five_sessions',
      name: 'Getting Started',
      description: 'Complete 5 practice sessions',
      earned: totalSessions >= 5,
    },
    {
      id: 'ten_sessions',
      name: 'Committed Learner',
      description: 'Complete 10 practice sessions',
      earned: totalSessions >= 10,
    },
    {
      id: 'high_scorer',
      name: 'Excellence Achiever',
      description: 'Maintain an average score of 8 or higher',
      earned: averageScore >= 8,
    },
    {
      id: 'week_streak',
      name: 'Consistent Practitioner',
      description: 'Practice for 7 consecutive days',
      earned: streak >= 7,
    },
    {
      id: 'month_streak',
      name: 'Dedicated Speaker',
      description: 'Practice for 30 consecutive days',
      earned: streak >= 30,
    },
  ];

  return achievements.map(achievement => ({
    ...achievement,
    earnedAt: achievement.earned ? new Date().toISOString() : undefined,
  }));
}