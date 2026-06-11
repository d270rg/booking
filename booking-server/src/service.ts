import { Storage } from "./storage";

interface Deps {
  storage: Storage;
}

export function createAppService({ storage }: Deps) {}

export type AppService = ReturnType<typeof createAppService>;
