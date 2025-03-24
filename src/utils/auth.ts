import { error } from "elysia";
import db from "../../prisma/client";
import { OTP } from "./otp";

export class Auth {
  private otp: OTP;
  constructor() {
    this.otp = new OTP();
  }

  async Login(email: string, otp: string): Promise<string> {
    const user = await db.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!user) {
      throw error(400, "User Not Found");
    }

    const validOtp = await this.otp.getValidOtpByOTP(otp);

    if (!validOtp) {
      throw error(400, "Incorrect Credentials");
    }

    return user.id;
  }

  async LoginWithPassword(email: string, password: string): Promise<string> {
    const user = await db.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!user) {
      throw error(400, "User Not Found");
    }

    const isMatch = await Bun.password.verify(
      password,
      user?.password as string,
    );

    if (!isMatch) {
      throw error(400, "Incorrect Credentials");
    }

    return user.id;
  }

  static async getUser(email: string) {
    const user = await db.user.findFirst({
      where: {
        email: email,
      },
    });
    return user;
  }
}
