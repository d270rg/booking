import { z } from "zod";
import { ReservationStatus } from "./enums";

export const user = z.strictObject({
  id: z.uuid(),
  username: z.string(),
  password: z.string(),
});

export const event = z.strictObject({
  id: z.uuid(),
  name: z.string(),
});
export const eventArray = z.array(event);

export const reservation = z.strictObject({
  id: z.uuid(),
  eventId: z.uuid(),
  status: z.enum(ReservationStatus),
  reservationDate: z.date(),
  reservedBy: z.uuid(),
});
export const reservationArray = z.array(reservation);

export const eventWithReservation = z.strictObject({
  eventId: z.uuid(),
  eventName: z.string(),
  reservationId: z.uuid(),
  reserved: z.boolean(),
  reservationDate: z.date(),
  reservedBy: z.uuid(),
});
export const eventWithReservationArray = z.array(eventWithReservation);
