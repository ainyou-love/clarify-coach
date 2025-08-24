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
          What do you want to achieve with your communication? Be specific about your desired outcome.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Label htmlFor="goal-input">Your goal</Label>
        <Input
          id="goal-input"
          placeholder="e.g., Get approval for budget increase, Motivate team for Q4 push, Explain new process clearly"
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
              Be specific about what you want to accomplish
            </span>
          )}
          <span className={cn(
            "text-muted-foreground",
            isNearLimit && !isOverLimit && "text-orange-500",
            isOverLimit && "text-destructive"
          )}>
            {remainingChars} characters remaining
          </span>
        </div>
      </CardContent>
    </Card>
  )
}