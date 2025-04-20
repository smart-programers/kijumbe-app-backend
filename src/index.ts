import { Elysia } from "elysia";
import { authentication } from "./routes/auth";
import swagger from "@elysiajs/swagger";
import cors from "@elysiajs/cors";
import { Otp } from "./routes/otp";
import { group } from "./routes/group";
import { rule } from "./routes/rules";
import { member } from "./routes/member";
import { ip } from "elysia-ip";
import { user } from "./routes/user";

const app = new Elysia()
  .use(ip())
  .use(authentication)
  .use(Otp)
  .use(group)
  .use(rule)
  .use(member)
  .use(user)
  .use(swagger({
    documentation:{
      components: {
             securitySchemes: {
               BearerAuth: {
                 type: 'http',
                 scheme: 'bearer',
                 bearerFormat: 'JWT',
               },
             },
           },
      info: {
        title: "Fundi App Backend",
        version: "1.0",
      },
      
      tags:[
        {name:"Authentication", description:"Authentication Endpoints"},
        {name:"User",description:"User Endpoints"}
      ]
    },scalarConfig: {
          authentication: {
            preferredSecurityScheme: 'BearerAuth',
          },
        },
  }))
  .use(cors())
  .get("/", () => "Hello Elysia")
  .get("/ip", ({ ip }) => ip)
  .listen(3005);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
);
