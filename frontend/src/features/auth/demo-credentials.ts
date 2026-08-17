import type { LoginRequest } from "./auth-client";

/** Public, non-secret credentials used only by the contract-aligned mock server. */
export const DEMO_ADMIN_CREDENTIALS: LoginRequest = {
  username: "administrador",
  password: "senha-de-demonstracao",
};
