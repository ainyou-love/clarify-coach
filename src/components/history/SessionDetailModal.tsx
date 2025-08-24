'use client';

import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, Target, MessageSquare, Star, Expand } from 'lucide-react';
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

interface SessionDetailModalProps {
  session: PracticeSessionDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SessionDetailModal({ session, isOpen, onClose }: SessionDetailModalProps) {
  const router = useRouter();
  
  if (!session) return null;

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

  const handleExpandToFullPage = () => {
    onClose();
    router.push(`/history/${session.id}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <MessageSquare className="h-6 w-6" />
                Practice Session Details
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2 text-base mt-2">
                <CalendarDays className="h-4 w-4" />
                {formatDate(session.createdAt)}
              </DialogDescription>
            </div>
            <Button
              onClick={handleExpandToFullPage}
              variant="outline"
              size="sm"
              className="mt-1"
            >
              <Expand className="h-4 w-4 mr-2" />
              Full Page
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="px-6 pb-6 max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Session Overview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Session Overview
                  </span>
                  <Badge className={`px-3 py-1 text-sm font-semibold ${getScoreColor(session.score)}`}>
                    <Star className="h-3 w-3 mr-1" />
                    Score: {session.score}/10
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Topic</h4>
                  <p className="text-muted-foreground bg-muted p-3 rounded-md">
                    {session.topic}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Goal</h4>
                  <p className="text-muted-foreground bg-muted p-3 rounded-md">
                    {session.goal}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Main Points</h4>
                  <div className="space-y-2">
                    {session.mainPoints.map((point, index) => (
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
                    {session.pitch}
                  </p>
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
                  <h4 className="font-semibold mb-3 text-green-700">Strengths</h4>
                  <div className="space-y-2">
                    {session.feedback.strengths.map((strength, index) => (
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
                  <h4 className="font-semibold mb-3 text-blue-700">Areas for Improvement</h4>
                  <div className="space-y-2">
                    {session.feedback.improvements.map((improvement, index) => (
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
            {session.feedback.improvedVersions && (
              <Card>
                <CardHeader>
                  <CardTitle>AI-Enhanced Version</CardTitle>
                  <DialogDescription>
                    Here's how your pitch could be improved based on the feedback
                  </DialogDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Enhanced Topic</h4>
                    <div className="bg-green-50 border border-green-200 p-3 rounded-md">
                      <p className="text-green-800">{session.feedback.improvedVersions.topic}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Enhanced Main Points</h4>
                    <div className="space-y-2">
                      {session.feedback.improvedVersions.mainPoints.map((point, index) => (
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
                    <h4 className="font-semibold mb-2">Enhanced Pitch</h4>
                    <div className="bg-green-50 border border-green-200 p-4 rounded-md">
                      <p className="whitespace-pre-wrap text-green-800">
                        {session.feedback.improvedVersions.pitch}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}