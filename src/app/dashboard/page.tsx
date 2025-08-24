import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-config"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {session.user?.name || "User"}!
          </h1>
          <p className="text-muted-foreground">
            Ready to improve your communication skills today?
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Practice Streak Card */}
          <Card>
            <CardHeader>
              <CardTitle>Practice Streak</CardTitle>
              <CardDescription>Keep your momentum going!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0 days</div>
              <p className="text-sm text-muted-foreground mt-2">
                Start your first practice session
              </p>
            </CardContent>
          </Card>

          {/* Average Score Card */}
          <Card>
            <CardHeader>
              <CardTitle>Average Score</CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">-</div>
              <p className="text-sm text-muted-foreground mt-2">
                No sessions yet
              </p>
            </CardContent>
          </Card>

          {/* Total Sessions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Total Sessions</CardTitle>
              <CardDescription>All time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
              <p className="text-sm text-muted-foreground mt-2">
                Complete your first session
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Start Today's Practice</CardTitle>
            <CardDescription>
              Improve your communication skills with a focused 5-minute session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/practice">
              <Button size="lg" className="w-full sm:w-auto">
                Start Practice Session
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Progress Chart Placeholder */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Progress Over Time</CardTitle>
            <CardDescription>
              Track your improvement journey
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">
              Complete practice sessions to see your progress chart
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}