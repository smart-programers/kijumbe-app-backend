import Elysia, { error } from "elysia";
import { OTP } from "../../utils/otp";
import { otpModel } from "./models";

export const Otp = new Elysia().post(
  "/otp",
  async ({ body }) => {
    const { email } = body;

    const otpObj = new OTP();

    const otp = await otpObj.sendOtp(email);

    return otp;
  },
  {
    body: otpModel,
  },
);
