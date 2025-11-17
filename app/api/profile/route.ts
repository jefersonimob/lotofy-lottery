export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"

export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { full_name, bio, phone, city, state } = body

    const data = await prisma.profile.update({
      where: { id: session.user.id },
      data: {
        fullName: full_name,
        bio,
        phone,
        city,
        state,
        updatedAt: new Date(),
      }
    })

    // Convert to expected format
    const profile = {
      id: data.id,
      email: data.email,
      full_name: data.fullName,
      bio: data.bio,
      phone: data.phone,
      city: data.city,
      state: data.state,
      role: data.role,
      created_at: data.createdAt.toISOString(),
      updated_at: data.updatedAt.toISOString(),
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Profile API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await prisma.profile.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        bio: true,
        phone: true,
        city: true,
        state: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!data) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Convert to expected format
    const profile = {
      id: data.id,
      email: data.email,
      full_name: data.fullName,
      bio: data.bio,
      phone: data.phone,
      city: data.city,
      state: data.state,
      role: data.role,
      created_at: data.createdAt.toISOString(),
      updated_at: data.updatedAt.toISOString(),
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Profile API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
