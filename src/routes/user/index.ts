import jwt from "@elysiajs/jwt";
import Elysia, { error } from "elysia";
import bearer from "@elysiajs/bearer";
import db from "../../../prisma/client";

import { keyGenerator } from "../../utils/generator";
import { rateLimit } from "elysia-rate-limit";
import { User } from "../../utils/user";
import {registerPasswordModel} from "../auth/models";
import {userModel} from "./model";

export const user = new Elysia()
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

  .get(
    "/user",
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
          firstName:true,
          lastName:true,
          photoUrl:true,
          phoneNumber:true
        },
      });

      if (!userAvailable) {
        return error(400, "Unauthorized");
      }

      const group = new User(userAvailable?.id);

      const user = await group.getUser();

      return { user: userAvailable, details:user?.monthlySummary, upcoming:user?.upcoming };
    },
    {
      detail: {
        tags: ["User"],
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
        "/profile",
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
                    firstName:true,
                    lastName:true,
                    photoUrl:true,
                    phoneNumber:true
                },
            });

            if (!userAvailable) {
                return error(400, "Unauthorized");
            }

            return userAvailable
        },
        {
            detail: {
                tags: ["User"],
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

    .post(
        "/profile",
        async ({ body,jwt,bearer }) => {

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
                    firstName:true,
                    lastName:true,
                    photoUrl:true,
                    phoneNumber:true
                },
            });

            if (!userAvailable) {
                return error(400, "Unauthorized");
            }
            const { firstName, lastName, phoneNumber, email, photoUrl, password } =
                body;

            const userObj = new User(userAvailable?.id);

            const user = await userObj.edit(
                firstName,
                lastName,
                phoneNumber,
                email,
                photoUrl,
            );

           return user
        },
        {
            body: userModel,
            detail: {
                tags: ["Authentication"],
            },
        },
    )