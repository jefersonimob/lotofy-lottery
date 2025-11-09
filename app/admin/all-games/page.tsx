import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin/admin-header"
import { AllGamesManager } from "@/components/admin/all-games-manager"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Jogos Possíveis | Admin | Lotofy",
  description: "Gerenciamento da base de 3.268.760 jogos possíveis da Lotofácil",
}

export default async function AdminAllGamesPage() {
  const supabase = createClient()

  const { data, error: userError } = await supabase.auth.getUser()
  if (userError || !data?.user) {
    redirect("/auth/login")
  }
  const { user } = data

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile || profile.role !== "admin") {
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
