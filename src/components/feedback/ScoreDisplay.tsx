'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ScoreDisplayProps {
  score: number;
  maxScore?: number;
  showAnimation?: boolean;
}

export function ScoreDisplay({ 
  score, 
  maxScore = 10, 
  showAnimation = true 
}: ScoreDisplayProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (showAnimation) {
      setIsAnimating(true);
      const duration = 1500; // 1.5 seconds
      const steps = 30;
      const stepSize = score / steps;
      const stepDuration = duration / steps;

      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        const newScore = Math.min(stepSize * currentStep, score);
        setDisplayScore(newScore);

        if (currentStep >= steps) {
          clearInterval(interval);
          setDisplayScore(score);
          setIsAnimating(false);
        }
      }, stepDuration);

      return () => clearInterval(interval);
    } else {
      setDisplayScore(score);
    }
  }, [score, showAnimation]);

  const getScoreColor = (score: number): string => {
    if (score <= 4) return 'text-red-600';
    if (score <= 7) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getScoreBackgroundColor = (score: number): string => {
    if (score <= 4) return 'bg-red-50 border-red-200';
    if (score <= 7) return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  const getProgressColor = (score: number): string => {
    if (score <= 4) return 'bg-red-500';
    if (score <= 7) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const percentage = (displayScore / maxScore) * 100;

  return (
    <Card className={`${getScoreBackgroundColor(score)} transition-all duration-300`}>
      <CardContent className="p-6 text-center">
        <div className="space-y-4">
          {/* Main Score Display */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-800">
              Clarity Score
            </h3>
            <div className={`text-5xl font-bold ${getScoreColor(score)} transition-colors duration-300`}>
              {showAnimation ? Math.round(displayScore * 10) / 10 : score}
              <span className="text-2xl text-gray-500">/{maxScore}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full ${getProgressColor(score)} transition-all duration-1000 ease-out`}
              style={{
                width: `${percentage}%`,
                transform: isAnimating ? 'scaleX(1)' : 'scaleX(1)',
                transformOrigin: 'left',
              }}
            />
          </div>

          {/* Score Label */}
          <div className="text-sm font-medium text-gray-600">
            {score <= 4 && (
              <span className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Needs Improvement
              </span>
            )}
            {score > 4 && score <= 7 && (
              <span className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                Good Progress
              </span>
            )}
            {score > 7 && (
              <span className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Excellent
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}