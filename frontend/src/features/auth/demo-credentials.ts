import type { LoginRequest } from "./auth-client";

/** Public, non-secret credentials used only by the contract-aligned mock server. */
export const DEMO_ADMIN_CREDENTIALS: LoginRequest = {
  email: "admin@example.test",
  password: "demo-only-password",
};
