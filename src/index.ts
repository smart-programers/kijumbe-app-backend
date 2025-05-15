import {Elysia} from "elysia";
import {authentication} from "./routes/auth";
import swagger from "@elysiajs/swagger";
import cors from "@elysiajs/cors";
import {Otp} from "./routes/otp";
import {group} from "./routes/group";
import {rule} from "./routes/rules";
import {member} from "./routes/member";
import {ip} from "elysia-ip";
import {user} from "./routes/user";
import {fileUpload} from "./routes/upload";
import {payment} from "./routes/payment";


const app = new Elysia()
    .use(ip())
    .use(authentication)
    .use(Otp)
    .use(group)
    .use(rule)
    .use(member)
    .use(user)
    .use(fileUpload)
    .use(swagger())
    .use(cors())
    .use(payment)
    .get("/", () => "Hello Elysia")
    .get("/health", () => ({
        status: "ok",
        instance: process.env.INSTANCE_ID || "unknown"
    }))
    .get("/ip", ({ip}) => ip)
    .listen(3000);

console.log(
    `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
);
