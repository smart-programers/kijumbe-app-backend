import {Elysia, error} from "elysia";
import db from "../../../prisma/client";
import {Member} from "../../utils/member";
import {LeftModel} from "../member/models";
import {paymentModel} from "./model";
import {Payment} from "../../utils/payment";
import bearer from "@elysiajs/bearer";
import jwt from "@elysiajs/jwt";


export const payment = new Elysia()
    .use(bearer())
    .use(
        jwt({
            name: "jwt",
            secret: process.env.JWT_SECRET as string,
        }),
    )

    .post(
        "/pay",
        async ({bearer, jwt, body}) => {

            if (!bearer) {
                return error(400, "Unauthorized");
            }
            let deriverUserId = "";
            try {
                const decoded: any = await jwt.verify(bearer);
                deriverUserId = decoded.id;
            } catch (err) {
                console.error("JWT ERROR:", err);
                return error(400, "BAD REQUEST");
            }

            const userAvailable = await db.user.findFirst({
                where: {
                    id: deriverUserId,
                },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    phoneNumber: true
                },
            });

            if (!userAvailable) {
                return error(400, "Unauthorized");
            }

            const {groupId, amount, feeAmount, date} = body;
            const pay = new Payment();

            const payment = await pay.create(groupId, amount, feeAmount, `Malipo`, userAvailable.id, userAvailable.phoneNumber as string, date);

            return payment
        },
        {
            body: paymentModel,
            detail: {
                tags: ["Payment"],
            },

            error: ({error}) => {
                console.log(error);

            }
        },
    )