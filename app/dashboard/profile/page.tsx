import { redirect } from "next/navigation"
export const dynamic = "force-dynamic"
import { auth } from "@/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ProfileForm } from "@/components/profile/profile-form"
import { ProfileStats } from "@/components/profile/profile-stats"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login")
  }

  // Get user profile from API
  const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/profile`, {
    cache: 'no-store'
  })
  const profile = profileResponse.ok ? await profileResponse.json() : null

  // Get user statistics from API
  const predictionsResponse = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/predictions`,
    { cache: 'no-store' }
  )
  const userStats = predictionsResponse.ok ? await predictionsResponse.json() : []

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} profile={profile} />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
            <p className="text-muted-foreground">Gerencie suas informações pessoais e configurações da conta</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>Atualize suas informações de perfil</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfileForm user={session.user} profile={profile} />
                </CardContent>
              </Card>
            </div>

            {/* Profile Stats */}
            <div>
              <ProfileStats userStats={userStats || []} profile={profile} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
