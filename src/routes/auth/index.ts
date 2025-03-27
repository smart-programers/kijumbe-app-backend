import Elysia, { error } from "elysia";
import { Auth } from "../../utils/auth";
import {
  loginModel,
  loginPasswordModel,
  registerModel,
  registerPasswordModel,
} from "./models";
import jwt from "@elysiajs/jwt";
import { User } from "../../utils/user";
import { password } from "bun";
import { rateLimit } from "elysia-rate-limit";
import { keyGenerator } from "../../utils/generator";

export const authentication = new Elysia({ prefix: "/authentication" })
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
  .post(
    "/login-otp",
    async ({ body, jwt }) => {
      const { email, otp } = body;

      const auth = new Auth();
      const userId = await auth.Login(email, otp);

      const token = await jwt.sign({ id: userId });

      return token;
    },
    {
      body: loginModel,
      detail: {
        tags: ["Authentication"],
      },
    },
  )

  .post(
    "/login",
    async ({ body, jwt }) => {
      const { email, password } = body;

      const auth = new Auth();
      const userId = await auth.LoginWithPassword(email, password);

      const token = await jwt.sign({ id: userId });

      return token;
    },
    {
      body: loginPasswordModel,
      detail: {
        tags: ["Authentication"],
      },
    },
  )

  .post(
    "/register",
    async ({ body }) => {
      const { firstName, lastName, phoneNumber, email, photoUrl, password } =
        body;

      const userObj = new User();

      const user = await userObj.createWithPassword(
        firstName,
        lastName,
        phoneNumber,
        email,
        photoUrl,
        password,
      );

      return user;
    },
    {
      body: registerPasswordModel,
      detail: {
        tags: ["Authentication"],
      },
    },
  )

  .post(
    "/register-otp",
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
      detail: {
        tags: ["Authentication"],
      },
    },
  );
