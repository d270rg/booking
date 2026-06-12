import { Storage } from "./storage";

interface Deps {
  storage: Storage;
}

export function createAppService({ storage }: Deps) {
  return {};
}

export type AppService = ReturnType<typeof createAppService>;
