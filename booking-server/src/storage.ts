import { readFile } from "node:fs/promises";
import { Pool } from "pg";
import {
  user,
  event,
  reservation,
  eventWithReservation,
  reservationArray,
  eventWithReservationArray,
} from "./models/entities";
import path from "node:path";
import { ReservationStatus } from "./models/enums";

interface Deps {
  connectionPool: Pool;
}

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
        `INSERT INTO reservations (eventId, status, index)
         SELECT $1, $2, i FROM generate_series(1, $3) AS i`,
        [createdEvent.id, ReservationStatus.Free, size],
      );

      return createdEvent;
    },

    getReservations: async (reservationIds: string[]) => {
      const reservations = await connectionPool.query(
        `SELECT * FROM reservations WHERE id=ANY($1)`,
        [reservationIds],
      );

      if (reservationIds.length !== reservations.rowCount) {
        throw new Error("Some reservations was not found");
      }

      return reservationArray.parse(reservations.rows);
    },

    getEventsWithReservations: async () => {
      const eventWithReservations = await connectionPool.query(
        `SELECT events.id AS eventId 
          AND reservations.id AS reservationId 
          AND events.name AS eventName
         FROM events LEFT JOIN reservations ON events.id=reservations.eventId`,
      );

      return eventWithReservationArray.parse(eventWithReservations.rows);
    },

    getReservationsForUser: async (userId: string) => {
      const reservations = await connectionPool.query(
        `SELECT * FROM reservations WHERE userId=$1`,
        [userId],
      );

      return reservationArray.parse(reservations.rows);
    },

    updateReservationsStatus: async (
      userId: string,
      reservationIds: string[],
      status: ReservationStatus,
    ) => {
      if (status !== ReservationStatus.Free) {
        await connectionPool.query(
          `UPDATE reservations
           SET resrvedBy=$1
           WHERE id=ANY($2)`,
          [userId, reservationIds],
        );
      }

      return connectionPool.query(
        `UPDATE reservations
         SET status=$1
         WHERE id=ANY($3) AND NOT status=$1`,
        [status, reservationIds],
      );
    },
  };
}
export type Storage = ReturnType<typeof createStorage>;
