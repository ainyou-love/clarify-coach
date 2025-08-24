'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/layout/Header';
import { 
  CalendarDays, 
  Star, 
  MessageSquare,
  Target,
  ArrowLeft,
  Clock,
  Download,
  Share2
} from 'lucide-react';
import { FeedbackData } from '@/types/feedback';

interface PracticeSessionDetail {
  id: string;
  topic: string;
  goal: string;
  mainPoints: string[];
  pitch: string;
  score: number;
  feedback: FeedbackData;
  createdAt: string;
  date: string;
}

export default function HistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sessionData, setSessionData] = useState<PracticeSessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessionDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/user/history/${params.id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch session details');
      }

      const data = await response.json();
      setSessionData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      window.location.href = '/auth/login';
      return;
    }

    if (params.id) {
      fetchSessionDetail();
    }
  }, [session, status, params.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const handleExport = () => {
    if (!sessionData) return;
    
    const exportData = {
      topic: sessionData.topic,
      goal: sessionData.goal,
      mainPoints: sessionData.mainPoints,
      pitch: sessionData.pitch,
      score: sessionData.score,
      feedback: sessionData.feedback,
      date: sessionData.createdAt
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `practice-session-${sessionData.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (!sessionData) return;
    
    const shareUrl = `${window.location.origin}/history/${sessionData.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Practice Session Results',
          text: `Check out my practice session - Score: ${sessionData.score}/10`,
          url: shareUrl
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container max-w-5xl mx-auto py-8 px-4">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container max-w-5xl mx-auto py-8 px-4">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <p className="text-red-600 mb-4">{error || 'Session not found'}</p>
              <Button onClick={() => router.push('/history')} variant="outline">
                Back to History
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container max-w-5xl mx-auto py-8 px-4">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push('/history')}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to History
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              size="sm"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-3">
            <MessageSquare className="h-8 w-8" />
            Practice Session Details
          </h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {formatDate(sessionData.createdAt)}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Session #{sessionData.id.slice(-6)}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Session Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Session Overview
                </span>
                <Badge className={`px-3 py-1 text-sm font-semibold ${getScoreColor(sessionData.score)}`}>
                  <Star className="h-3 w-3 mr-1" />
                  Score: {sessionData.score}/10
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Communication Scenario</h4>
                <p className="text-muted-foreground bg-muted p-3 rounded-md">
                  {sessionData.topic}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Your Goal</h4>
                <p className="text-muted-foreground bg-muted p-3 rounded-md">
                  {sessionData.goal}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Your Main Points</h4>
                <div className="space-y-2">
                  {sessionData.mainPoints.map((point, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                        {index + 1}
                      </span>
                      <span className="text-muted-foreground">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Original Submission */}
          <Card>
            <CardHeader>
              <CardTitle>Your Original Pitch</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-md">
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {sessionData.pitch}
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <span>{sessionData.pitch.length} characters</span>
                  <span>•</span>
                  <span>{sessionData.pitch.split(/\s+/).length} words</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feedback Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>AI Feedback Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Strengths */}
              <div>
                <h4 className="font-semibold mb-3 text-green-700">✅ Strengths</h4>
                <div className="space-y-2">
                  {sessionData.feedback.strengths.map((strength, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-sm">{strength}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Areas for Improvement */}
              <div>
                <h4 className="font-semibold mb-3 text-blue-700">🎯 Areas for Improvement</h4>
                <div className="space-y-2">
                  {sessionData.feedback.improvements.map((improvement, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-sm">{improvement}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Version */}
          {sessionData.feedback.improvedVersions && (
            <Card className="border-green-200 bg-green-50/30">
              <CardHeader>
                <CardTitle className="text-green-800">🚀 AI-Enhanced Version</CardTitle>
                <p className="text-sm text-green-700">
                  Here's how your communication could be improved for maximum impact
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-green-800">Enhanced Topic Summary</h4>
                  <div className="bg-green-50 border border-green-200 p-3 rounded-md">
                    <p className="text-green-800">{sessionData.feedback.improvedVersions.topic}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-green-800">Enhanced Main Points</h4>
                  <div className="space-y-2">
                    {sessionData.feedback.improvedVersions.mainPoints.map((point, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                          {index + 1}
                        </span>
                        <div className="bg-green-50 border border-green-200 p-2 rounded-md flex-1">
                          <span className="text-green-800">{point}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-green-800">Enhanced Pitch</h4>
                  <div className="bg-green-50 border border-green-200 p-4 rounded-md">
                    <p className="whitespace-pre-wrap text-green-800">
                      {sessionData.feedback.improvedVersions.pitch}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-green-700">
                      <span>{sessionData.feedback.improvedVersions.pitch.length} characters</span>
                      <span>•</span>
                      <span>{sessionData.feedback.improvedVersions.pitch.split(/\s+/).length} words</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Practice Again */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Ready to Practice Again?</h3>
              <p className="text-muted-foreground mb-4">
                Keep improving your communication skills with another practice session
              </p>
              <Button asChild size="lg">
                <a href="/practice">Start New Practice Session</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}