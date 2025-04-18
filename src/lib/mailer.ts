import nodemailer from "nodemailer";
import { prisma } from "@/lib/db"; // use Prisma to fetch reservation details

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export async function sendConfirmationEmail(email: string, token: string) {
  const confirmationUrl = `${process.env.NEXTAUTH_URL}/confirm/${token}`;

  // fetch reservation record and related tables from the database
  const reservation = await prisma.reservation.findUnique({
    where: { token },
    include: {
      tables: {
        include: { table: true }, // include table metadata
      },
    },
  });
  if (!reservation) {
    throw new Error("Reservation not found for email");
  }

  // extract table labels
  const tableLabels = reservation.tables.map((rt) => rt.table.label).join(", ");

  // format date and times for display
  const date = reservation.date.toISOString().split("T")[0];
  const start = new Date(reservation.startTime).toLocaleTimeString();
  const end = new Date(reservation.endTime).toLocaleTimeString();
  
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #f6f9fc; padding: 40px;">
      <table width="100%" style="max-width:600px; margin:auto; background:#fff; border-radius:8px; padding:30px; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
        <tr><td style="text-align:center;">
          <h2 style="color:#333;">Hello, ${reservation.name}!</h2>
          <p style="font-size:16px; color:#555;">
            Here are your reservation details:
          </p>
          <ul style="text-align:left; color:#555; font-size:14px; line-height:1.4;">
            <li><strong>Date:</strong> ${date}</li>
            <li><strong>Time:</strong> ${start} – ${end}</li>
            <li><strong>Table(s):</strong> ${tableLabels}</li>
            <li><strong>Status:</strong> ${reservation.status}</li>
          </ul>
          <p style="font-size:16px; color:#555; margin-top:20px;">
            Please confirm your reservation by clicking the button below:
          </p>
          <a href="${confirmationUrl}"
             style="display:inline-block; margin-top:10px; padding:14px 28px; background-color:#007BFF;
                    color:white; text-decoration:none; border-radius:6px; font-weight:bold;">
            Confirm Reservation
          </a>
          <p style="font-size:14px; color:#888; margin-top:30px;">
            If the button doesn’t work, copy and paste this link into your browser:
          </p>
          <p style="word-break:break-all; font-size:14px; color:#555;">${confirmationUrl}</p>
          <p style="font-size:14px; color:#d9534f; margin-top:20px;">
            <b>Important:</b> This link is valid for 15 minutes only.
          </p>
          <hr style="margin-top:40px; border:none; border-top:1px solid #eee;">
          <p style="font-size:12px; color:#aaa;">
            This email was sent to ${email}. If you didn't request this, you can ignore it.
          </p>
        </td></tr>
      </table>
    </div>
  `;

  // send the email
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
