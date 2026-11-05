import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth.mjs";

export async function POST(request: Request) {
  // Fail closed: the privileged endpoint is disabled unless a strong secret is configured.
  if (!isAuthorizedAdminRequest(request.headers.get("authorization"), process.env.ADMIN_API_SECRET)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from("audit_jobs").insert({
      job_type: "reindex",
      requested_at: new Date().toISOString()
    });

    if (error) {
      console.error("Admin reindex enqueue failed");
      return Response.json({ error: "Operation failed" }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch {
    console.error("Admin reindex endpoint failed");
    return Response.json({ error: "Operation failed" }, { status: 500 });
  }
}
