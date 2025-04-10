import { t } from "elysia";

export const membermodel = t.Object({
  groupId: t.String(),
  role: t.Union([
    t.Literal("member"),
    t.Literal("admin"),
    t.Literal("treasurer"),
  ]),
  joinStatus: t.Union([
    t.Literal("original"),
    t.Literal("lateJoiner"),
    t.Literal("replacement"),
  ]),
  isRemoved: t.Optional(t.Boolean()),
  userId: t.String(),
});

export const Param = t.Object({
  id: t.String(),
});
