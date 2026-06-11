import { z } from "zod";

export const user = z.strictObject({
  id: z.uuid(),
  username: z.string(),
  password: z.string(),
});

export const events = z.strictObject({
  id: z.int(),
  name: z.string(),
});

export const resrvations = z.strictObject({
  id: z.int(),
  eventId: z.int(),
  reserved: z.boolean(),
  resrvationDate: z.date(),
  reservedBy: z.uuid(),
});
