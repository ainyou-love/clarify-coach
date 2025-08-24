'use client';

import { CheckCircle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FeedbackPanelProps {
  strengths: string[];
  improvements: string[];
}

export function FeedbackPanel({ strengths, improvements }: FeedbackPanelProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Strengths Card */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            What You Did Well
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {strengths.length > 0 ? (
              strengths.map((strength, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-100 shadow-sm"
                >
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {strength}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-100">
                <div className="flex-shrink-0">
                  <Info className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">
                  No specific strengths identified yet. Keep practicing!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Improvements Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Info className="h-5 w-5" />
            Areas for Improvement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {improvements.length > 0 ? (
              improvements.map((improvement, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-100 shadow-sm"
                >
                  <div className="flex-shrink-0 mt-1">
                    <Info className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {improvement}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">
                  Great job! No areas for improvement identified.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}