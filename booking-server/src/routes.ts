import type { FastifyInstance } from "fastify";

export function createRoutes() {
  return async function appRouter(fastify: FastifyInstance) {
    fastify.get("/", async function handler(request, reply) {});
  };
}

export type Routes = ReturnType<typeof createRoutes>;
