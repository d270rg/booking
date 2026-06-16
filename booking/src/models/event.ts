import {
  array,
  boolean,
  date,
  number,
  record,
  strictObject,
  string,
  uuid,
  type output,
} from 'zod';

export const reservation = strictObject({
  eventId: uuid(),
  eventName: string(),
  index: number(),
  reservationId: uuid(),
  reserved: boolean(),
  reservationDate: date(),
  reservedBy: uuid(),
});
export type IReservation = output<typeof reservation>;

export const events = record(string(), array(reservation));
export type IEvents = output<typeof events>;
