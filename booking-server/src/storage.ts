import { readFile } from "node:fs/promises";
import { Pool } from "pg";
import { user } from "./models/entities";
import path from "node:path";

interface Deps {
  connectionPool: Pool;
}

// The so-called "class"
export function createStorage({ connectionPool }: Deps) {
  return {
    init: async () => {
      const query = await readFile(
        path.join(__dirname, "..", "db", "init-database.sql"),
        "utf-8",
      );
      await connectionPool.query(query);
    },
    getUser: async (username: string) => {
      const result = await connectionPool.query(
        `SELECT * FROM users WHERE username=$1`,
        [username],
      );
      if (!result.rowCount) {
        return undefined;
      }
      return user.parse(result.rows[0]);
    },
    createUser: async (username: string, password: string) => {
      const result = await connectionPool.query(
        `INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *`,
        [username, password],
      );
      return user.parse(result.rows[0]);
    },
  };
}
export type Storage = ReturnType<typeof createStorage>;
