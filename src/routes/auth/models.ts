import { t } from "elysia";

export const loginModel = t.Object({
  email: t.String({ format: "email" }),
  otp: t.String({ minLength: 6, maxLength: 6 }),
});

export const loginPasswordModel = t.Object({
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 6, maxLength: 32 }),
});

export const registerPasswordModel = t.Object({
  firstName: t.String(),
  lastName: t.String(),
  phoneNumber: t.String(),
  email: t.String(),
  photoUrl: t.String(),
  password: t.String({ minLength: 6, maxLength: 32 }),
});

export const registerModel = t.Object({
  firstName: t.String(),
  lastName: t.String(),
  phoneNumber: t.String(),
  email: t.String(),
  photoUrl: t.String(),
});
