"use client";

import { FormEvent, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

type Props = {
  supabase: SupabaseClient;
  onStatus: (message: string, isError?: boolean) => void;
};

export function AuthPanel({ supabase, onStatus }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignUp(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    onStatus(error ? error.message : "Registrering skickad. Kontrollera din inkorg eller logga in direkt om e-postbekräftelse är avstängd.", !!error);
  }

  async function handleSignIn(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    onStatus(error ? error.message : "Inloggad.", !!error);
  }

  return (
    <form onSubmit={handleSignIn} className="card">
      <h2>Logga in eller skapa konto</h2>
      <p className="muted">Frontend använder bara Supabase anon key. RLS i databasen avgör vad användaren faktiskt får göra.</p>

      <label>
        E-post
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
      </label>

      <label>
        Lösenord
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={6} required />
      </label>

      <div className="row wrap">
        <button type="submit" disabled={loading}>Logga in</button>
        <button type="button" className="secondary" onClick={handleSignUp} disabled={loading}>Skapa konto</button>
      </div>
    </form>
  );
}
