import type { RequestHandler } from "msw";

import { colaboradoresHandlers } from "./colaboradores";
import { workshopsHandlers } from "./workshops";

export const handlers: RequestHandler[] = [...colaboradoresHandlers, ...workshopsHandlers];
