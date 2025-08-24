'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Star, Target, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScoreCardProps {
  averageScore: number;
  totalSessions: number;
  improvementTrend?: 'improving' | 'stable' | 'declining';
  recentSessions?: Array<{ score: number; date: string; topic: string }>;
  className?: string;
}

export function ScoreCard({ 
  averageScore, 
  totalSessions,
  improvementTrend = 'stable',
  recentSessions = [],
  className 
}: ScoreCardProps) {
  const getScoreLevel = (score: number) => {
    if (score >= 8.5) return { 
      level: 'excellent', 
      color: 'text-green-600', 
      bg: 'bg-green-50', 
      label: 'Excellent',
      emoji: '🏆'
    };
    if (score >= 7.5) return { 
      level: 'good', 
      color: 'text-blue-600', 
      bg: 'bg-blue-50', 
      label: 'Good',
      emoji: '⭐'
    };
    if (score >= 6) return { 
      level: 'improving', 
      color: 'text-yellow-600', 
      bg: 'bg-yellow-50', 
      label: 'Improving',
      emoji: '📈'
    };
    if (score >= 4) return { 
      level: 'learning', 
      color: 'text-orange-600', 
      bg: 'bg-orange-50', 
      label: 'Learning',
      emoji: '🌱'
    };
    return { 
      level: 'starting', 
      color: 'text-gray-600', 
      bg: 'bg-gray-50', 
      label: 'Getting Started',
      emoji: '🚀'
    };
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return { Icon: TrendingUp, color: 'text-green-600', label: 'Improving' };
      case 'declining':
        return { Icon: TrendingDown, color: 'text-red-600', label: 'Needs attention' };
      default:
        return { Icon: Minus, color: 'text-gray-600', label: 'Stable' };
    }
  };

  const scoreInfo = getScoreLevel(averageScore);
  const trendInfo = getTrendIcon(improvementTrend);
  const TrendIcon = trendInfo.Icon;

  const calculateRecentTrend = () => {
    if (recentSessions.length < 2) return null;
    
    const sortedSessions = [...recentSessions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const recent = sortedSessions.slice(-3);
    const older = sortedSessions.slice(0, -3).slice(-3);
    
    if (recent.length === 0 || older.length === 0) return null;
    
    const recentAvg = recent.reduce((sum, s) => sum + s.score, 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + s.score, 0) / older.length;
    
    return recentAvg - olderAvg;
  };

  const recentTrend = calculateRecentTrend();

  const getScoreMessage = (score: number) => {
    if (score >= 8.5) return "Outstanding performance! 🎉";
    if (score >= 7.5) return "Great communication skills! 👏";
    if (score >= 6) return "Making solid progress! 📈";
    if (score >= 4) return "Keep practicing, you're improving! 🌱";
    return "Every expert was once a beginner! 🚀";
  };

  const getTargetScore = (current: number) => {
    if (current >= 9) return 10;
    return Math.ceil((current + 1) * 10) / 10;
  };

  const targetScore = getTargetScore(averageScore);
  const progressToTarget = Math.min((averageScore / targetScore) * 100, 100);

  return (
    <Card className={cn("relative", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className={cn("h-5 w-5", scoreInfo.color)} />
            Average Score
          </div>
          <Badge 
            variant="outline" 
            className={cn("text-xs", trendInfo.color)}
          >
            <TrendIcon className="h-3 w-3 mr-1" />
            {trendInfo.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main Score Display */}
        <div className={cn("rounded-lg p-4 text-center", scoreInfo.bg)}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">{scoreInfo.emoji}</span>
            <div>
              <div className={cn("text-3xl font-bold", scoreInfo.color)}>
                {totalSessions === 0 ? '-' : averageScore.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">out of 10</div>
            </div>
          </div>
          <div className={cn("text-sm font-medium", scoreInfo.color)}>
            {scoreInfo.label}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {getScoreMessage(averageScore)}
          </div>
        </div>

        {totalSessions > 0 && (
          <div className="space-y-3">
            {/* Progress to Next Level */}
            {averageScore < 10 && (
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress to {targetScore}</span>
                  <span>{Math.round(progressToTarget)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={cn("h-2 rounded-full transition-all duration-500", 
                      scoreInfo.color.replace('text-', 'bg-')
                    )}
                    style={{ width: `${progressToTarget}%` }}
                  />
                </div>
              </div>
            )}

            {/* Recent Trend */}
            {recentTrend !== null && (
              <div className="text-center border-t pt-3">
                <div className="text-xs text-muted-foreground mb-1">Recent trend</div>
                <div className="flex items-center justify-center gap-2">
                  {recentTrend > 0.3 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : recentTrend < -0.3 ? (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  ) : (
                    <Minus className="h-4 w-4 text-gray-600" />
                  )}
                  <span className={cn(
                    "text-sm font-medium",
                    recentTrend > 0.3 ? "text-green-600" :
                    recentTrend < -0.3 ? "text-red-600" :
                    "text-gray-600"
                  )}>
                    {recentTrend > 0.3 ? `+${recentTrend.toFixed(1)}` :
                     recentTrend < -0.3 ? recentTrend.toFixed(1) :
                     "Stable"}
                  </span>
                </div>
              </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4 text-center text-sm border-t pt-3">
              <div>
                <div className="text-xs text-muted-foreground">Total Sessions</div>
                <div className="font-semibold">{totalSessions}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Best Score</div>
                <div className="font-semibold">
                  {recentSessions.length > 0 ? 
                    Math.max(...recentSessions.map(s => s.score)) :
                    '-'
                  }
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No sessions message */}
        {totalSessions === 0 && (
          <div className="text-center py-4 border-t">
            <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <div className="text-sm text-muted-foreground">
              Complete practice sessions to see your average score
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}