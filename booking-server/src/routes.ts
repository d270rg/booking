import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { apiUser } from "./models/models";
import { AuthService } from "./auth-service";
import { request } from "node:http";

interface Deps {
  authService: AuthService;
}

const unprotectedPaths = ["/login", "/register"];

function parseCredentials(request: FastifyRequest, reply: FastifyReply) {
  const credentials = apiUser.safeParse(request.body);

  if (credentials.error) {
    reply.code(400).send();
    return;
  }

  return credentials.data;
}

function extractToken(request: FastifyRequest, reply: FastifyReply) {
  const apiKey = request.headers["authorization"];
  if (!apiKey) {
    reply.code(401).send();
    return;
  }

  const match = /Bearer\s(.+)/.exec(apiKey);
  if (match === null) {
    reply.code(403).send();
    return;
  }

  return match[1]!;
}

const authGuard =
  ({ authService }: { authService: AuthService }) =>
  (request: FastifyRequest, reply: FastifyReply) => {
    const isExcluded = unprotectedPaths.some((path) =>
      request.url.startsWith(path),
    );
    if (isExcluded) {
      return;
    }

    const token = extractToken(request, reply);
    if (!token) {
      return;
    }

    try {
      authService.validateToken(token);
    } catch (e) {
      reply.code(403).send();
      return;
    }
  };

export function createRoutes(deps: Deps) {
  const { authService } = deps;
  return async function appRouter(fastify: FastifyInstance) {
    fastify.setErrorHandler((error, _request, reply) => {
      console.log("Internal error", error);
      reply.status(500).send({ ok: false });
    });

    fastify.post("/login", async (request, reply) => {
      const credentials = parseCredentials(request, reply);
      if (!credentials) {
        return;
      }

      const result = await authService.login(
        credentials.username,
        credentials.password,
      );

      if (result.token) {
        reply.code(200).send({ token: result.token });
        return;
      } else {
        reply.code(result.code).send();
        return;
      }
    });

    fastify.post("/register", async (request, reply) => {
      const credentials = parseCredentials(request, reply);
      if (!credentials) {
        return;
      }

      const result = await authService.register(
        credentials.username,
        credentials.password,
      );

      if (result.token) {
        reply.code(200).send({ token: result.token });
        return;
      } else {
        reply.code(result.code).send();
        return;
      }
    });

    fastify.get(
      "/hello-world",
      { onRequest: [authGuard(deps)] },
      async (request, reply) => {},
    );
  };
}

export type Routes = ReturnType<typeof createRoutes>;
