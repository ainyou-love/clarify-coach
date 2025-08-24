'use client';

import { useState } from 'react';
import { FeedbackDisplay } from '@/components/feedback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PracticeSubmissionRequest, PracticeSubmissionResponse, TopicGenerationResponse, APIError, FeedbackData } from '@/types/feedback';

export function FeedbackIntegrationExample() {
  const [formData, setFormData] = useState<PracticeSubmissionRequest>({
    topic: '',
    goal: '',
    mainPoints: ['', '', ''],
    pitch: '',
  });

  const [feedback, setFeedback] = useState<FeedbackData | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // Generate a topic based on role
  const generateTopic = async (role: string) => {
    try {
      const response = await fetch(`/api/practice/topic?role=${encodeURIComponent(role)}`);
      if (!response.ok) {
        throw new Error('Failed to generate topic');
      }
      const data: TopicGenerationResponse = await response.json();
      setFormData(prev => ({ ...prev, topic: data.topic }));
    } catch (err) {
      console.error('Topic generation failed:', err);
      setError('Failed to generate topic. Please try again.');
    }
  };

  // Submit practice for feedback
  const submitPractice = async () => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      const response = await fetch('/api/practice/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData: APIError = await response.json();
        throw new Error(errorData.error || 'Submission failed');
      }

      const data: PracticeSubmissionResponse = await response.json();
      setFeedback(data.feedback);
    } catch (err) {
      console.error('Submission failed:', err);
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsLoading(false);
    }
  };

  const updateMainPoint = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      mainPoints: prev.mainPoints.map((point, i) => i === index ? value : point)
    }));
  };

  const resetForm = () => {
    setFormData({
      topic: '',
      goal: '',
      mainPoints: ['', '', ''],
      pitch: '',
    });
    setFeedback(undefined);
    setError(undefined);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Practice Form */}
      <Card>
        <CardHeader>
          <CardTitle>Practice Session</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Topic Generation */}
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <div className="flex gap-2">
              <Input
                id="topic"
                value={formData.topic}
                onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                placeholder="Enter your topic or generate one"
                className="flex-1"
              />
              <Select onValueChange={generateTopic}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Generate topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                  <SelectItem value="Product Manager">Product Manager</SelectItem>
                  <SelectItem value="Sales Representative">Sales Rep</SelectItem>
                  <SelectItem value="Marketing Manager">Marketing Manager</SelectItem>
                  <SelectItem value="Startup Founder">Startup Founder</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Goal */}
          <div className="space-y-2">
            <Label htmlFor="goal">Goal</Label>
            <Input
              id="goal"
              value={formData.goal}
              onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
              placeholder="What do you want to achieve with this pitch?"
            />
          </div>

          {/* Main Points */}
          <div className="space-y-2">
            <Label>Main Points</Label>
            {formData.mainPoints.map((point, index) => (
              <Input
                key={index}
                value={point}
                onChange={(e) => updateMainPoint(index, e.target.value)}
                placeholder={`Main point ${index + 1}`}
              />
            ))}
          </div>

          {/* Pitch */}
          <div className="space-y-2">
            <Label htmlFor="pitch">Your Pitch</Label>
            <Textarea
              id="pitch"
              value={formData.pitch}
              onChange={(e) => setFormData(prev => ({ ...prev, pitch: e.target.value }))}
              placeholder="Write your pitch here..."
              className="min-h-32"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button 
              onClick={submitPractice}
              disabled={isLoading || !formData.topic || !formData.goal || !formData.pitch}
              className="flex-1"
            >
              {isLoading ? 'Analyzing...' : 'Get Feedback'}
            </Button>
            <Button variant="outline" onClick={resetForm}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Display */}
      <FeedbackDisplay
        feedback={feedback}
        isLoading={isLoading}
        error={error}
        onRetry={resetForm}
      />
    </div>
  );
}