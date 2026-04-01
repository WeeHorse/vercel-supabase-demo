"use client";

import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { AuthPanel } from "./auth-panel";
import { TodoPanel } from "./todo-panel";

export function ClientApp() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<{ message: string; isError: boolean; } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <div className="grid two">
      <div className="grid">
        <section className="card">
          <h1>Vercel Supabase Demo</h1>
          <p className="muted">
            Demoapp för Vercel, Supabase, CI/CD, preview deployments, säkerhetsheaders, API-nycklar och RLS.
          </p>
          <div>
            <span className="badge">APP_ENV: {process.env.NEXT_PUBLIC_APP_ENV ?? "not set"}</span>
            <span className="badge">Frontend: anon key</span>
            <span className="badge">Server: service role key</span>
            <span className="badge">DB: RLS</span>
          </div>
        </section>

        <section className="card">
          <h2>Säkerhetsidéer i demon</h2>
          <ul>
            <li>Preview och production ska ha separata environment variables.</li>
            <li><code>SUPABASE_SERVICE_ROLE_KEY</code> finns bara server-side.</li>
            <li>Todo-CRUD går direkt mot databasen med användarens token.</li>
            <li>Om RLS saknas blir anon key i praktiken för kraftfull.</li>
            <li>CDN-skript ska versionspinnas och skyddas med SRI.</li>
          </ul>
        </section>

        <section className="card">
          <h2>CDN + SRI-exempel</h2>
          <pre>{`<script
  src="https://cdn.jsdelivr.net/npm/dayjs@1.11.13/dayjs.min.js"
  integrity="sha384-REPLACE_WITH_REAL_HASH"
  crossorigin="anonymous"
></script>`}</pre>
        </section>

        <section className="card">
          <h2>Skyddad admin-route</h2>
          <p className="muted">
            I <code>app/api/admin/reindex/route.ts</code> används service role key endast i servermiljön.
          </p>
        </section>
      </div>

      <div className="grid">
        {status ? (
          <section className="card">
            <strong className={status.isError ? "status-error" : "status-ok"}>{status.message}</strong>
          </section>
        ) : null}
        {session ? (
          <TodoPanel supabase={supabase} session={session} onStatus={(message, isError = false) => setStatus({ message, isError })} />
        ) : (
          <AuthPanel supabase={supabase} onStatus={(message, isError = false) => setStatus({ message, isError })} />
        )}
      </div>
    </div>
  );
}
