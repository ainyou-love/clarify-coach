"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Header } from "@/components/layout/Header"
import { TopicSelector } from "@/components/practice/TopicSelector"
import { GoalInput } from "@/components/practice/GoalInput"
import { MainPointsList } from "@/components/practice/MainPointsList"
import { PitchEditor } from "@/components/practice/PitchEditor"
import { FeedbackDisplay } from "@/components/feedback/FeedbackDisplay"
import { Loader2, Play } from "lucide-react"
import { PracticeSubmissionResponse, FeedbackData } from "@/types/feedback"

const practiceSessionSchema = z.object({
  topic: z.string().min(1, "Please enter a topic or use AI suggestion"),
  goal: z.string()
    .min(10, "Goal should be at least 10 characters")
    .max(100, "Goal cannot exceed 100 characters"),
  mainPoints: z.tuple([
    z.string().min(1, "Point 1 is required").max(50, "Point 1 cannot exceed 50 characters"),
    z.string().min(1, "Point 2 is required").max(50, "Point 2 cannot exceed 50 characters"),
    z.string().min(1, "Point 3 is required").max(50, "Point 3 cannot exceed 50 characters"),
  ]),
  pitch: z.string()
    .min(20, "Pitch should be at least 20 characters")
    .max(150, "Pitch cannot exceed 150 characters"),
})

type PracticeSessionFormData = z.infer<typeof practiceSessionSchema>

export default function PracticePage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackData | null>(null)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(true)

  const form = useForm<PracticeSessionFormData>({
    resolver: zodResolver(practiceSessionSchema),
    defaultValues: {
      topic: "",
      goal: "",
      mainPoints: ["", "", ""],
      pitch: "",
    },
  })

  const onSubmit = async (data: PracticeSessionFormData) => {
    setIsSubmitting(true)
    setSubmissionError(null)
    try {
      const response = await fetch('/api/practice/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit practice session')
      }

      const result: PracticeSubmissionResponse = await response.json()
      setFeedback(result.feedback)
      setShowForm(false)
    } catch (error) {
      console.error("Failed to create practice session:", error)
      setSubmissionError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const suggestTopic = async (): Promise<string> => {
    try {
      const response = await fetch('/api/practice/topic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'professional' }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate topic')
      }

      const result = await response.json()
      return result.topic
    } catch (error) {
      console.error('Failed to generate topic:', error)
      // Fallback to static suggestions
      const topics = [
        "Presenting quarterly marketing results to stakeholders",
        "Introducing a new team collaboration process",
        "Requesting budget approval for technology upgrade",
        "Leading a brainstorming session for product innovation",
        "Giving performance feedback to a team member",
        "Pitching a cost-saving initiative to management",
      ]
      return topics[Math.floor(Math.random() * topics.length)]
    }
  }

  const handleRetry = () => {
    setFeedback(null)
    setSubmissionError(null)
    setShowForm(true)
    form.reset()
  }

  if (feedback) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container max-w-6xl mx-auto py-8 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Your Practice Results</h1>
            <p className="text-muted-foreground mt-2">
              Here's your personalized feedback and analysis
            </p>
          </div>

          <FeedbackDisplay 
            feedback={feedback}
            isLoading={false}
            error={null}
            onRetry={handleRetry}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Practice Session</h1>
        <p className="text-muted-foreground mt-2">
          Set up your communication practice session. Fill out each section to create a focused practice experience.
        </p>
      </div>

      {isSubmitting && (
        <div className="mb-8">
          <FeedbackDisplay 
            isLoading={true}
            error={null}
          />
        </div>
      )}

      {submissionError && !isSubmitting && (
        <div className="mb-8">
          <FeedbackDisplay 
            isLoading={false}
            error={submissionError}
            onRetry={handleRetry}
          />
        </div>
      )}

      {showForm && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="topic"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <TopicSelector
                      value={field.value}
                      onChange={field.onChange}
                      onSuggestTopic={suggestTopic}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="goal"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <GoalInput
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mainPoints"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <MainPointsList
                      points={field.value}
                      onChange={field.onChange}
                      errors={fieldState.error ? {
                        0: fieldState.error.message?.includes("Point 1") ? fieldState.error.message : undefined,
                        1: fieldState.error.message?.includes("Point 2") ? fieldState.error.message : undefined,
                        2: fieldState.error.message?.includes("Point 3") ? fieldState.error.message : undefined,
                      } : {}}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pitch"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <PitchEditor
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="min-w-[200px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start Practice Session
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
      </div>
    </div>
  )
}