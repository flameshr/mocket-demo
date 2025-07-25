import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      collection_id,
      name,
      method,
      path,
      response_body,
      status_code,
      headers,
      validation_rules,
      error_scenarios,
      delay_config,
    } = body

    if (!collection_id || !name || !method || !path) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("endpoints")
      .insert([
        {
          collection_id,
          name,
          method,
          path,
          response_body: response_body || "{}",
          status_code: status_code || 200,
          headers: headers || {},
          validation_rules: validation_rules || [],
          error_scenarios: error_scenarios || [],
          delay_config: delay_config || { enabled: false, min: 100, max: 1000 },
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to create endpoint" }, { status: 500 })
    }

    return NextResponse.json({ endpoint: data }, { status: 201 })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to create endpoint" }, { status: 500 })
  }
}
