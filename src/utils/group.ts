import { Frequency, groupStatus, PaymentMethod } from "@prisma/client";
import db from "../../prisma/client";

export class Group {
  public id: string;
  public userId:string

  constructor(id?: string,userId?:string) {
    this.id = id as string;
    this.userId = userId as string;
  }

  async all(userId: string) {
    const result = await db.$queryRaw`
      SELECT DISTINCT
        i.*,
        COALESCE(g.members, 0) AS members,
        CASE
          WHEN EXISTS (
            SELECT 1
            FROM "Member" m
            WHERE m."groupId" = i.id AND m."userId" = ${userId} AND m."status" = 'pending'
          ) THEN 'pending'
          WHEN EXISTS (
            SELECT 1
            FROM "Member" m
            WHERE m."groupId" = i.id AND m."userId" = ${userId} AND m."status" = 'approved' AND m."isRemoved"='true'
          ) THEN 'removed'
          WHEN COALESCE(g.group_status, 'active') = 'pending' THEN 'pending'
          ELSE 'active'
          END AS group_status
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
          AND m."status" = 'approved'
        GROUP BY m."groupId"
      ) g ON g."groupId" = i.id
             LEFT JOIN "User" u ON u.id = i."userId"
             LEFT JOIN "Member" m ON m."groupId" = i.id
      WHERE u.id = ${userId} OR i."userId" = ${userId} OR m."userId" = ${userId}
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
    const result = await db.$queryRawUnsafe(`
    WITH member_data AS (
      SELECT
        m."groupId",
        m."userId",
        m.status AS member_status,
        m."isRemoved",
        m.role,
        u.id AS user_id,
        u."firstName",
        u."lastName",
        u."photoUrl",
        u."phoneNumber",
      m.id
      FROM "Member" m
             LEFT JOIN "User" u ON u.id = m."userId"
    ),
         group_data AS (
           SELECT
             g.id AS group_id,
             g.name,
             g.purpose,
             g.description,
             g."contributionAmount",
             g.frequency,
             g."startDate",
             g."endDate",
             g."memberLimit",
             g."payoutMethod",
             g.status AS group_status,
             g."createdBy",
             g."createdAt",
             g."updatedAt",
             g."userId" AS group_user_id,
             ARRAY(
               SELECT payment_date
      FROM generate_series(
        GREATEST(g."startDate", CURRENT_DATE),
        g."endDate",
        CASE
          WHEN g.frequency = 'daily' THEN INTERVAL '1 day'
          WHEN g.frequency = 'weekly' THEN INTERVAL '1 week'
          WHEN g.frequency = 'biweekly' THEN INTERVAL '2 weeks'
          WHEN g.frequency = 'monthly' THEN INTERVAL '1 month'
          ELSE INTERVAL '1 day'
        END
      ) AS payment_date
      ORDER BY payment_date
      LIMIT 20
    ) AS upcoming_payments
           FROM "Group" g
           WHERE g.id = $1
         )

    SELECT
      gd.*,
      (
        SELECT json_agg(
                   json_build_object(
                       'status', md.member_status,
                       'isRemoved', md."isRemoved",
                       'role', md.role,
                       'user', json_build_object(
                           'id', md.user_id,
                           'firstName', md."firstName",
                           'lastName', md."lastName",
                           'photoUrl', md."photoUrl",
                           'phoneNumber', md."phoneNumber",
                           'member_id', md.id
                               )
                      
                   )
               )
        FROM member_data md
        WHERE md."groupId" = gd.group_id
      ) AS members,
      (
        SELECT json_agg(
                   json_build_object(
                       'status', md.member_status,
                       'isRemoved', md."isRemoved",
                       'role', md.role,
                       'user', json_build_object(
                           'id', md.user_id,
                           'firstName', md."firstName",
                           'lastName', md."lastName",
                           'photoUrl', md."photoUrl",
                           'phoneNumber', md."phoneNumber",
                           'member_id', md.id
                               )
                      
                   )
               )
        FROM member_data md
        WHERE md."groupId" = gd.group_id AND md.member_status = 'approved' AND md."isRemoved" = false
      ) AS approved_members,
      (
        SELECT json_agg(
                   json_build_object(
                       'status', md.member_status,
                       'isRemoved', md."isRemoved",
                       'role', md.role,
                       'user', json_build_object(
                           'id', md.user_id,
                           'firstName', md."firstName",
                           'lastName', md."lastName",
                           'photoUrl', md."photoUrl",
                           'phoneNumber', md."phoneNumber",
                           'member_id', md.id
                               )
                   )
               )
        FROM member_data md
        WHERE md."groupId" = gd.group_id AND md.member_status = 'pending'
      ) AS waiting_requests,
      (
        SELECT json_agg(
                   json_build_object(
                       'status', md.member_status,
                       'isRemoved', md."isRemoved",
                       'role', md.role,
                       'user', json_build_object(
                           'id', md.user_id,
                           'firstName', md."firstName",
                           'lastName', md."lastName",
                           'photoUrl', md."photoUrl",
                           'phoneNumber', md."phoneNumber",
                           'member_id', md.id
                               )
                   )
               )
        FROM member_data md
        WHERE md."groupId" = gd.group_id AND md.member_status = 'rejected'
      ) AS rejected_members,
      (
        SELECT CAST(COUNT(*) AS TEXT)
        FROM member_data md
        WHERE md."groupId" = gd.group_id AND md.member_status = 'approved' AND md."isRemoved" = false
      ) AS approved_member_count,
      (
        SELECT md.role
        FROM member_data md
        WHERE md."groupId" = gd.group_id AND md.user_id = $2
           LIMIT 1
      ) AS current_user_role,
            (
              SELECT json_agg(
                json_build_object(
                  'title', r.title,
                  'description', r.description,
                  'penaltyAmount', r."penaltyAmount",
                  'type', r.type,
                  'isActive', r."isActive"
                )
              )
              FROM "Rule" r
              WHERE r."groupId" = gd.group_id
            ) AS rules,
            (
              SELECT json_agg(
                json_build_object(
                  'user', json_build_object(
                    'id', pu.id,
                    'firstName', pu."firstName",
                    'lastName', pu."lastName"
                  ),
                  'contribution', json_build_object(
                    'memberUser', json_build_object(
                      'id', cu.id,
                      'firstName', cu."firstName",
                      'lastName', cu."lastName",
                      'email', cu.email
                    ),
                    'dueDate', c."dueDate",
                    'paidDate', c."paidDate",
                    'penaltyAmount', c."penaltyAmount",
                    'amount', c.amount,
                    'status', c.status,
                    'paymentMethod', c."paymentMethod"
                  ),
                  'dateCompleted', p."dateCompleted",
                  'status', p.status,
                  'method', p.method,
                  'amount', p.amount,
                  'feeAmount', p."feeAmount",
                  'receiptUrl', p."receiptUrl",
                  'transactionId', p."transactionId",
                  'notes', p.notes,
                  'dateInitiated', p."dateInitiated",
                  'receipts', (
                    SELECT json_agg(
                      json_build_object(
                        'id', r.id,
                        'amount', r.amount,
                        'feeAmount', r."feeAmount",
                        'date', r.date,
                        'transactionId', r."transactionId",
                        'receiptNumber', r."receiptNumber",
                        'paymentMethod', r."paymentMethod"
                      )
                    )
                    FROM "Receipt" r
                    WHERE r."paymentId" = p.id
                  )
                )
              )
              FROM "Payment" p
              LEFT JOIN "User" pu ON pu.id = p."userId"
              LEFT JOIN "Contribution" c ON c.id = p."contributionId"
              LEFT JOIN "Member" cm ON cm.id = c."memberId"
              LEFT JOIN "User" cu ON cu.id = cm."userId"
              WHERE p."groupId" = gd.group_id
            ) AS payments
    FROM group_data gd;
  `, this.id, this.userId);

    // @ts-ignore
    if (result && result.length > 0) {
      // @ts-ignore
      return result[0];
    }
      return null;

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

  async getGroupRules(userId: string) {
    const group = await db.group.findUnique({
      where: {
        id: this.id,
      },
      include: {
        rule: true,
        member: {
          where: {
            userId: userId,
            isRemoved:false,
          },
          select: {
            id: true,
            role:true
          },
        },
      },
    });


    return group;
  }

  async getGroupsNotMember(userId: string) {
    const groups = await db.group.findMany({
      where: {
        status:"active",
        member: {
          none: {
            userId: userId,
          },
        },
      },
      include: {
        rule: true,
        member:{
          where:{
            status:"approved",
            isRemoved:false
          }
        }
      },
    });

    return groups;
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
