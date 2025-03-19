import { Elysia } from "elysia";
import { authentication } from "./routes/auth";
import swagger from "@elysiajs/swagger";
import cors from "@elysiajs/cors";
import { Otp } from "./routes/otp";

const app = new Elysia()
  .use(authentication)
  .use(Otp)
  .use(swagger())
  .use(cors())
  .get("/", () => "Hello Elysia")
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
