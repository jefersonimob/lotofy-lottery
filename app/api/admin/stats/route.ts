export const dynamic = "force-dynamic";
import { NextResponse } from "next/server"
import { getAdminStats } from "@/lib/database/server"
import { auth } from "@/auth"

export async function GET() {
  try {
    const session = await auth()
    
    // Check if user is authenticated and is admin
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = await getUserRole(session.user.id)
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Fetch admin statistics using our new database functions
    const stats = await getAdminStats()

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Admin stats API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function getUserRole(userId: string) {
  try {
    // Import here to avoid circular dependencies
    const { getUserRole } = await import("@/lib/database/server")
    return await getUserRole(userId)
  } catch (error) {
    console.error('Error getting user role:', error)
    return 'user'
  }
}