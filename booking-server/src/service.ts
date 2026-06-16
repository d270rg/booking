import { ReservationStatus } from "./models/enums";
import { ConflictException } from "./models/errors";
import { Storage } from "./storage";

interface Deps {
  storage: Storage;
}

export function createAppService({ storage }: Deps) {
  return {
    createEvent: async (name: string, size: number) => {
      return storage.createEvent(name, size);
    },

    getEventsWithReservations: async () => {
      return storage.getEventsWithReservations();
    },

    bookReservations: async (userId: string, reservationIds: string[]) => {
      const reservations = await storage.getReservations(reservationIds);

      for (const reservation of reservations) {
        if (reservation.status !== ReservationStatus.Free) {
          throw new ConflictException(`Reservation ${reservation.id} not free`);
        }
      }

      await storage.updateReservationsStatus(
        userId,
        reservationIds,
        ReservationStatus.Reserved,
      );
    },

    confirmReservations: async (userId: string, reservationIds: string[]) => {
      const reservations = await storage.getReservations(reservationIds);

      for (const reservation of reservations) {
        if (reservation.reservedBy !== userId) {
          throw new ConflictException(
            `Reservation ${reservation.id} reserved by another user`,
          );
        }
        if (reservation.status !== ReservationStatus.Reserved) {
          throw new ConflictException(
            `Reservation ${reservation.id} is not reserved`,
          );
        }
      }

      await storage.updateReservationsStatus(
        userId,
        reservationIds,
        ReservationStatus.Confirmed,
      );
    },
  };
}

export type AppService = ReturnType<typeof createAppService>;
