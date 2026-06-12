import Fastify from "fastify";
import { createRoutes } from "./routes";
import { Client, Pool } from "pg";
import { createStorage } from "./storage";
import { createAppService } from "./service";
import { createAuthService } from "./auth-service";

function set<T, K extends PropertyKey, V>(
  object: T,
  key: K,
  value: V,
): asserts object is T & Record<K, V> {
  (object as any)[key] = value;
}

// DI is overrated
const appModule = async () => {
  const module: {} = {};

  set(
    module,
    "connectionPool",
    new Pool({
      host: "db",
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
    }),
  );
  set(module, "storage", createStorage(module));
  set(module, "service", createAppService(module));
  set(module, "authService", createAuthService(module));
  set(module, "routes", createRoutes(module));

  return module;
};
export type Module = Awaited<ReturnType<typeof appModule>>;

export const fastify = Fastify({
  logger: true,
});

async function main() {
  try {
    const { routes, storage } = await appModule();

    await storage.init();

    fastify.register(routes);
    await fastify.listen({ host: "0.0.0.0", port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main();
