import jwt from "@elysiajs/jwt";
import Elysia, { error } from "elysia";
import bearer from "@elysiajs/bearer";
import db from "../../../prisma/client";
import { Group } from "../../utils/group";
import { groupModel, Param } from "./models";
import { keyGenerator } from "../../utils/generator";
import { rateLimit } from "elysia-rate-limit";

export const group = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET as string,
    }),
  )
  .use(
    rateLimit({
      scoping: "scoped",
      duration: 200 * 1000,
      generator: keyGenerator,
    }),
  )
  .use(bearer())

  .post(
    "/groups",
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

      const {
        name,
        purpose,
        contributionAmount,
        description,
        frequency,
        payoutMethod,
        startDate,
        endDate,
        memberLimit,
        status,
      } = body;

      const group = new Group();

      const groups = await group.create(
        name,
        purpose,
        contributionAmount,
        description,
        frequency,
        payoutMethod,
        startDate,
        endDate,
        memberLimit,
        userId,
        status,
      );

      return groups;
    },
    {
      body: groupModel,
      detail: {
        tags: ["Group"],
      },
      error: ({ error }) => {
        console.log(error);
        return {
          code: 500,
          error: "Internal Server Error",
        };
      },
    },
  )

  .patch(
    "/groups/:id",
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

      const {
        name,
        purpose,
        contributionAmount,
        description,
        frequency,
        payoutMethod,
        startDate,
        endDate,
        memberLimit,
        status,
      } = body;
      const group = new Group(id);

      const groups = await group.edit(
        name,
        purpose,
        contributionAmount,
        description,
        frequency,
        payoutMethod,
        startDate,
        endDate,
        memberLimit,
        userAvailable.id,
        status,
      );

      return groups;
    },
    {
      body: groupModel,
      params: Param,
      detail: {
        tags: ["Group"],
      },
      error: ({ error }) => {
        console.log(error);
        return {
          code: 500,
          error: "Internal Server Error",
        };
      },
    },
  )

  .delete(
    "/groups/:id",
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

      const group = new Group(id);

      const groups = await group.delete(userAvailable.id);

      return groups;
    },
    {
      params: Param,
      detail: {
        tags: ["Group"],
      },
      error: ({ error }) => {
        console.log(error);
        return {
          code: 500,
          error: "Internal Server Error",
        };
      },
    },
  )

  .get(
    "/group-rules/:id",
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

      const group = new Group(id);

      const groups = await group.getGroupRules();

      return groups;
    },
    {
      params: Param,
      detail: {
        tags: ["Group"],
      },
      error: ({ error }) => {
        console.log(error);
        return {
          code: 500,
          error: "Internal Server Error",
        };
      },
    },
  )

  .get(
    "/group-members/:id",
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

      const group = new Group(id);

      const groups = await group.getMembers();

      return groups;
    },
    {
      params: Param,
      detail: {
        tags: ["Group"],
      },
      error: ({ error }) => {
        console.log(error);
        return {
          code: 500,
          error: "Internal Server Error",
        };
      },
    },
  )

  .get(
    "/groups",
    async ({ bearer, jwt }) => {
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

      const group = new Group();

      const groups = await group.all(userId);

      return groups;
    },
    {
      detail: {
        tags: ["Group"],
      },
      error: ({ error }) => {
        console.log(error);
        return {
          code: 500,
          error: "Internal Server Error",
        };
      },
    },
  )

  .get(
    "/my-groups",
    async ({ bearer, jwt }) => {
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

      const group = new Group();

      const groups = await group.groups(userId);

      return groups;
    },
    {
      detail: {
        tags: ["Group"],
      },
      error: ({ error }) => {
        console.log(error);
        return {
          code: 500,
          error: "Internal Server Error",
        };
      },
    },
  )

  .get(
    "/groups/:id",
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

      const group = new Group(id,userAvailable?.id);

      const groups = await group.getGroupById();

      return groups;
    },
    {
      params: Param,
      detail: {
        tags: ["Group"],
      },
      error: ({ error }) => {
        console.log(error);
        return {
          code: 500,
          error: "Internal Server Error",
        };
      },
    },
  );
