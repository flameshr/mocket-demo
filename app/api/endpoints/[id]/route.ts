import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, method, path, response_body, status_code, headers, validation_rules, error_scenarios, delay_config } =
      body

    const { data, error } = await supabaseAdmin
      .from("endpoints")
      .update({
        name,
        method,
        path,
        response_body,
        status_code,
        headers,
        validation_rules,
        error_scenarios,
        delay_config,
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to update endpoint" }, { status: 500 })
    }

    return NextResponse.json({ endpoint: data })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to update endpoint" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabaseAdmin.from("endpoints").delete().eq("id", params.id)

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to delete endpoint" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to delete endpoint" }, { status: 500 })
  }
}
