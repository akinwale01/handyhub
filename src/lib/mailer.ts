import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/* =========================
   OTP EMAIL
========================= */
export const sendOtpEmail = async (email: string, otp: string) => {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Verify your email",
    html: `
      <div style="font-family:sans-serif">
        <h2>Your verification code</h2>
        <p style="font-size:28px;font-weight:bold">${otp}</p>
        <p>This expires in 5 minutes.</p>
      </div>
    `,
  });
};

/* =========================
   PASSWORD RESET EMAIL
========================= */
export const sendResetEmail = async (email: string, resetLink: string) => {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Reset your password",
    html: `
      <div style="font-family:sans-serif">
        <h2>Password Reset Request</h2>
        <p>Click the button below to reset your password.</p>
        <a href="${resetLink}"
           style="
             display:inline-block;
             padding:12px 20px;
             background:#2563eb;
             color:white;
             text-decoration:none;
             border-radius:8px;
             margin-top:12px;
           ">
           Reset Password
        </a>
        <p style="margin-top:16px;font-size:13px;color:#666">
          This link expires in 15 minutes.
        </p>
      </div>
    `,
  });
};