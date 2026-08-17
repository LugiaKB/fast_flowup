import type { RequestHandler } from "msw";

import { colaboradoresHandlers } from "./colaboradores";

export const handlers: RequestHandler[] = [...colaboradoresHandlers];
