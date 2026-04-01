"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";

type Todo = {
  id: number;
  title: string;
  done: boolean;
  created_at: string;
};

type Props = {
  supabase: SupabaseClient;
  session: Session;
  onStatus: (message: string, isError?: boolean) => void;
};

export function TodoPanel({ supabase, session, onStatus }: Props) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadTodos() {
    setLoading(true);
    const { data, error } = await supabase
      .from("todos")
      .select("id, title, done, created_at")
      .order("created_at", { ascending: false });

    setLoading(false);

    if (error) {
      onStatus(`Kunde inte läsa todos: ${error.message}`, true);
      return;
    }

    setTodos(data ?? []);
  }

  useEffect(() => {
    void loadTodos();
  }, []);

  async function addTodo(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;

    const { error } = await supabase.from("todos").insert({
      title: title.trim(),
      user_id: session.user.id,
      done: false
    });

    if (error) {
      onStatus(`Kunde inte skapa todo: ${error.message}`, true);
      return;
    }

    setTitle("");
    onStatus("Todo skapad.");
    await loadTodos();
  }

  async function toggleTodo(todo: Todo) {
    const { error } = await supabase
      .from("todos")
      .update({ done: !todo.done })
      .eq("id", todo.id);

    if (error) {
      onStatus(`Kunde inte uppdatera todo: ${error.message}`, true);
      return;
    }

    await loadTodos();
  }

  async function removeTodo(id: number) {
    const { error } = await supabase.from("todos").delete().eq("id", id);

    if (error) {
      onStatus(`Kunde inte ta bort todo: ${error.message}`, true);
      return;
    }

    onStatus("Todo borttagen.");
    await loadTodos();
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    onStatus(error ? error.message : "Utloggad.", !!error);
  }

  return (
    <div className="grid">
      <section className="card">
        <div className="row wrap" style={{ justifyContent: "space-between" }}>
          <div>
            <h2>Inloggad användare</h2>
            <p className="muted">{session.user.email}</p>
          </div>
          <button className="secondary" onClick={signOut}>Logga ut</button>
        </div>
      </section>

      <section className="card">
        <h2>Todo-lista</h2>
        <p className="muted">Alla operationer går direkt mot Supabase med anon key + användarens JWT. RLS gör resten.</p>
        <form onSubmit={addTodo} className="row wrap">
          <input
            style={{ flex: 1 }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ny uppgift"
          />
          <button type="submit">Lägg till</button>
        </form>
      </section>

      <section className="card">
        <h3>Mina todos</h3>
        {loading ? <p>Laddar…</p> : null}
        {!loading && todos.length === 0 ? <p className="muted">Inga todos ännu.</p> : null}
        <div className="grid">
          {todos.map((todo) => (
            <div key={todo.id} className={`todo ${todo.done ? "done" : ""}`}>
              <div>
                <div className="todo-title">{todo.title}</div>
                <div className="todo-meta">{new Date(todo.created_at).toLocaleString("sv-SE")}</div>
              </div>
              <div className="row wrap" style={{ width: "auto" }}>
                <button type="button" className="secondary" onClick={() => toggleTodo(todo)}>
                  {todo.done ? "Markera aktiv" : "Markera klar"}
                </button>
                <button type="button" className="danger" onClick={() => removeTodo(todo.id)}>
                  Ta bort
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
