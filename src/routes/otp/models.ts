import { t } from "elysia";

export const otpModel = t.Object({
  email: t.String({ format: "email" }),
});
