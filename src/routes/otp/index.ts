import Elysia, { error } from "elysia";
import { OTP } from "../../utils/otp";
import { otpModel } from "./models";
import { keyGenerator } from "../../utils/generator";
import { rateLimit } from "elysia-rate-limit";

export const Otp = new Elysia()
  .use(
    rateLimit({
      scoping: "scoped",
      duration: 200 * 1000,
      generator: keyGenerator,
    }),
  )
  .post(
    "/otp",
    async ({ body }) => {
      const { email } = body;

      const otpObj = new OTP();

      const otp = await otpObj.sendOtp(email);

      return otp;
    },
    {
      body: otpModel,
      detail: {
        tags: ["Authentication"],
      },
    },
  );
