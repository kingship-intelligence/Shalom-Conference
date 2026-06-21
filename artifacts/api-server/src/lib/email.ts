import nodemailer from "nodemailer";

const FROM = '"Shalom Conference" <media@shalomconference.com>';

function createTransport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "media@shalomconference.com",
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

export async function sendRegistrationConfirmation(opts: {
  firstName: string;
  lastName: string;
  email: string;
  conferenceYear: string;
  isVolunteer: boolean;
  volunteerRole?: string | null;
}): Promise<void> {
  const volunteerLine = opts.isVolunteer && opts.volunteerRole
    ? `<p>You signed up to volunteer as part of the <strong>${opts.volunteerRole}</strong> team — we'll be in touch with more details.</p>`
    : opts.isVolunteer
    ? `<p>You signed up as a volunteer — we'll be in touch with more details.</p>`
    : "";

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="margin:0;padding:0;background:#0a0a0a;font-family:sans-serif;color:#ffffff;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
      <tr>
        <td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background:#111111;border-radius:12px;overflow:hidden;max-width:560px;width:100%;">
            <tr>
              <td style="background:#000000;padding:28px 32px;text-align:center;">
                <span style="font-size:28px;font-weight:900;letter-spacing:4px;color:#ffffff;text-transform:uppercase;">SHALOM</span>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px;">
                <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#ffffff;">
                  You're registered! 🙌
                </h1>
                <p style="margin:0 0 24px;color:#a0a0a0;font-size:15px;">
                  Hi ${opts.firstName}, thanks for signing up for Shalom ${opts.conferenceYear}.
                </p>
                <p style="margin:0 0 16px;color:#d0d0d0;font-size:15px;line-height:1.6;">
                  We're so excited to have you join us. Get ready for a powerful time of worship,
                  the Word, and genuine community.
                </p>
                ${volunteerLine}
                <p style="margin:24px 0 0;color:#a0a0a0;font-size:13px;">
                  Stay connected — follow us on Instagram for updates closer to the conference.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background:#000000;padding:20px 32px;text-align:center;">
                <p style="margin:0;color:#555555;font-size:12px;">
                  © ${opts.conferenceYear} Shalom Youth Conference · admin@shalomconference.com
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

  const transporter = createTransport();
  await transporter.sendMail({
    from: FROM,
    to: opts.email,
    subject: `You're registered for Shalom ${opts.conferenceYear}! 🙌`,
    html,
  });
}
