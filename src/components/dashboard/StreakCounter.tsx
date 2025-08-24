'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Calendar, Trophy, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakCounterProps {
  currentStreak: number;
  bestStreak?: number;
  lastPracticeDate?: string | null;
  className?: string;
}

export function StreakCounter({ 
  currentStreak, 
  bestStreak = 0, 
  lastPracticeDate,
  className 
}: StreakCounterProps) {
  const getStreakLevel = (streak: number) => {
    if (streak >= 30) return { level: 'legendary', color: 'text-purple-600', bg: 'bg-purple-50', icon: Trophy };
    if (streak >= 14) return { level: 'fire', color: 'text-orange-600', bg: 'bg-orange-50', icon: Flame };
    if (streak >= 7) return { level: 'hot', color: 'text-red-600', bg: 'bg-red-50', icon: Flame };
    if (streak >= 3) return { level: 'warm', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Zap };
    return { level: 'starting', color: 'text-gray-600', bg: 'bg-gray-50', icon: Calendar };
  };

  const streakInfo = getStreakLevel(currentStreak);
  const Icon = streakInfo.icon;

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return "Start your streak today!";
    if (streak === 1) return "Great start! Keep it up!";
    if (streak < 7) return "Building momentum!";
    if (streak < 14) return "You're on fire! 🔥";
    if (streak < 30) return "Incredible consistency!";
    return "Legendary streak! 🏆";
  };

  const getDaysUntilNextMilestone = (streak: number) => {
    if (streak < 3) return 3 - streak;
    if (streak < 7) return 7 - streak;
    if (streak < 14) return 14 - streak;
    if (streak < 30) return 30 - streak;
    return null;
  };

  const nextMilestone = getDaysUntilNextMilestone(currentStreak);

  const formatLastPracticeDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={cn("h-5 w-5", streakInfo.color)} />
            Practice Streak
          </div>
          {bestStreak > currentStreak && (
            <Badge variant="outline" className="text-xs">
              Best: {bestStreak}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Streak Display */}
        <div className={cn("rounded-lg p-4 text-center", streakInfo.bg)}>
          <div className={cn("text-4xl font-bold mb-1", streakInfo.color)}>
            {currentStreak}
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            {currentStreak === 1 ? 'Day' : 'Days'}
          </div>
          <div className={cn("text-sm font-medium mt-2", streakInfo.color)}>
            {getStreakMessage(currentStreak)}
          </div>
        </div>

        {/* Progress and Information */}
        <div className="space-y-3">
          {/* Next Milestone */}
          {nextMilestone && (
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Next milestone</div>
              <div className="text-sm font-medium">
                {nextMilestone} {nextMilestone === 1 ? 'day' : 'days'} to go
                {nextMilestone + currentStreak === 7 && " for 🔥"}
                {nextMilestone + currentStreak === 14 && " for 🔥🔥"}
                {nextMilestone + currentStreak === 30 && " for 🏆"}
              </div>
            </div>
          )}

          {/* Last Practice */}
          {lastPracticeDate && (
            <div className="text-center border-t pt-3">
              <div className="text-xs text-muted-foreground mb-1">Last practice</div>
              <div className="text-sm font-medium">
                {formatLastPracticeDate(lastPracticeDate)}
              </div>
            </div>
          )}

          {/* Streak Levels Guide */}
          {currentStreak < 30 && (
            <div className="text-center border-t pt-3">
              <div className="text-xs text-muted-foreground space-y-1">
                <div>🟡 3+ days: Building • 🔥 7+ days: Hot</div>
                <div>🔥🔥 14+ days: Fire • 🏆 30+ days: Legendary</div>
              </div>
            </div>
          )}
        </div>

        {/* Achievement Badge */}
        {currentStreak >= 7 && (
          <div className="absolute top-2 right-2">
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs",
              currentStreak >= 30 ? "bg-purple-100" :
              currentStreak >= 14 ? "bg-orange-100" :
              "bg-red-100"
            )}>
              {currentStreak >= 30 ? "🏆" :
               currentStreak >= 14 ? "🔥" :
               "🔥"}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}