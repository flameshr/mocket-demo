import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      collection_id,
      name,
      method,
      path,
      description,
      response_status = 200,
      response_headers = { "Content-Type": "application/json" },
      response_body,
      request_headers,
      request_body,
      validation_config,
    } = body

    if (!collection_id || !name || !method || !path || !response_body) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: endpoint, error } = await supabaseAdmin
      .from("endpoints")
      .insert([
        {
          collection_id,
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
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating endpoint:", error)
      return NextResponse.json({ error: "Failed to create endpoint" }, { status: 500 })
    }

    return NextResponse.json(endpoint, { status: 201 })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
