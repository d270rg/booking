import { Storage } from "./storage";
import libcrypto from "node:crypto";
import { sign, verify } from "jsonwebtoken";
import { HttpCodes } from "fastify/types/utils";

interface Deps {
  storage: Storage;
}

// We have enum at home
// enum at home:
const AuthCode = {
  NotFound: 404,
  WrongCredentials: 403,
  Conflict: 409,
  ServerError: 500,
  Success: 200,
} as const satisfies Record<string, HttpCodes>;
export type AuthCode = (typeof AuthCode)[keyof typeof AuthCode];

export interface AuthResult {
  code: AuthCode;
  token?: string;
  error?: unknown;
}

export function createAuthService({ storage }: Deps) {
  return {
    encode: async (password: string) => {
      return libcrypto.createHash("sha256").update(password).digest("hex");
    },
    createToken: (username: string): string => {
      const tokenPayload = { username };
      const secretKey = process.env.JWT_SECRET;

      if (!secretKey) {
        throw new Error("TokenGenerationFailed");
      }

      return sign(tokenPayload, secretKey);
    },
    validateToken: (token: string): void => {
      const secretKey = process.env.JWT_SECRET;
      if (!secretKey) {
        throw new Error("TokenDecodeFailed");
      }

      verify(token, secretKey);
    },
    async login(username: string, password: string): Promise<AuthResult> {
      const existingUser = await storage.getUser(username);

      if (!existingUser) {
        return { code: AuthCode.NotFound };
      }

      const hash = await this.encode(password);
      if (existingUser.password !== hash) {
        return { code: AuthCode.WrongCredentials };
      }

      return { code: AuthCode.Success, token: this.createToken(username) };
    },
    async register(username: string, password: string): Promise<AuthResult> {
      const existingUser = await storage.getUser(username);

      if (existingUser) {
        return { code: AuthCode.Conflict };
      }

      const hash = await this.encode(password);
      const newUser = await storage.createUser(username, hash);
      return {
        code: AuthCode.Success,
        token: this.createToken(newUser.username),
      };
    },
  };
}

export type AuthService = ReturnType<typeof createAuthService>;
