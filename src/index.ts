import { Elysia } from "elysia";
import { authentication } from "./routes/auth";

const app = new Elysia()
  .use(authentication)
  .get("/", () => "Hello Elysia")
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
