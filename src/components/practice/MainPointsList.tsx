"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface MainPointsListProps {
  points: [string, string, string]
  onChange: (points: [string, string, string]) => void
  maxLength?: number
  errors?: { [key: number]: string }
}

export function MainPointsList({ points, onChange, maxLength = 50, errors = {} }: MainPointsListProps) {
  const handlePointChange = (index: number, value: string) => {
    const newPoints: [string, string, string] = [...points]
    newPoints[index] = value
    onChange(newPoints)
  }

  const getCompletionIcon = (point: string) => {
    if (point.trim().length > 0) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    }
    return <Circle className="h-4 w-4 text-muted-foreground" />
  }

  const getRemainingChars = (point: string) => maxLength - point.length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Main Points</CardTitle>
        <CardDescription>
          Identify the 3 most important points you want to communicate. Keep each point concise and focused.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {points.map((point, index) => {
          const remainingChars = getRemainingChars(point)
          const isNearLimit = remainingChars <= 10
          const isOverLimit = remainingChars < 0
          const hasError = errors[index]

          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2">
                {getCompletionIcon(point)}
                <Label htmlFor={`point-${index}`}>
                  Point {index + 1}
                </Label>
              </div>
              <Input
                id={`point-${index}`}
                placeholder={
                  index === 0 
                    ? "e.g., Our revenue grew 25% this quarter" 
                    : index === 1
                    ? "e.g., Customer satisfaction is at an all-time high"
                    : "e.g., We need to invest in new technology now"
                }
                value={point}
                onChange={(e) => handlePointChange(index, e.target.value)}
                className={cn(hasError && "border-destructive")}
                maxLength={maxLength}
              />
              <div className="flex justify-between items-center text-sm">
                {hasError ? (
                  <span className="text-destructive">{hasError}</span>
                ) : (
                  <span className="text-muted-foreground">
                    Make it specific and impactful
                  </span>
                )}
                <span className={cn(
                  "text-muted-foreground",
                  isNearLimit && !isOverLimit && "text-orange-500",
                  isOverLimit && "text-destructive"
                )}>
                  {remainingChars}/{maxLength}
                </span>
              </div>
            </div>
          )
        })}
        
        <div className="mt-4 p-3 bg-muted rounded-md">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span>Progress:</span>
            <span className="text-muted-foreground">
              {points.filter(p => p.trim().length > 0).length}/3 points completed
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}