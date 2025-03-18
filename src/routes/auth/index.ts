import Elysia, { error } from "elysia";
import { Auth } from "../../utils/auth";
import { loginModel } from "./models";
import jwt from "@elysiajs/jwt";

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
  );
