import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    // First, try to fetch collections
    const { data: collections, error: collectionsError } = await supabaseAdmin
      .from("collections")
      .select("*")
      .order("created_at", { ascending: false })

    if (collectionsError) {
      console.error("Supabase collections error:", collectionsError.message)

      // If table doesn't exist, return empty array with setup message
      if (collectionsError.message.includes("does not exist")) {
        return NextResponse.json({
          collections: [],
          needsSetup: true,
          message: "Database tables not found. Please run the SQL scripts to set up your database.",
        })
      }

      throw collectionsError
    }

    // If no collections, return empty array
    if (!collections || collections.length === 0) {
      return NextResponse.json({ collections: [] })
    }

    // Fetch endpoints for each collection
    const collectionsWithEndpoints = await Promise.all(
      collections.map(async (collection) => {
        const { data: endpoints, error: endpointsError } = await supabaseAdmin
          .from("endpoints")
          .select("*")
          .eq("collection_id", collection.id)
          .order("created_at", { ascending: false })

        if (endpointsError) {
          console.error("Supabase endpoints error:", endpointsError.message)
          return { ...collection, endpoints: [] }
        }

        return { ...collection, endpoints: endpoints || [] }
      }),
    )

    return NextResponse.json({ collections: collectionsWithEndpoints })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch collections", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin.from("collections").insert([{ name, description }]).select().single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to create collection" }, { status: 500 })
    }

    return NextResponse.json({ collection: data }, { status: 201 })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 })
  }
}
