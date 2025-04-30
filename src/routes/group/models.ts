import { t } from "elysia";

export const Param = t.Object({
  id: t.String(),
});

export const groupModel = t.Object({
  name: t.String(),
  purpose: t.String(),
  contributionAmount: t.Number(),
  description: t.String(),
  frequency: t.Union([
    t.Literal("daily"),
    t.Literal("weekly"),
    t.Literal("biweekly"),
    t.Literal("monthly"),
  ]),
  payoutMethod: t.Union([
    t.Literal("sequential"),
    t.Literal("random"),
    t.Literal("byNeed"),
    t.Literal("custom"),
  ]),
  startDate: t.Date(),
  endDate: t.Date(),
  memberLimit: t.Number(),
  status: t.Union([
    t.Literal("active"),
    t.Literal("completed"),
    t.Literal("cancelled"),
  ]),
});
