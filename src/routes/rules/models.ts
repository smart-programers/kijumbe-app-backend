import { t } from "elysia";

export const ruleModel = t.Object({
  groupId: t.String(),
  title: t.String(),
  description: t.String(),
  penaltyAmount: t.Number(),
  type: t.Union([
    t.Literal("latePenalty"),
    t.Literal("missedPaymentPenalty"),
    t.Literal("attendance"),
    t.Literal("other"),
  ]),
  isActive: t.Boolean(),
});

export const Param = t.Object({
  id: t.String(),
});
