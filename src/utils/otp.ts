import { error } from "elysia";
import db from "../../prisma/client";
import EkiliRelay from "ekilirelay";

export class OTP {
  constructor() {}

  async create(email: string) {
    const user = await db.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!user) {
      return error(400, "User Not Found");
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await db.otp.deleteMany({ where: { email } });

    const newOtp = await db.otp.create({
      data: {
        email,
        otp,
      },
    });

    return otp;
  }

  async getValidOtp(email: string) {
    const validity = new Date(Date.now() - 10 * 1000);

    const validOtp = await db.otp.findFirst({
      where: {
        email: email,
        createdAt: {
          gte: validity,
        },
      },
    });

    if (!validOtp) {
      return error(400, "OTP Expired or Not Found");
    }

    return validOtp.otp;
  }

  async getValidOtpByOTP(otp: string): Promise<string> {
    const validity = new Date(Date.now() - 10 * 1000);

    const validOtp = await db.otp.findFirst({
      where: {
        otp: otp,
        createdAt: {
          gte: validity,
        },
      },
    });

    if (!validOtp) {
      throw error(400, "OTP Expired or Not Found");
    }

    return validOtp.otp;
  }

  async sendOtp(email: string): Promise<string> {
    const otp = await this.create(email);

    const mailer = new EkiliRelay(process.env.EKILI_API as string);

    mailer.sendEmail(
      email,
      "OTP",
      `Your OTP is ${otp}.`,
      `From: senderName ${process.env.EMAIL}`,
    );

    return "OTP sent Successfully";
  }
}
