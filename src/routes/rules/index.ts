import bearer from "@elysiajs/bearer";
import jwt from "@elysiajs/jwt";
import Elysia, { error } from "elysia";
import db from "../../../prisma/client";
import { Rule } from "../../utils/rule";
import { Param, ruleModel } from "./models";

export const rule = new Elysia()
  .use(bearer())

  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET as string,
    }),
  )

  .post(
    "/rule",
    async ({ bearer, jwt, body }) => {
      if (!bearer) {
        return error(400, "Unauthorized");
      }
      let userId = "";
      try {
        const decoded: any = await jwt.verify(bearer);
        userId = decoded.id;
      } catch (err) {
        console.error("JWT ERROR:", err);
        return error(400, "BAD REQUEST");
      }

      const userAvailable = await db.user.findFirst({
        where: {
          id: userId,
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

      const { groupId, title, description, penaltyAmount, type, isActive } =
        body;
      const rule = new Rule();

      const rules = await rule.create(
        groupId,
        title,
        description,
        penaltyAmount,
        type,
        isActive,
      );

      return rules;
    },
    {
      body: ruleModel,
      detail: {
        tags: ["Rule"],
      },
    },
  )

  .patch(
    "/rule/:id",
    async ({ bearer, jwt, body, params }) => {
      if (!bearer) {
        return error(400, "Unauthorized");
      }
      let userId = "";
      try {
        const decoded: any = await jwt.verify(bearer);
        userId = decoded.id;
      } catch (err) {
        console.error("JWT ERROR:", err);
        return error(400, "BAD REQUEST");
      }

      const userAvailable = await db.user.findFirst({
        where: {
          id: userId,
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
      const { groupId, title, description, penaltyAmount, type, isActive } =
        body;
      const rule = new Rule(id);

      const rules = await rule.edit(
        groupId,
        title,
        description,
        penaltyAmount,
        type,
        isActive,
      );

      return rules;
    },
    {
      body: ruleModel,
      params: Param,
      detail: {
        tags: ["Rule"],
      },
    },
  )

  .delete(
    "/rule/:id",
    async ({ bearer, jwt, params }) => {
      if (!bearer) {
        return error(400, "Unauthorized");
      }
      let userId = "";
      try {
        const decoded: any = await jwt.verify(bearer);
        userId = decoded.id;
      } catch (err) {
        console.error("JWT ERROR:", err);
        return error(400, "BAD REQUEST");
      }

      const userAvailable = await db.user.findFirst({
        where: {
          id: userId,
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
      const rule = new Rule(id);

      const rules = await rule.delete();

      return rules;
    },
    {
      params: Param,
      detail: {
        tags: ["Rule"],
      },
    },
  );
