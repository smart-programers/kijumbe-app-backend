import { error } from "elysia";
import db from "../../../prisma/client";

export class Auth {
  constructor() {}

  async Login(email: string, password: string) {
    const user = await db.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!user) {
      return error(400, "User Not Found");
    }

    const isMatch = await Bun.password.verify(password, user.password);

    if (!isMatch) {
      return error(400, "Incorrect Credentials");
    }

    return user.id;
  }
}
