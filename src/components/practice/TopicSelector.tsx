"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
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
  const [scenarioGenerated, setScenarioGenerated] = useState(false)

  const handleSuggestTopic = async () => {
    if (!onSuggestTopic) return

    setIsGenerating(true)
    try {
      const suggestedTopic = await onSuggestTopic()
      onChange(suggestedTopic)
      setScenarioGenerated(true)
    } catch (error) {
      console.error("Failed to generate topic:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Communication Scenario</CardTitle>
        <CardDescription>
          {scenarioGenerated ? (
            <span className="text-amber-600 font-medium">
              📝 Challenge: Summarize this detailed scenario into concise communication below
            </span>
          ) : (
            "Generate a detailed scenario that you'll practice summarizing concisely"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {value && (
          <div className={`p-4 rounded-md border ${scenarioGenerated ? 'bg-amber-50 border-amber-200' : 'bg-muted'}`}>
            <Label className="text-sm font-medium mb-2 block">
              {scenarioGenerated ? '🎯 Scenario to Summarize:' : 'Current Scenario:'}
            </Label>
            <p className="text-sm leading-relaxed">{value}</p>
            {scenarioGenerated && value.length > 200 && (
              <p className="text-xs text-amber-600 mt-2 font-medium">
                ({value.length} characters - now practice condensing this below!)
              </p>
            )}
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="topic-input">
            {scenarioGenerated ? 'Edit scenario if needed' : 'Or enter your own scenario'}
          </Label>
          <Textarea
            id="topic-input"
            placeholder="Enter a detailed scenario that you'll practice summarizing. For example: You need to explain to the VP of Sales why the new CRM integration will be delayed by 3 weeks due to unexpected API limitations..."
            value={value}
            onChange={(e) => {
              onChange(e.target.value)
              setScenarioGenerated(false)
            }}
            className="min-h-[100px] resize-vertical"
          />
          {!scenarioGenerated && value && (
            <p className="text-xs text-muted-foreground">
              Scenario length: {value.length} characters
            </p>
          )}
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
                Generating detailed scenario...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Practice Scenario
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}