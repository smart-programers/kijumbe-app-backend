import Elysia, {error} from "elysia";
import {join} from "path";
import * as nanoid from "nanoid";
import mime from "mime-types";
import db from "../../../prisma/client";
import jwt from "@elysiajs/jwt";
import bearer from "@elysiajs/bearer";
import {upload} from "./models";
import {rateLimit} from "elysia-rate-limit";
import {keyGenerator} from "../../utils/generator";

export const fileUpload = new Elysia()
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
    .post(
        "/upload",
        async ({body, bearer, jwt}) => {
            if (!bearer) {
                return error(401, "Unauthorized: No Bearer token provided");
            }

            let userId;

            try {
                const UserId: any = jwt.verify(bearer);
                userId = UserId.id;
            } catch (err) {
                return error(400, "Unauthorized");
            }
            const user = await db.user.findFirst({
                where: {
                    id: userId,
                },
                select: {
                    id: true,
                    role: true,
                },
            });

            if (!user) {
                return error(400, "Unauthorized");
            }

            const file = body.file;

            const mimeType = file.type;

            const extension = mime.extension(mimeType);

            if (!extension) {
                console.error("Unsupported file type");
                return error(400, "Unsupported file type");
            }
            const buffer: any = Buffer.from(await file.arrayBuffer());

            const filename = `${nanoid.nanoid()}.${extension}`;

            const filePath: any = join(process.cwd(), "public", filename);

            try {
                const fileStore: any = Bun.file(filePath);
                await Bun.write(fileStore, buffer);
                console.log("File saved successfully", filePath);
                return filename;
            } catch (err) {
                console.error("Error saving the file", err);
                return error(500, "Internal server error");
            }
        },
        {
            body: upload,
            tags: ["Upload"],
        },
    )
    .get(
        "/:filename",
        async (req: any, res: any) => Bun.file(`public/${req.params.filename}`),
        {
            tags: ["Upload"],
        },
    );