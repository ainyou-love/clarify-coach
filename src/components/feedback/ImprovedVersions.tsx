'use client';

import { ArrowRight, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ImprovedVersionsProps {
  original: {
    topic: string;
    mainPoints: string[];
    pitch: string;
  };
  improved: {
    topic: string;
    mainPoints: string[];
    pitch: string;
  };
  explanation?: string;
}

export function ImprovedVersions({ original, improved, explanation }: ImprovedVersionsProps) {
  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Lightbulb className="h-5 w-5" />
          Enhanced Version
        </CardTitle>
        {explanation && (
          <p className="text-sm text-purple-600 bg-purple-100 p-3 rounded-lg">
            <strong>Why this works better:</strong> {explanation}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Topic Comparison */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white">Topic</Badge>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-600">Original</h4>
              <div className="p-3 bg-gray-50 rounded-lg border">
                <p className="text-sm text-gray-800">{original.topic}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-gray-600">Improved</h4>
                <ArrowRight className="h-4 w-4 text-green-600" />
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-gray-800 font-medium">{improved.topic}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Points Comparison */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white">Main Points</Badge>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-600">Original</h4>
              <div className="space-y-2">
                {original.mainPoints.map((point, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded border text-sm">
                    {point}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-gray-600">Improved</h4>
                <ArrowRight className="h-4 w-4 text-green-600" />
              </div>
              <div className="space-y-2">
                {improved.mainPoints.map((point, index) => (
                  <div key={index} className="p-2 bg-green-50 rounded border border-green-200 text-sm font-medium">
                    {point}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pitch Comparison */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white">Pitch</Badge>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-600">Original</h4>
              <div className="p-4 bg-gray-50 rounded-lg border min-h-[120px]">
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {original.pitch}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-gray-600">Improved</h4>
                <ArrowRight className="h-4 w-4 text-green-600" />
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200 min-h-[120px]">
                <p className="text-sm text-gray-800 font-medium leading-relaxed whitespace-pre-wrap">
                  {improved.pitch}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Improvements Highlight */}
        <div className="bg-white p-4 rounded-lg border border-purple-200">
          <h4 className="text-sm font-semibold text-purple-800 mb-2 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Key Enhancements
          </h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Clearer and more engaging topic statement</li>
            <li>• Better structured main points with logical flow</li>
            <li>• Enhanced pitch with stronger opening and closing</li>
            <li>• Improved word choice and sentence structure</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}