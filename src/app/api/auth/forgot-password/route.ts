import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

// NOTE: For production, use a real email service like SendGrid, Resend, etc.
// For development, we'll use a test account from ethereal.email
// You can create one for free to see the email output.
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal that the user doesn't exist for security reasons
      return NextResponse.json({ message: "If an account with that email exists, a password reset link has been sent." });
    }

    // Generate a secure token
    const token = randomBytes(32).toString("hex");
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1); // Token is valid for 1 hour

    // Store the hashed token and expiry in the database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token, // Note: In a real-world scenario, you'd hash this token too
        passwordResetTokenExpiry: expiry,
      },
    });

    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    // Send the email
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Your App" <noreply@yourapp.com>',
      to: user.email,
      subject: "Password Reset Request",
      html: `<p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
             <p>Please click on the following link, or paste this into your browser to complete the process:</p>
             <p><a href="${resetLink}">${resetLink}</a></p>
             <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Password reset email sent. Preview URL: %s", nodemailer.getTestMessageUrl(info));

    return NextResponse.json({ message: "If an account with that email exists, a password reset link has been sent." });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to process password reset request." }, { status: 500 });
  }
} 