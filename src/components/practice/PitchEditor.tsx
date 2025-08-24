"use client"

import { useMemo } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

interface PitchEditorProps {
  value: string
  onChange: (pitch: string) => void
  maxLength?: number
  error?: string
}

export function PitchEditor({ value, onChange, maxLength = 150, error }: PitchEditorProps) {
  const stats = useMemo(() => {
    const charCount = value.length
    const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0
    const remainingChars = maxLength - charCount
    
    return {
      charCount,
      wordCount,
      remainingChars,
      isNearLimit: remainingChars <= 30,
      isOverLimit: remainingChars < 0
    }
  }, [value, maxLength])

  return (
    <Card>
      <CardHeader>
        <CardTitle>One-Breath Pitch</CardTitle>
        <CardDescription>
          <strong className="text-primary">Ultimate Conciseness Test:</strong> Condense the entire scenario into 150 chars max. Make every word count!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pitch-editor">Your ultra-concise pitch (max {maxLength} chars)</Label>
          <Textarea
            id="pitch-editor"
            placeholder="e.g., Q3: +25% revenue. Need $50K tech investment to maintain lead. Team ready. Approval needed by Friday."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              "min-h-[100px] resize-none",
              error && "border-destructive"
            )}
            maxLength={maxLength}
          />
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {stats.wordCount} {stats.wordCount === 1 ? 'word' : 'words'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              ~{Math.ceil(stats.wordCount / 2.5)}s to speak
            </span>
          </div>
          
          <div className="flex items-center gap-2 ml-auto">
            <span className={cn(
              "font-medium",
              stats.isNearLimit && !stats.isOverLimit && "text-orange-500",
              stats.isOverLimit && "text-destructive"
            )}>
              {stats.remainingChars} characters remaining
            </span>
          </div>
        </div>

        {error && (
          <div className="text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
          <div className="text-sm">
            <div className="font-medium mb-1 text-amber-800">🎯 Conciseness Tips:</div>
            <ul className="text-amber-700 space-y-1 list-disc list-inside">
              <li>Remove all filler words (very, really, just, etc.)</li>
              <li>Use numbers instead of words (3 vs three)</li>
              <li>Replace phrases with single words</li>
              <li>Focus on WHAT and WHY, skip the HOW</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}