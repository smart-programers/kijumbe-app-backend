import {t} from "elysia";


export const paymentModel =t.Object({
    groupId: t.String(),
    amount: t.Number(),
    feeAmount: t.Number(),
    date:t.Date()
})

