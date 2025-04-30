import { error } from "elysia";
import db from "../../prisma/client";
import { OTP } from "./otp";

export class Auth {
  private otp: OTP;
  constructor() {
    this.otp = new OTP();
  }

  async Login(email: string, otp: string): Promise<{ result: any, status: number, message: string }> {
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
      return { result: {}, status: 400, message: "Incorrect Credentials" };
    }

    return { result: user.id, status: 200, message: "Valid Otp" };
  }

  async LoginWithPassword(email: string, password: string):Promise<{ result: any, status: number, message: string }>{
    const user = await db.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!user) {
      return { result: {}, status: 400, message: "User Not Found" };
    }

    const isMatch = await Bun.password.verify(
      password,
      user?.password as string,
    );

    if (!isMatch) {
      return { result: {}, status: 400, message:"Incorrect Credentials"};
    }

    return { result: user.id, status: 200, message: "Password Match" };
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
