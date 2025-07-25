import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: collections, error } = await supabaseAdmin
      .from("collections")
      .select(`
        *,
        endpoints (*)
      `)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching collections:", error)
      return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 })
    }

    return NextResponse.json(collections)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const { data: collection, error } = await supabaseAdmin
      .from("collections")
      .insert([{ name, description }])
      .select()
      .single()

    if (error) {
      console.error("Error creating collection:", error)
      return NextResponse.json({ error: "Failed to create collection" }, { status: 500 })
    }

    // Add empty endpoints array for consistency
    const collectionWithEndpoints = {
      ...collection,
      endpoints: [],
    }

    return NextResponse.json(collectionWithEndpoints, { status: 201 })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
