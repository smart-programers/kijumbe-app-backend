import { Frequency, groupStatus, PaymentMethod } from "@prisma/client";
import db from "../../prisma/client";

export class Group {
  public id: string;

  constructor(id?: string) {
    this.id = id as string;
  }

  async all(userId: string) {
    const result = await db.$queryRaw`
      SELECT 
        i.*,
        g.members,
        g.group_status
      FROM "Group" i
      LEFT JOIN (
        SELECT 
          m."groupId",
          COUNT(m.id)::int AS members,
          CASE 
            WHEN MAX(m."status") = 'pending' THEN 'pending'
            ELSE 'active'
          END AS group_status
        FROM "Member" m
        WHERE m."isRemoved" = false
        GROUP BY m."groupId"
      ) g ON g."groupId" = i.id
      LEFT JOIN "User" u ON u.id = i."userId"
      WHERE u.id = ${userId} OR i."userId" = ${userId}
    `;

return result
  }

  async groups(userId: string) {
    const groups = await db.group.findMany({
      where: {
        userId: userId,
      },
    });

    return groups;
  }

  async getGroupById() {
    const group = await db.group.findFirst({
      where: {
        id: this.id,
      },
      include: {
        member: {
          select: {
            status:true,
            isRemoved:true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                photoUrl: true,
                phoneNumber: true,
                payment: true,
              },
            },
          },
        },
        rule: {
          select: {
            title: true,
            description: true,
            penaltyAmount: true,
            type: true,
            isActive: true,
          },
        },
        payment: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                id: true,
              },
            },
            contribution: {
              select: {
                member: {
                  select: {
                    user: {
                      select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                      },
                    },
                  },
                },
                dueDate: true,
                paidDate: true,
                penaltyAmount: true,
                amount: true,
                status: true,
                paymentMethod: true,
              },
            },
            dateCompleted: true,
            status: true,
            method: true,
            amount: true,
            feeAmount: true,
            receiptUrl: true,
            transactionId: true,
            notes: true,
            dateInitiated: true,
            receipt: true,
          },
        },
      },
    });
    
    return group
  }

  async create(
    name: string,
    purpose: string,
    contributionAmount: number,
    description: string,
    frequency: string,
    payoutMethod: string,
    startDate: Date,
    endDate: Date,
    memberLimit: number,
    createdBy: string,
    status: string,
  ) {
    const group = await db.group.create({
      data: {
        contributionAmount: contributionAmount,
        name: name,
        purpose: purpose,
        createdBy: createdBy,
        endDate: endDate,
        startDate: startDate,
        memberLimit: memberLimit,
        frequency: frequency as Frequency,
        description: description,
        payoutMethod: payoutMethod as PaymentMethod,
        status: status as groupStatus,
        userId: createdBy,
      },
    });
    
    await db.member.create({
      data:{
        groupId: group?.id,
        role: "admin",
        joinStatus:"original",
        status:"approved",
        isRemoved: false,
        userId: createdBy,
        entryUser: createdBy,
      }
    })

    return group;
  }

  async edit(
    name: string,
    purpose: string,
    contributionAmount: number,
    description: string,
    frequency: string,
    payoutMethod: string,
    startDate: Date,
    endDate: Date,
    memberLimit: number,
    createdBy: string,
    status: string,
  ) {
    const group = await db.group.update({
      where: {
        id: this.id,
        createdBy: createdBy,
      },
      data: {
        contributionAmount: contributionAmount,
        name: name,
        purpose: purpose,
        endDate: endDate,
        startDate: startDate,
        memberLimit: memberLimit,
        frequency: frequency as Frequency,
        description: description,
        payoutMethod: payoutMethod as PaymentMethod,
        status: status as groupStatus,
      },
    });

    return group;
  }

  async delete(createdBy: string) {
    const group = await db.group.delete({
      where: {
        id: this.id,
        createdBy: createdBy,
      },
    });
  }

  async getGroupRules() {
    const rules = await db.rule.findMany({
      where: {
        groupId: this.id,
      },
    });

    return rules;
  }

  async getMembers() {
    const members = await db.member.findMany({
      where: {
        groupId: this.id,
      },
      include: {
        user: {
          select: {
            firstName: true,
            id: true,
            lastName: true,
            email: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
            description: true,
            purpose: true,
          },
        },
      },
    });

    return members;
  }
}
