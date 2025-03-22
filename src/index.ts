import { Elysia } from "elysia";
import { authentication } from "./routes/auth";
import swagger from "@elysiajs/swagger";
import cors from "@elysiajs/cors";
import { Otp } from "./routes/otp";
import { group } from "./routes/group";
import { rule } from "./routes/rules";
import { member } from "./routes/member";

const app = new Elysia()
  .use(authentication)
  .use(Otp)
  .use(group)
  .use(rule)
  .use(member)
  .use(swagger())
  .use(cors())
  .get("/", () => "Hello Elysia")
  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
);
