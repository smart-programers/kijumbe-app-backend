import db from "../../prisma/client";

export class User {
  public id: string;
  constructor(id?: string) {
    this.id = id as string;
  }

  async create(
    firstName: string,
    lastName: string,
    phoneNumber: string,
    email: string,
    photoUrl: string | null,
  ) {
    let user;

    user = await db.user.findFirst({
      where: {
        email: email,
      },
    });

    if (user) {
      return { result: {}, status: 400, message: "User Already Exist" };
    }

    user = await db.user.create({
      data: {
        email: email,
        firstName: firstName,
        lastName: lastName,
        photoUrl: photoUrl as string,
        phoneNumber: phoneNumber,
      },
      select: {
        email: true,
        photoUrl: true,
        phoneNumber: true,
        firstName: true,
        lastName: true,
      },
    });

    return { result: user, status: 200, message: "User Created Successfully" };
  }

  async createWithPassword(
    firstName: string,
    lastName: string,
    phoneNumber: string,
    email: string,
    photoUrl: string | null,
    password: string,
  ) {
    let user;

    user = await db.user.findFirst({
      where: {
        email: email,
      },
    });

    if (user) {
      return { result: {}, status: 400, message:"User Already Exist"};
    }

    const hashPassword = await Bun.password.hash(password);
    user = await db.user.create({
      data: {
        email: email,
        firstName: firstName,
        lastName: lastName,
        photoUrl: photoUrl as string,
        phoneNumber: phoneNumber,
        password: hashPassword,
      },
      select: {
        email: true,
        photoUrl: true,
        phoneNumber: true,
        firstName: true,
        lastName: true,
      },
    });

    return { result: user, status: 200, message: "User Created Successfully" };
  }

  async edit(
      firstName: string,
      lastName: string,
      phoneNumber: string,
      email: string,
      photoUrl: string | null,

  ){
    const user = await db.user.update({
      where:{
        id:this.id
      },
      data:{
        firstName:firstName,
        lastName:lastName,
        photoUrl:photoUrl,
        phoneNumber:phoneNumber,
        email:email
      }
    })

    return user
  }
  
  async getUser(){
    const userId = this.id; 
    
    const [monthlySummary, upcomingPayments] = await Promise.all([
  
      // db.$queryRawUnsafe(`
      //   WITH user_groups AS (
      //     SELECT 
      //       g.id AS group_id,
      //       g.name AS group_name,
      //       g.frequency,
      //       g."startDate",
      //       g."endDate",
      //       g."contributionAmount",
      //       m.id AS member_id
      //     FROM "Group" g
      //     JOIN "Member" m ON g.id = m."groupId"
      //     WHERE m."userId" = $1 AND m."isRemoved" = false
      //   ),
    
      //   payment_series AS (
      //     SELECT 
      //       ug.group_id,
      //       ug.frequency,
      //       gs.payment_date
      //     FROM user_groups ug,
      //     LATERAL generate_series(
      //       ug."startDate", 
      //       ug."endDate", 
      //       CASE
      //         WHEN ug.frequency = 'daily' THEN INTERVAL '1 day'
      //         WHEN ug.frequency = 'weekly' THEN INTERVAL '1 week'
      //         WHEN ug.frequency = 'biweekly' THEN INTERVAL '2 weeks'
      //         WHEN ug.frequency = 'monthly' THEN INTERVAL '1 month'
      //         ELSE INTERVAL '1 day'
      //       END
      //     ) AS gs(payment_date)
      //   ),
    
      //   missed_payments AS (
      //     SELECT
      //       ps.group_id,
      //       DATE_TRUNC('month', ps.payment_date) AS month,
      //       COUNT(*) AS expected_count
      //     FROM payment_series ps
      //     LEFT JOIN "Contribution" c 
      //       ON c."groupId" = ps.group_id 
      //       AND DATE_TRUNC('day', c."dueDate") = DATE_TRUNC('day', ps.payment_date)
      //     GROUP BY ps.group_id, DATE_TRUNC('month', ps.payment_date)
      //   ),
    
      //   payments_made AS (
      //     SELECT
      //       p."groupId",
      //       DATE_TRUNC('month', p."dateCompleted") AS month,
      //       SUM(p.amount) AS total_paid
      //     FROM "Payment" p
      //     WHERE p."userId" = $1 AND p.status = 'completed'
      //     GROUP BY p."groupId", DATE_TRUNC('month', p."dateCompleted")
      //   ),
    
      //   payouts_received AS (
      //     SELECT
      //       pt."groupId",
      //       DATE_TRUNC('month', pt."processedDate") AS month,
      //       SUM(g."contributionAmount") AS total_received
      //     FROM "Payout" pt
      //     JOIN "Member" m ON pt."memberId" = m.id
      //     JOIN "Group" g ON pt."groupId" = g.id
      //     WHERE m."userId" = $1 AND pt.status = 'completed'
      //     GROUP BY pt."groupId", DATE_TRUNC('month', pt."processedDate")
      //   )
    
      //   SELECT
      //     g.group_name,
      //     g.frequency,
      //     ms.month,
      //     g."contributionAmount" * COALESCE(mp.expected_count, 0) AS expected_contributions,
      //     pm.total_paid,
      //     pr.total_received,
      //     CASE
      //       WHEN COALESCE(pm.total_paid, 0) >= g."contributionAmount" * COALESCE(mp.expected_count, 0)
      //         THEN 'paid'
      //       WHEN ms.month < DATE_TRUNC('month', CURRENT_DATE)
      //         THEN 'missed'
      //       ELSE 'upcoming'
      //     END AS status
      //   FROM user_groups g
      //   JOIN (
      //     SELECT DISTINCT group_id, DATE_TRUNC('month', payment_date) AS month
      //     FROM payment_series
      //   ) AS ms ON g.group_id = ms.group_id
      //   LEFT JOIN missed_payments mp ON g.group_id = mp.group_id AND ms.month = mp.month
      //   LEFT JOIN payments_made pm ON g.group_id = pm."groupId" AND ms.month = pm.month
      //   LEFT JOIN payouts_received pr ON g.group_id = pr."groupId" AND ms.month = pr.month
      //   ORDER BY g.group_name, ms.month DESC;
      // `, userId),
   
     db.$queryRawUnsafe(`
        WITH current_month AS (
          SELECT DATE_TRUNC('month', CURRENT_DATE) AS month
        ),
      
        contributions AS (
          SELECT
            SUM(c.amount) AS total_paid,
            SUM(COALESCE(c."penaltyAmount", 0)) AS fines
          FROM "Contribution" c
          JOIN "Member" m ON c."memberId" = m.id
          WHERE m."userId" = $1
            AND DATE_TRUNC('month', c."dueDate") = (SELECT month FROM current_month)
        ),
      
        payouts AS (
          SELECT
            SUM(g."contributionAmount") AS total_received
          FROM "Payout" pt
          JOIN "Member" m ON pt."memberId" = m.id
          JOIN "Group" g ON pt."groupId" = g.id
          WHERE m."userId" = $1 
            AND pt.status = 'completed'
            AND DATE_TRUNC('month', pt."processedDate") = (SELECT month FROM current_month)
        )
      
        SELECT
          (SELECT month FROM current_month) AS month,
          COALESCE(c.total_paid, 0) AS total_paid,
          COALESCE(c.fines, 0) AS fines,
          COALESCE(p.total_received, 0) AS total_received
        FROM current_month cm
        LEFT JOIN contributions c ON TRUE
        LEFT JOIN payouts p ON TRUE;
      `, userId),




    
      db.$queryRawUnsafe(`
        WITH user_groups AS (
          SELECT 
            g.id AS group_id,
            g.name AS group_name,
            g.frequency,
            g."contributionAmount",
            g."startDate",
            g."endDate"
          FROM "Group" g
          JOIN "Member" m ON g.id = m."groupId"
          WHERE m."userId" = $1 AND m."isRemoved" = false AND m.status='approved' AND g.status='active'
        ),
      
        upcoming_dates AS (
          SELECT
            ug.group_id,
            ug.group_name,
            ug.frequency,
            ug."contributionAmount" AS expected_amount,
            gs.payment_date AS next_due_date
          FROM user_groups ug,
          LATERAL (
            SELECT payment_date
            FROM generate_series(
              GREATEST(ug."startDate", CURRENT_DATE),
              ug."endDate",
              CASE
                WHEN ug.frequency = 'daily' THEN INTERVAL '1 day'
                WHEN ug.frequency = 'weekly' THEN INTERVAL '1 week'
                WHEN ug.frequency = 'biweekly' THEN INTERVAL '2 weeks'
                WHEN ug.frequency = 'monthly' THEN INTERVAL '1 month'
                ELSE INTERVAL '1 day'
              END
            ) AS gs(payment_date)
            ORDER BY payment_date
            LIMIT 5
          ) gs
        ),
      
        contributions AS (
          SELECT
            c."groupId",
            c."dueDate",
            SUM(c.amount) AS total_paid,
            SUM(COALESCE(c."penaltyAmount", 0)) AS fine
          FROM "Contribution" c
          JOIN "Member" m ON c."memberId" = m.id
          WHERE m."userId" = $1
          GROUP BY c."groupId", c."dueDate"
        ),
      
        payouts AS (
          SELECT
            pt."groupId",
            pt."processedDate",
            SUM(g."contributionAmount") AS total_received
          FROM "Payout" pt
          JOIN "Member" m ON pt."memberId" = m.id
          JOIN "Group" g ON pt."groupId" = g.id
          WHERE m."userId" = $1 AND pt.status = 'completed'
          GROUP BY pt."groupId", pt."processedDate"
        )
      
        SELECT
          u.group_name,
          u.group_id,
          u.frequency,
          u.next_due_date,
          u.expected_amount,
          COALESCE(c.total_paid, 0) AS total_paid,
          COALESCE(po.total_received, 0) AS total_received,
          COALESCE(c.fine, 0) AS fine
        FROM upcoming_dates u
        LEFT JOIN contributions c 
          ON c."groupId" = u.group_id AND DATE_TRUNC('day', c."dueDate") = u.next_due_date
        LEFT JOIN payouts po 
          ON po."groupId" = u.group_id AND DATE_TRUNC('day', po."processedDate") = u.next_due_date
        ORDER BY u.group_name, u.next_due_date;
      `, userId)

    ]);

    
    return {
      monthlySummary,
      upcoming: upcomingPayments
    };


  }
}
