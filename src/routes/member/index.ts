import bearer from "@elysiajs/bearer";
import jwt from "@elysiajs/jwt";
import Elysia, { error } from "elysia";
import db from "../../../prisma/client";
import { Member } from "../../utils/member";
import { membermodel, Param } from "./models";

export const member = new Elysia()

  .use(bearer())

  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET as string,
    }),
  )

  .post(
    "/member",
    async ({ bearer, jwt, body }) => {
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
        },
      });

      if (!userAvailable) {
        return error(400, "Unauthorized");
      }

      const { groupId, role, joinStatus, isRemoved, userId } = body;

      const member = new Member();

      const members = await member.create(
        groupId,
        role,
        joinStatus,
        userId,
        userAvailable.id,
        isRemoved,
      );

      return members;
    },
    {
      body: membermodel,
      detail: {
        tags: ["Member"],
      },
    },
  )

  .patch(
    "/member/:id",
    async ({ bearer, jwt, body, params }) => {
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
        },
      });

      if (!userAvailable) {
        return error(400, "Unauthorized");
      }

      const { groupId, role, joinStatus, isRemoved, userId } = body;

      const { id } = params;
      const member = new Member(id);

      const members = await member.edit(
        groupId,
        role,
        joinStatus,
        userId,
        userAvailable.id,
        isRemoved,
      );

      return members;
    },
    {
      body: membermodel,
      params: Param,
      detail: {
        tags: ["Member"],
      },
    },
  )

  .delete(
    "/member/:id",
    async ({ bearer, jwt, params }) => {
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
        },
      });

      if (!userAvailable) {
        return error(400, "Unauthorized");
      }

      const { id } = params;
      const member = new Member(id);

      const members = await member.delete();

      return members;
    },
    {
      params: Param,
      detail: {
        tags: ["Member"],
      },
    },
  );
