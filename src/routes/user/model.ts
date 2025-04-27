import {t} from "elysia";
export const userModel = t.Object({
    firstName: t.String(),
    lastName: t.String(),
    phoneNumber: t.String(),
    email: t.String(),
    photoUrl: t.String(),
});