import { t } from "elysia";

export const loginModel = t.Object({
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 8, maxLength: 32 }),
});
