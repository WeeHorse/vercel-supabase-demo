import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const adminSecret = request.headers.get("x-admin-demo-secret");

  if (adminSecret !== "teach-devsecops") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from("audit_jobs").insert({
      job_type: "reindex",
      requested_at: new Date().toISOString()
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
