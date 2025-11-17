import { redirect } from "next/navigation"
export const dynamic = "force-dynamic"
import { auth } from "@/auth"
import { AdminHeader } from "@/components/admin/admin-header"
import { ResultsManager } from "@/components/admin/results-manager"

export default async function AdminResultsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  if (session.user.role !== "admin") {
    redirect("/dashboard")
  }

  // Get recent results from API
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const resultsRes = await fetch(`${baseUrl}/api/lottery-results?limit=20`, { cache: 'no-store' })
  const recentResults = resultsRes.ok ? await resultsRes.json() : []

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gerenciar Resultados</h1>
            <p className="text-muted-foreground">Importe, adicione e gerencie resultados da Lotofácil</p>
          </div>

          <ResultsManager initialResults={recentResults} />
        </div>
      </main>
    </div>
  )
}
