"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Sparkles } from "lucide-react"

interface TopicSelectorProps {
  value: string
  onChange: (topic: string) => void
  onSuggestTopic?: () => Promise<string>
}

export function TopicSelector({ value, onChange, onSuggestTopic }: TopicSelectorProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSuggestTopic = async () => {
    if (!onSuggestTopic) return

    setIsGenerating(true)
    try {
      const suggestedTopic = await onSuggestTopic()
      onChange(suggestedTopic)
    } catch (error) {
      console.error("Failed to generate topic:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Practice Topic</CardTitle>
        <CardDescription>
          Choose what you want to communicate about. This could be a presentation, meeting topic, or conversation subject.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {value && (
          <div className="p-3 bg-muted rounded-md">
            <Label className="text-sm font-medium">Current Topic:</Label>
            <p className="text-sm mt-1">{value}</p>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="topic-input">Enter your topic</Label>
          <Input
            id="topic-input"
            placeholder="e.g., Quarterly sales results, Project update, Team feedback session"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>

        {onSuggestTopic && (
          <Button
            type="button"
            variant="outline"
            onClick={handleSuggestTopic}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating topic...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Suggest a Topic
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}