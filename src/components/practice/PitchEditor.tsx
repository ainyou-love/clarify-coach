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
          Craft a concise summary that captures your key message in one breath. This should be punchy and memorable.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pitch-editor">Your pitch</Label>
          <Textarea
            id="pitch-editor"
            placeholder="e.g., We exceeded our revenue targets by 25% this quarter thanks to our team's dedication, and now we're perfectly positioned to lead the market with strategic technology investments."
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

        <div className="p-3 bg-muted rounded-md">
          <div className="text-sm">
            <div className="font-medium mb-1">Tips for a great one-breath pitch:</div>
            <ul className="text-muted-foreground space-y-1 list-disc list-inside">
              <li>Focus on your main benefit or outcome</li>
              <li>Use active voice and strong verbs</li>
              <li>End with a clear call to action or next step</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}