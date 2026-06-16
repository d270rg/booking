import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { apiReservationIds, apiUser } from "./models/models";
import { AuthService } from "./auth-service";
import { request } from "node:http";
import { AppService } from "./service";
import { ConflictException, NotFoundException } from "./models/errors";
import { safeParseAsync } from "zod";

interface Deps {
  authService: AuthService;
  appService: AppService;
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
  const { authService, appService } = deps;
  return async function appRouter(fastify: FastifyInstance) {
    fastify.setErrorHandler((error, _request, reply) => {
      if (error instanceof ConflictException) {
        reply.status(409).send({ ok: false });
        return;
      }
      if (error instanceof NotFoundException) {
        reply.status(404).send({ ok: false });
        return;
      }

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
      "/events",
      { onRequest: [authGuard(deps)] },
      async (_request, reply) => {
        const events = await appService.getEventsWithReservations();
        reply.code(200).send(events);
      },
    );

    fastify.post(
      "/reserve",
      { onRequest: [authGuard(deps)] },
      async (request, reply) => {
        const reservationIdsRequest = apiReservationIds.safeParse(request);

        if (reservationIdsRequest.error) {
          reply.code(400).send();
          return;
        }

        await appService.bookReservations(
          reservationIdsRequest.data.userId,
          reservationIdsRequest.data.reservationIds,
        );
      },
    );

    fastify.post(
      "/confirm",
      { onRequest: [authGuard(deps)] },
      async (request, reply) => {
        const reservationIdsRequest = apiReservationIds.safeParse(request);

        if (reservationIdsRequest.error) {
          reply.code(400).send();
          return;
        }

        await appService.confirmReservations(
          reservationIdsRequest.data.userId,
          reservationIdsRequest.data.reservationIds,
        );
      },
    );
  };
}

export type Routes = ReturnType<typeof createRoutes>;
