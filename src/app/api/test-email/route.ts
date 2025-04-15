import { sendEmail } from "@/lib/mailer";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  const body = await req.json();
  const { email } = body;

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const token = randomUUID(); // You could also return this to client or store it

  const confirmationUrl = `${process.env.NEXTAUTH_URL}/confirm/${token}`;

  const html = `
    <p>Thanks for booking with us!</p>
    <p>Please confirm your reservation by clicking the link below:</p>
    <a href="${confirmationUrl}">${confirmationUrl}</a>
  `;

  try {
    await sendEmail({
      to: email,
      subject: "Confirm Your Table Reservation",
      html,
    });

    return NextResponse.json({ success: true, token }); // Optional: return token if needed
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json({ error: "Email send failed" }, { status: 500 });
  }
}
