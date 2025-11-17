import { redirect } from "next/navigation"
import { auth } from "@/auth"

export default async function AdminPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  if (session.user.role !== "admin") {
    redirect("/dashboard")
  }

  return <div>Área restrita do Admin ✅</div>
}
