import Elysia, { error } from "elysia";
import { Auth } from "./auth";
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
      const { email, password } = body;

      const auth = new Auth();
      const userId = await auth.Login(email, password);

      const token = await jwt.sign({ id: userId });

      return token;
    },
    {
      body: loginModel,
    },
  );
