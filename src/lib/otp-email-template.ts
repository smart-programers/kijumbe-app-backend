export default function OtpEmailTemplate(otp: string, name: string) {
  return `
      <div style="
        font-family: Arial, sans-serif; 
        text-align: center; 
        padding: 20px; 
        background-color: #f4f4f4;
      ">
        <div style="
          max-width: 400px; 
          margin: 0 auto; 
          background: #ffffff; 
          padding: 20px; 
          border-radius: 8px; 
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        ">
          <h1 style="color: #333;">Hello, ${name}</h1>
          <p style="font-size: 20px; font-weight: bold; color: #007BFF;">${otp}</p>
          <p style="color: #555;">
            Use this One-Time Password (OTP) to complete your verification. 
            This code is valid for a limited time, so please enter it promptly.
          </p>
          <p style="color: #999; font-size: 12px;">
            If you didn't request this, please ignore this email or contact support.
          </p>
        </div>
      </div>
    `;
}
