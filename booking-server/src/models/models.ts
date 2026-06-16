import { array, output, record, strictObject, string } from "zod";
import { eventWithReservation, user } from "./entities";

export const apiUser = user.omit({
  id: true,
});
export type IApiUser = output<typeof apiEvents>;

export const apiReservationIds = strictObject({
  userId: string(),
  reservationIds: array(string()),
});
export type IApiReservationIds = output<typeof apiEvents>;

export const apiEvents = record(string(), array(eventWithReservation));
export type IApiEvents = output<typeof apiEvents>;
