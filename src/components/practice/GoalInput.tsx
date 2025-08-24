"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface GoalInputProps {
  value: string
  onChange: (goal: string) => void
  maxLength?: number
  error?: string
}

export function GoalInput({ value, onChange, maxLength = 100, error }: GoalInputProps) {
  const remainingChars = maxLength - value.length
  const isNearLimit = remainingChars <= 20
  const isOverLimit = remainingChars < 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Communication Goal</CardTitle>
        <CardDescription>
          <strong className="text-primary">Conciseness Challenge:</strong> Summarize your goal in 100 characters or less. What's the ONE key outcome?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Label htmlFor="goal-input">Your concise goal (max {maxLength} chars)</Label>
        <Input
          id="goal-input"
          placeholder="e.g., Get 20% budget increase, Boost Q4 morale, Clarify new workflow"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(error && "border-destructive")}
          maxLength={maxLength}
        />
        <div className="flex justify-between items-center text-sm">
          {error ? (
            <span className="text-destructive">{error}</span>
          ) : (
            <span className="text-muted-foreground">
              💡 Tip: Remove filler words, focus on the core objective
            </span>
          )}
          <span className={cn(
            "text-muted-foreground font-medium",
            isNearLimit && !isOverLimit && "text-orange-500",
            isOverLimit && "text-destructive"
          )}>
            {remainingChars} chars left
          </span>
        </div>
      </CardContent>
    </Card>
  )
}