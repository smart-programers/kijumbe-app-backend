import bearer from "@elysiajs/bearer";
import jwt from "@elysiajs/jwt";
import Elysia, { error } from "elysia";
import db from "../../../prisma/client";
import { Member } from "../../utils/member";
import { adminModel, membermodel, Param, requestModel } from "./models";
import { keyGenerator } from "../../utils/generator";
import { rateLimit } from "elysia-rate-limit";

export const member = new Elysia()

  .use(bearer())
  .use(
    rateLimit({
      scoping: "scoped",
      duration: 200 * 1000,
      generator: keyGenerator,
    }),
  )
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

      const { groupId, role, joinStatus, isRemoved } = body;

      const member = new Member();

      const members = await member.create(
        groupId,
        role,
        joinStatus,
        userAvailable.id,
        userAvailable.id,
        isRemoved,
      );
      
      switch(members.status){
        case 200:
          return members.result
          break;
          
        case 400:
          return error(members.status,members.message)
          break;
          
        default:
          return error(500,"Internal Server Error")
          break;
      }

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

      const { groupId, role, joinStatus, isRemoved} = body;

      const { id } = params;
      const member = new Member(id);

      const members = await member.edit(
        groupId,
        role,
        joinStatus,
        userAvailable.id,
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
  
  .post(
    "/admin-member",
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

      const { groupId, role, joinStatus, isRemoved,userId } = body;

      const member = new Member();

      const members = await member.adminAdd(
        groupId,
        role,
        joinStatus,
        userId,
        userAvailable.id,
        isRemoved,
      );
      
      switch(members.status){
        case 200:
          return members.result
          break;
          
        case 400:
          return error(members.status,members.message)
          break;
          
        default:
          return error(500,"Internal Server Error")
          break;
      }

    },
    {
      body: adminModel,
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

      const { groupId, role, joinStatus, isRemoved} = body;

      const { id } = params;
      const member = new Member(id);

      const members = await member.edit(
        groupId,
        role,
        joinStatus,
        userAvailable.id,
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
  
  .patch(
    "/member-request/:id",
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

      const { status } = body;

      const { id } = params;
    
      const member = new Member(id);

      const members = await member.update(
        status
      );

      switch(members.status){
        case 200:
          return members.message
          break;
          
        case 400:
          return error(members.status,members.message)
          break;
          
        default:
          return error(500,"Internal Server Error")
          break;
      }
    },
    {
      body: requestModel,
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

      const members = await member.delete(userAvailable.id);

      
      switch(members.status){
        case 200:
          return members.message
          break;
          
        case 400:
          return error(members.status,members.message)
          break;
          
        default:
          return error(500,"Internal Server Error")
          break;
      }
    },
    {
      params: Param,
      detail: {
        tags: ["Member"],
      },
    },
  );
