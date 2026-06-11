import { readFile } from "node:fs/promises";
import { Pool } from "pg";
import { user } from "./entities";

interface Deps {
  connectionPool: Pool;
}

export function createStorage({ connectionPool }: Deps) {
  return {
    init: async () => {
      const query = await readFile("./db/init_database.sql", "utf-8");
      await connectionPool.query(query);
    },
    getUser: async (username: string) => {
      const result = await connectionPool.query(
        `SELECT * FROM users WHERE username=$1`,
        [username],
      );
      return user.parse(result.rows[0]);
    },
    createUser: async (username: string, password: string) => {
      const result = await connectionPool.query(
        `INSERT INTO users VALUES ($1, $2)`,
        [username, password],
      );
      return user.parse(result.rows[0]);
    },
  };
}
export type Storage = ReturnType<typeof createStorage>;
