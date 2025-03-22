import { error } from "elysia";
import db from "../../prisma/client";

const VALIDITY_OTP = Number(process.env.VALIDITY_OTP) || 60;

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
    const validity = new Date(Date.now() - VALIDITY_OTP * 1000);

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
    const validity = new Date(Date.now() - VALIDITY_OTP * 1000);

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

    const payload = {
      to: email,
      subject: "Your kijumbe OTP",
      message: `Your OTP is ${otp}.`,
      from: `From: KIJUMBE OTP <${process.env.EMAIL}>`,
      apikey: process.env.EKILI_API,
    };

    try {
      const response = await fetch("https://relay.ekilie.com/api/index.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          `Failed to send OTP: ${data.message || response.statusText}`,
        );
      }

      return data;
    } catch (error: any) {
      console.error("Error sending OTP:", error.message);
      throw error;
    }
  }
}
