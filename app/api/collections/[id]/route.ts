import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, description } = body

    const { data: collection, error } = await supabaseAdmin
      .from("collections")
      .update({ name, description })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating collection:", error)
      return NextResponse.json({ error: "Failed to update collection" }, { status: 500 })
    }

    return NextResponse.json(collection)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabaseAdmin.from("collections").delete().eq("id", params.id)

    if (error) {
      console.error("Error deleting collection:", error)
      return NextResponse.json({ error: "Failed to delete collection" }, { status: 500 })
    }

    return NextResponse.json({ message: "Collection deleted successfully" })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
