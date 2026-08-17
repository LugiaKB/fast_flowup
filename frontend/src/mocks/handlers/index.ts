import type { RequestHandler } from "msw";

import { authHandlers } from "./auth";
import { colaboradoresHandlers } from "./colaboradores";
import { workshopsHandlers } from "./workshops";

export const handlers: RequestHandler[] = [
  ...authHandlers,
  ...colaboradoresHandlers,
  ...workshopsHandlers,
];
