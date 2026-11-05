import { timingSafeEqual } from "node:crypto";

/**
 * Demonstration-only shared-secret authentication for a privileged route.
 * For production use an authenticated admin identity with explicit authorization.
 */
export function isAuthorizedAdminRequest(authorization, configuredSecret) {
  if (!configuredSecret || configuredSecret.length < 32) return false;
  if (typeof authorization !== "string" || !authorization.startsWith("Bearer ")) return false;
  const provided = authorization.slice(7);
  const expectedBytes = Buffer.from(configuredSecret, "utf8");
  const providedBytes = Buffer.from(provided, "utf8");
  return providedBytes.length === expectedBytes.length &&
    timingSafeEqual(providedBytes, expectedBytes);
}
