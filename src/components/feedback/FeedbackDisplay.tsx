'use client';

import { useState } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { ScoreDisplay } from './ScoreDisplay';
import { FeedbackPanel } from './FeedbackPanel';
import { ImprovedVersions } from './ImprovedVersions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { FeedbackData } from '@/types/feedback';

interface FeedbackDisplayProps {
  feedback?: FeedbackData;
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
}

export function FeedbackDisplay({ 
  feedback, 
  isLoading = false, 
  error, 
  onRetry 
}: FeedbackDisplayProps) {
  const [showImprovedVersions, setShowImprovedVersions] = useState(false);

  // Loading state
  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <div className="absolute inset-0 h-8 w-8 rounded-full border-2 border-blue-200 border-t-transparent animate-pulse"></div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-gray-800">
                Analyzing Your Pitch
              </h3>
              <p className="text-sm text-gray-600 max-w-md">
                Our AI is carefully reviewing your pitch and generating personalized feedback. This usually takes 10-15 seconds.
              </p>
            </div>
            <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="space-y-3">
                <div>
                  <strong>Unable to generate feedback</strong>
                  <p className="mt-1 text-sm">{error}</p>
                </div>
                {onRetry && (
                  <Button 
                    onClick={onRetry}
                    variant="outline" 
                    size="sm"
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // No feedback yet
  if (!feedback) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                No Feedback Available
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Submit your pitch to receive personalized feedback and recommendations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Score Display */}
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <ScoreDisplay score={feedback.score} showAnimation={true} />
        </div>
      </div>

      {/* Feedback Panel */}
      <FeedbackPanel 
        strengths={feedback.strengths} 
        improvements={feedback.improvements} 
      />

      {/* Improved Versions Toggle */}
      <div className="text-center">
        <Button
          onClick={() => setShowImprovedVersions(!showImprovedVersions)}
          variant={showImprovedVersions ? "default" : "outline"}
          size="lg"
          className="px-8"
        >
          {showImprovedVersions ? 'Hide' : 'Show'} Enhanced Version
        </Button>
      </div>

      {/* Improved Versions Display */}
      {showImprovedVersions && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <ImprovedVersions
            original={feedback.original}
            improved={feedback.improvedVersions}
            explanation="The enhanced version demonstrates better structure, clearer messaging, and more engaging language to improve your communication effectiveness."
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 pt-4">
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          New Practice Session
        </Button>
      </div>
    </div>
  );
}