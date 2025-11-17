import { redirect } from "next/navigation"
export const dynamic = "force-dynamic"
import { auth } from "@/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { AdvancedAnalyticsDashboard } from "@/components/analytics/advanced-analytics-dashboard"
import { MobileLayout } from "@/components/mobile/mobile-layout"

export default async function AnalyticsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login")
  }

  // Fetch data from API routes
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const [recentResultsRes, userPredictionsRes, allResultsRes] = await Promise.all([
    fetch(`${baseUrl}/api/lottery-results?limit=30`, { cache: 'no-store' }),
    fetch(`${baseUrl}/api/predictions`, { cache: 'no-store' }),
    fetch(`${baseUrl}/api/lottery-results`, { cache: 'no-store' })
  ])

  const recentResults = recentResultsRes.ok ? await recentResultsRes.json() : []
  const userPredictions = userPredictionsRes.ok ? await userPredictionsRes.json() : []
  const allResults = allResultsRes.ok ? await allResultsRes.json() : []

  return (
    <MobileLayout>
      <div className="min-h-screen bg-background">
        <DashboardHeader user={session.user} profile={null} />

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <AdvancedAnalyticsDashboard
            recentResults={recentResults}
            userPredictions={userPredictions}
            allResults={allResults}
          />
        </main>
      </div>
    </MobileLayout>
  )
}
