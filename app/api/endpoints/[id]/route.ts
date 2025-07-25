import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const {
      name,
      method,
      path,
      description,
      response_status,
      response_headers,
      response_body,
      request_headers,
      request_body,
      validation_config,
    } = body

    const { data: endpoint, error } = await supabaseAdmin
      .from("endpoints")
      .update({
        name,
        method,
        path,
        description,
        response_status,
        response_headers,
        response_body,
        request_headers,
        request_body,
        validation_config,
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating endpoint:", error)
      return NextResponse.json({ error: "Failed to update endpoint" }, { status: 500 })
    }

    return NextResponse.json(endpoint)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabaseAdmin.from("endpoints").delete().eq("id", params.id)

    if (error) {
      console.error("Error deleting endpoint:", error)
      return NextResponse.json({ error: "Failed to delete endpoint" }, { status: 500 })
    }

    return NextResponse.json({ message: "Endpoint deleted successfully" })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
