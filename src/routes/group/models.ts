import { t } from "elysia";

export const Param = t.Object({
  id: t.String(),
});

export const groupModel = t.Object({
  name: t.String(),
  purpose: t.String(),
  contributionAmount: t.Number(),
  description: t.String(),
  frequency: t.String(),
  payoutMethod: t.String(),
  startDate: t.Date(),
  endDate: t.Date(),
  memberLimit: t.Number(),
  status: t.Union([
    t.Literal("active"),
    t.Literal("completed"),
    t.Literal("cancelled"),
  ]),
});
