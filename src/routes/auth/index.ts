import Elysia, { error } from "elysia";
import { Auth } from "../../utils/auth";
import { loginModel, registerModel } from "./models";
import jwt from "@elysiajs/jwt";
import { User } from "../../utils/user";

export const authentication = new Elysia({ prefix: "/authentication" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET as string,
    }),
  )
  .post(
    "/login",
    async ({ body, jwt }) => {
      const { email, otp } = body;

      const auth = new Auth();
      const userId = await auth.Login(email, otp);

      const token = await jwt.sign({ id: userId });

      return token;
    },
    {
      body: loginModel,
    },
  )

  .post(
    "/register",
    async ({ body }) => {
      const { firstName, lastName, phoneNumber, email, photoUrl } = body;

      const userObj = new User();

      const user = await userObj.create(
        firstName,
        lastName,
        phoneNumber,
        email,
        photoUrl,
      );

      return user;
    },
    {
      body: registerModel,
    },
  );
