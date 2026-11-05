import test from "node:test";
import assert from "node:assert/strict";
import { isAuthorizedAdminRequest } from "./lib/admin-auth.mjs";

const secret = "a-long-demonstration-secret-of-at-least-32-characters";

test("admin endpoint rejects missing server configuration", () => {
  assert.equal(isAuthorizedAdminRequest(`Bearer ${secret}`, undefined), false);
  assert.equal(isAuthorizedAdminRequest(`Bearer ${secret}`, "short"), false);
});

test("admin endpoint rejects missing or malformed authorization", () => {
  assert.equal(isAuthorizedAdminRequest(null, secret), false);
  assert.equal(isAuthorizedAdminRequest(secret, secret), false);
  assert.equal(isAuthorizedAdminRequest(`Basic ${secret}`, secret), false);
});

test("admin endpoint rejects wrong bearer token", () => {
  assert.equal(isAuthorizedAdminRequest("Bearer a-different-long-secret-that-is-not-valid", secret), false);
});

test("admin endpoint accepts matching configured bearer token", () => {
  assert.equal(isAuthorizedAdminRequest(`Bearer ${secret}`, secret), true);
});

test("admin endpoint does not accept a prefix of the secret", () => {
  assert.equal(isAuthorizedAdminRequest(`Bearer ${secret.slice(0, -1)}`, secret), false);
});
