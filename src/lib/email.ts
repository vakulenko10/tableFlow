import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendConfirmationEmail(email: string, token: string) {
  const confirmationUrl = `${process.env.NEXTAUTH_URL}/confirm/${token}`;

  try {
    console.log(`we are sending an email to ${email}`)
    const response = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Confirm Your Table Reservation',
      html: `<p>Thanks for booking with us!</p>
             <p>Please confirm your reservation by clicking the link below:</p>
             <a href="${confirmationUrl}">${confirmationUrl}</a>`
    });
    console.log("Resend response:", response);
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    throw new Error('Email send failed');
  }
}