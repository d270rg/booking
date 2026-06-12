import { user } from "./entities";

export const apiUser = user.omit({
  id: true,
});
