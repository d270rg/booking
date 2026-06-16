import { array, strictObject, string } from "zod";
import { user } from "./entities";

export const apiUser = user.omit({
  id: true,
});

export const apiReservationIds = strictObject({
  userId: string(),
  reservationIds: array(string()),
});
