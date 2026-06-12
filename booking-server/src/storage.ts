import { readFile } from "node:fs/promises";
import { Pool } from "pg";
import { user, event } from "./models/entities";
import path from "node:path";

interface Deps {
  connectionPool: Pool;
}

export const enum ReservationStatus {
  Free = "free",
  Reserved = "reserved",
  Confirmed = "confirmed",
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

    createEvent: async (name: string, size: number) => {
      const result = await connectionPool.query(
        `INSERT INTO events (name) VALUES ($1) RETURNING *`,
        [name],
      );
      const createdEvent = event.parse(result.rows[0]);

      await connectionPool.query(
        `INSERT INTO reservations (eventId, status)
         SELECT $1, $2 FROM generate_series(1, $3)`,
        [createdEvent.id, ReservationStatus.Free, size],
      );

      return createdEvent;
    },

    updateReservationsStatus: async (
      userId: string,
      reservationIds: string[],
      status: ReservationStatus,
    ) => {
      await connectionPool.query(
        `UPDATE reservations
         SET status=$1, reservedBy=$2
         WHERE id=ANY($3)`,
        [status, userId, reservationIds],
      );
    },
  };
}
export type Storage = ReturnType<typeof createStorage>;
