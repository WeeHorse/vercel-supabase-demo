import test from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const names = [
  "RLS_TEST_SUPABASE_URL", "RLS_TEST_SUPABASE_ANON_KEY",
  "RLS_TEST_USER_A_EMAIL", "RLS_TEST_USER_A_PASSWORD",
  "RLS_TEST_USER_B_EMAIL", "RLS_TEST_USER_B_PASSWORD"
];
const missing = names.filter((name) => !process.env[name]);
const enabled = missing.length === 0;

test("RLS: authenticated users cannot access each other's todos", {
  skip: enabled ? false : `Missing separate test-project environment: ${missing.join(", ")}`
}, async () => {
  const url = process.env.RLS_TEST_SUPABASE_URL;
  const key = process.env.RLS_TEST_SUPABASE_ANON_KEY;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL === url || process.env.SUPABASE_URL === url) {
    throw new Error("Refusing to test against the configured application database; use an isolated test project");
  }

  const a = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const b = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const signA = await a.auth.signInWithPassword({ email: process.env.RLS_TEST_USER_A_EMAIL, password: process.env.RLS_TEST_USER_A_PASSWORD });
  const signB = await b.auth.signInWithPassword({ email: process.env.RLS_TEST_USER_B_EMAIL, password: process.env.RLS_TEST_USER_B_PASSWORD });
  assert.ifError(signA.error);
  assert.ifError(signB.error);
  assert.notEqual(signA.data.user.id, signB.data.user.id);

  const title = `rls-test-${crypto.randomUUID()}`;
  let insertedId;
  try {
    const inserted = await a.from("todos").insert({ user_id: signA.data.user.id, title }).select("id").single();
    assert.ifError(inserted.error);
    insertedId = inserted.data.id;

    const read = await b.from("todos").select("id").eq("id", insertedId);
    assert.ifError(read.error);
    assert.deepEqual(read.data, [], "B must not read A's row");

    const update = await b.from("todos").update({ done: true }).eq("id", insertedId).select("id");
    assert.ifError(update.error);
    assert.deepEqual(update.data, [], "B must not update A's row");

    const insertAsA = await b.from("todos").insert({ user_id: signA.data.user.id, title });
    assert.ok(insertAsA.error, "B must not insert a row owned by A");

    const remove = await b.from("todos").delete().eq("id", insertedId).select("id");
    assert.ifError(remove.error);
    assert.deepEqual(remove.data, [], "B must not delete A's row");

    const stillThere = await a.from("todos").select("done").eq("id", insertedId).single();
    assert.ifError(stillThere.error);
    assert.equal(stillThere.data.done, false);
  } finally {
    if (insertedId !== undefined) {
      const cleanup = await a.from("todos").delete().eq("id", insertedId);
      assert.ifError(cleanup.error);
    }
    await a.auth.signOut();
    await b.auth.signOut();
  }
});
