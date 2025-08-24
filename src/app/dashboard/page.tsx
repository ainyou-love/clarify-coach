'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/Header';
import { StreakCounter } from '@/components/dashboard/StreakCounter';
import { ScoreCard } from '@/components/dashboard/ScoreCard';
import { ProgressChart } from '@/components/dashboard/ProgressChart';
import { 
  Play, 
  History, 
  BookOpen, 
  Target, 
  CalendarDays,
  Star,
  TrendingUp,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { UserProgress } from '@/types/feedback';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      window.location.href = '/auth/login';
      return;
    }

    fetchProgress();
  }, [session, status]);

  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/user/progress');
      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }
      const data = await response.json();
      setProgress(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-red-600">{error}</p>
          </div>
          <Button onClick={fetchProgress} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const userName = session?.user?.name || 'User';
  const hasCompletedSessions = progress && progress.totalSessions > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {getGreeting()}, {userName}! 👋
          </h1>
          <p className="text-muted-foreground">
            {hasCompletedSessions 
              ? `Ready to continue your learning journey? You've completed ${progress.totalSessions} sessions so far!`
              : "Ready to start your communication improvement journey?"
            }
          </p>
        </div>

        {/* Achievement Badges */}
        {progress && progress.achievements.some(a => a.earned) && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Award className="h-5 w-5" />
              Recent Achievements
            </h2>
            <div className="flex flex-wrap gap-2">
              {progress.achievements
                .filter(achievement => achievement.earned)
                .slice(-3)
                .map(achievement => (
                  <Badge key={achievement.id} variant="secondary" className="px-3 py-1">
                    {achievement.name}
                  </Badge>
                ))
              }
            </div>
          </div>
        )}

        {/* Main Dashboard Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* Streak Counter */}
          <StreakCounter
            currentStreak={progress?.streak || 0}
            bestStreak={progress?.streak || 0}
            lastPracticeDate={progress?.lastPracticeDate}
          />

          {/* Score Card */}
          <ScoreCard
            averageScore={progress?.averageScore || 0}
            totalSessions={progress?.totalSessions || 0}
            improvementTrend={progress?.improvementTrend || 'stable'}
            recentSessions={progress?.recentSessions || []}
          />

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Sessions this week</span>
                <Badge variant="outline">
                  {progress ? Math.round(progress.practiceFrequency) : 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">User level</span>
                <Badge variant="secondary">
                  {progress?.userLevel || 'Beginner'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Last practice</span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(progress?.lastPracticeDate || null)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Quick Start Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Start Today's Practice
              </CardTitle>
              <CardDescription>
                Improve your communication skills with a focused 5-minute session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/practice">
                <Button size="lg" className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Start Practice Session
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* History Link */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Review Your History
              </CardTitle>
              <CardDescription>
                View past practice sessions and track your progress over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/history">
                <Button variant="outline" size="lg" className="w-full">
                  <History className="h-4 w-4 mr-2" />
                  View Practice History
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Progress Chart */}
        <div className="mb-8">
          <ProgressChart
            data={progress?.recentSessions || []}
            showTrend={hasCompletedSessions}
          />
        </div>

        {/* Goals Progress */}
        {progress && hasCompletedSessions && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Goal Progress
              </CardTitle>
              <CardDescription>
                Track your progress toward your learning goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Weekly Goal */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Weekly Practice Goal ({progress.goals.weeklyTarget} sessions)</span>
                    <span>{Math.round(progress.goalsProgress.weeklyProgress * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(progress.goalsProgress.weeklyProgress * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Streak Goal */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Streak Goal ({progress.goals.streakTarget} days)</span>
                    <span>{Math.round(progress.goalsProgress.streakProgress * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(progress.goalsProgress.streakProgress * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Score Goal */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Score Target ({progress.goals.scoreTarget}/10)</span>
                    <span>{Math.round(progress.goalsProgress.scoreProgress * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(progress.goalsProgress.scoreProgress * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Sessions Preview */}
        {progress && progress.recentSessions.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Recent Sessions
                </div>
                <Link href="/history">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {progress.recentSessions.slice(0, 3).map((session, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <div className="flex-1">
                      <p className="font-medium line-clamp-1">{session.topic}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <CalendarDays className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatDate(session.date)}
                        </span>
                      </div>
                    </div>
                    <Badge 
                      className={
                        session.score >= 8 ? "bg-green-100 text-green-800" :
                        session.score >= 6 ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }
                    >
                      <Star className="h-3 w-3 mr-1" />
                      {session.score}/10
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}