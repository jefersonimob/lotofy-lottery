import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { AdminHeader } from "@/components/admin/admin-header"
import { AllGamesManager } from "@/components/admin/all-games-manager"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Jogos Possíveis | Admin | Lotofy",
  description: "Gerenciamento da base de 3.268.760 jogos possíveis da Lotofácil",
}

export default async function AdminAllGamesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login")
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Jogos Possíveis</h1>
          <p className="text-muted-foreground">
            Gerenciamento da base completa de combinações possíveis da Lotofácil
          </p>
        </div>
        <AllGamesManager />
      </div>
    </div>
  )
}
