import { t } from "elysia";

export const upload = t.Object({
    file: t.File(),
});