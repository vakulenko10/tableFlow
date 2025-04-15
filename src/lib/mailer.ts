import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export async function sendConfirmationEmail(email: string, token: string) {
  const confirmationUrl = `${process.env.NEXTAUTH_URL}/confirm/${token}`;

  const html = `
    <p>Thanks for booking with us!</p>
    <p>Please confirm your reservation by clicking the link below:</p>
    <a href="${confirmationUrl}">${confirmationUrl}</a>
  `;

  try {
    console.log(`Sending confirmation email to ${email}`);
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Confirm Your Table Reservation",
      html,
    });

    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
    throw new Error("Email send failed");
  }
}