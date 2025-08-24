import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Query parameters validation schema
const historyQuerySchema = z.object({
  page: z.string().optional().default('1').transform((val) => Math.max(1, parseInt(val, 10))),
  limit: z.string().optional().default('10').transform((val) => Math.min(50, Math.max(1, parseInt(val, 10)))),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  minScore: z.string().optional().transform((val) => val ? Math.max(1, Math.min(10, parseInt(val, 10))) : undefined),
  maxScore: z.string().optional().transform((val) => val ? Math.max(1, Math.min(10, parseInt(val, 10))) : undefined),
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

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      minScore: searchParams.get('minScore') || undefined,
      maxScore: searchParams.get('maxScore') || undefined,
    };

    const validatedParams = historyQuerySchema.parse(queryParams);

    // Build filter conditions
    const whereConditions: any = {
      userId: session.user.id,
    };

    // Date range filter
    if (validatedParams.dateFrom || validatedParams.dateTo) {
      whereConditions.createdAt = {};
      
      if (validatedParams.dateFrom) {
        const fromDate = new Date(validatedParams.dateFrom);
        if (!isNaN(fromDate.getTime())) {
          whereConditions.createdAt.gte = fromDate;
        }
      }
      
      if (validatedParams.dateTo) {
        const toDate = new Date(validatedParams.dateTo);
        if (!isNaN(toDate.getTime())) {
          // Add 23:59:59 to include the entire day
          toDate.setHours(23, 59, 59, 999);
          whereConditions.createdAt.lte = toDate;
        }
      }
    }

    // Score range filter
    if (validatedParams.minScore !== undefined || validatedParams.maxScore !== undefined) {
      whereConditions.score = {};
      
      if (validatedParams.minScore !== undefined) {
        whereConditions.score.gte = validatedParams.minScore;
      }
      
      if (validatedParams.maxScore !== undefined) {
        whereConditions.score.lte = validatedParams.maxScore;
      }
    }

    // Calculate pagination
    const skip = (validatedParams.page - 1) * validatedParams.limit;

    // Get total count for pagination
    const totalCount = await prisma.practiceSession.count({
      where: whereConditions,
    });

    // Fetch practice sessions
    const sessions = await prisma.practiceSession.findMany({
      where: whereConditions,
      orderBy: { createdAt: 'desc' },
      skip: skip,
      take: validatedParams.limit,
      select: {
        id: true,
        topic: true,
        goal: true,
        mainPoints: true,
        pitch: true,
        score: true,
        feedback: true,
        createdAt: true,
      },
    });

    // Parse JSON fields and format response
    const formattedSessions = sessions.map(session => ({
      id: session.id,
      topic: session.topic,
      goal: session.goal,
      mainPoints: JSON.parse(session.mainPoints),
      pitch: session.pitch,
      score: session.score,
      feedback: JSON.parse(session.feedback),
      createdAt: session.createdAt.toISOString(),
      date: session.createdAt.toISOString().split('T')[0], // YYYY-MM-DD format
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / validatedParams.limit);
    const hasNextPage = validatedParams.page < totalPages;
    const hasPreviousPage = validatedParams.page > 1;

    // Response data
    const responseData = {
      sessions: formattedSessions,
      pagination: {
        currentPage: validatedParams.page,
        totalPages: totalPages,
        totalCount: totalCount,
        limit: validatedParams.limit,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage,
      },
      filters: {
        dateFrom: validatedParams.dateFrom || null,
        dateTo: validatedParams.dateTo || null,
        minScore: validatedParams.minScore || null,
        maxScore: validatedParams.maxScore || null,
      },
      summary: {
        totalSessions: totalCount,
        averageScore: formattedSessions.length > 0 
          ? Math.round((formattedSessions.reduce((sum, s) => sum + s.score, 0) / formattedSessions.length) * 10) / 10
          : 0,
        highestScore: formattedSessions.length > 0 ? Math.max(...formattedSessions.map(s => s.score)) : 0,
        lowestScore: formattedSessions.length > 0 ? Math.min(...formattedSessions.map(s => s.score)) : 0,
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('History fetch error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters',
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