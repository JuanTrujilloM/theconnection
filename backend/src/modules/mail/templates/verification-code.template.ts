// Subject + HTML for the verification-code email. Kept out of MailService so the
// service only sends; copy and markup are authored here.
export function verificationCodeEmail(code: string): {
  subject: string;
  html: string;
} {
  return {
    subject: 'Your TheConnection verification code',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Verify your university email</h2>
        <p>Use the code below to finish creating your TheConnection account:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px;">${code}</p>
        <p style="color: #666;">This code expires in a few minutes. If you didn't request it, you can ignore this email.</p>
      </div>
    `,
  };
}
