import { t } from "elysia";

export const loginModel = t.Object({
  email: t.String({ format: "email" }),
  otp: t.String({ minLength: 6, maxLength: 6 }),
});
