import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminAnalytics } from "@/components/admin/admin-analytics"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Analytics Administrativo | Lotofy",
  description: "Visão completa do sistema e performance dos usuários",
}

export default async function AdminAnalyticsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login")
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard")
  }

  // Fetch data from API routes
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    const [resultsRes, predictionsRes, usersRes] = await Promise.all([
      fetch(`${baseUrl}/api/lottery-results`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/predictions`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/admin/users`, { cache: 'no-store' }).catch(() => null)
    ])

    const allResultsArray = resultsRes.ok ? await resultsRes.json() : []
    const allPredictionsArray = predictionsRes.ok ? await predictionsRes.json() : []
    const userStatsArray = (usersRes && usersRes.ok) ? await usersRes.json() : []

    // Dados seguros normalizados

    return (
      <div className="min-h-screen bg-background">
        <AdminHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Analytics Administrativo</h1>
              <p className="text-muted-foreground">Visão completa do sistema e performance dos usuários</p>
            </div>
            <AdminAnalytics
              results={allResultsArray}
              predictions={allPredictionsArray}
              users={userStatsArray}
              systemStats={{
                totalResults: allResultsArray.length,
                totalPredictions: allPredictionsArray.length,
                totalUsers: userStatsArray.length,
              }}
            />
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error("Error loading analytics data:", error)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-red-500">Erro ao carregar dados de analytics.</p>
      </div>
    )
  }
}
