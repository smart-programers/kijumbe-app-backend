import axios from "axios";
import db from "../../prisma/client";
import {randomUUID} from "crypto";

export class Payment {
    public id: string;

    constructor(id?: string) {
        this.id = id ?? randomUUID();
    }

    async create(
        groupId: string,
        amount: number,
        feeAmount: number,
        notes: string,
        userId: string,
        phoneNumber: string,
        date: Date
    ) {
        const totalAmount = amount + feeAmount;
        const externalId = `contribution-${Date.now()}`;
        const {payUrl, token} = process.env

        const phone = phoneNumber.startsWith('+255') ? `0${phoneNumber.slice(4)}` : phoneNumber;

        const payload = {
            phone: phone,
            amount: totalAmount,
        };

        const response = await axios.post(
            payUrl!,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "Application/json",
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("PalmPesa response:", response.data);

        const responseData = response.data.data?.[0] || {};
        const transactionId = responseData.transid || externalId;
        const receiptNumber = responseData.order_id || externalId;
        const status = (responseData.status || "pending").toLowerCase();

        const payment = await db.payment.create({
            data: {
                groupId: groupId,
                userId: userId,
                amount: amount,
                feeAmount: feeAmount,
                dateInitiated: new Date(),
                status: status,
                method: "mobileMoney",
                receiptUrl: receiptNumber,
                notes,
            },
        });

        const receipt = await db.receipt.create({
            data: {
                userId: userId,
                paymentId: payment.id,
                groupId: groupId,
                amount: amount,
                feeAmount: feeAmount,
                date: new Date(),
                transactionId: transactionId,
                receiptNumber: receiptNumber,
                paymentMethod: "mobileMoney",
            },
        });

        const member = await db.member.findFirst({
            where: {
                userId: userId,
                groupId: groupId,
                isRemoved: false,
                status: 'approved',
            },
        });

        if (!member) {
            throw new Error("User is not an approved member of the group.");
        }

        const contribution = await db.contribution.create({
            data: {
                groupId: groupId,
                memberId: member.id,
                amount: amount,
                dueDate: date,
                status: status,
                receiptId: receipt.id,
                paymentMethod: "mobileMoney",
            },
        });

        return {
            status: response.data.status ?? "unknown",
            message: response.data.message ?? "No message provided",
            transactionId,
            receiptNumber,
        };
    }
}
