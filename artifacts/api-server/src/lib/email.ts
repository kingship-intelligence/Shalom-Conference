// Uses Replit Gmail connector (google-mail) — handles OAuth2 automatically.
// Sends via Gmail API: POST /gmail/v1/users/me/messages/send
import { ReplitConnectors } from "@replit/connectors-sdk";

const FROM = "Shalom Conference <media@shalomconference.com>";

function getSiteUrl(): string {
  const domains = process.env.REPLIT_DOMAINS;
  if (domains) return `https://${domains.split(",")[0]}`;
  return "https://shalomconference.com";
}

function buildRawMessage(opts: {
  to: string;
  subject: string;
  html: string;
}): string {
  const boundary = "boundary_shalom_" + Date.now();
  const message = [
    `From: ${FROM}`,
    `To: ${opts.to}`,
    `Subject: ${opts.subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    Buffer.from(opts.html).toString("base64"),
    ``,
    `--${boundary}--`,
  ].join("\r\n");

  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function sendRegistrationConfirmation(opts: {
  firstName: string;
  lastName: string;
  email: string;
  conferenceYear: string;
  isVolunteer: boolean;
  volunteerRole?: string | null;
}): Promise<void> {
  const siteUrl = getSiteUrl();
  const logoUrl = `${siteUrl}/logo.png`;

  const volunteerLine =
    opts.isVolunteer && opts.volunteerRole
      ? `
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;">
          <tr>
            <td style="background:linear-gradient(135deg,#f97316,#ea580c);border-radius:10px;padding:16px 20px;">
              <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#fff5eb;">Volunteer Role</p>
              <p style="margin:4px 0 0;font-size:18px;font-weight:800;color:#ffffff;">${opts.volunteerRole}</p>
              <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">We'll reach out with more details before the conference.</p>
            </td>
          </tr>
        </table>`
      : opts.isVolunteer
        ? `
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;">
          <tr>
            <td style="background:linear-gradient(135deg,#f97316,#ea580c);border-radius:10px;padding:16px 20px;">
              <p style="margin:0;font-size:15px;font-weight:700;color:#ffffff;">You're a volunteer! 🙌</p>
              <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">We'll reach out with more details before the conference.</p>
            </td>
          </tr>
        </table>`
        : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>You're registered for Shalom ${opts.conferenceYear}!</title>
</head>
<body style="margin:0;padding:0;background-color:#0d0d0d;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d0d0d;padding:32px 16px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 0 60px rgba(249,115,22,0.15);">

        <!-- HEADER: logo + orange glow -->
        <tr>
          <td style="background:linear-gradient(160deg,#1a0a00 0%,#0d0d0d 60%);padding:36px 32px 28px;text-align:center;border-bottom:2px solid #f97316;">
            <img src="${logoUrl}" alt="SHALOM" width="160" style="display:block;margin:0 auto 0;max-width:160px;height:auto;" />
          </td>
        </tr>

        <!-- HERO BAND -->
        <tr>
          <td style="background:linear-gradient(135deg,#f97316 0%,#dc2626 100%);padding:28px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:rgba(255,255,255,0.75);">Shalom ${opts.conferenceYear}</p>
            <h1 style="margin:8px 0 0;font-size:32px;font-weight:900;letter-spacing:1px;color:#ffffff;line-height:1.1;">You're In! 🔥</h1>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="background:#141414;padding:36px 32px;">

            <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#ffffff;">
              Hey ${opts.firstName} 👋
            </p>
            <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#c0c0c0;">
              Your registration for <strong style="color:#f97316;">Shalom ${opts.conferenceYear}</strong> is confirmed.
              We are so excited to have you with us — get ready for a powerful time of worship,
              the Word, and genuine community.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#1f1f1f;border-left:4px solid #f97316;border-radius:0 8px 8px 0;padding:16px 20px;">
                  <p style="margin:0;font-size:13px;font-weight:600;color:#f97316;letter-spacing:1px;text-transform:uppercase;">What to expect</p>
                  <p style="margin:8px 0 0;font-size:14px;line-height:1.6;color:#a0a0a0;">
                    Powerful worship &nbsp;·&nbsp; Anointed preaching &nbsp;·&nbsp; Real community &nbsp;·&nbsp; Life-changing encounters
                  </p>
                </td>
              </tr>
            </table>

            ${volunteerLine}

            <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0 0;">
              <tr>
                <td align="center">
                  <a href="${siteUrl}/2026"
                     style="display:inline-block;background:linear-gradient(135deg,#f97316,#dc2626);color:#ffffff;font-size:15px;font-weight:800;letter-spacing:1px;text-transform:uppercase;text-decoration:none;padding:14px 36px;border-radius:100px;">
                    View Conference Details
                  </a>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#0d0d0d;border-top:1px solid #222222;padding:24px 32px;text-align:center;">
            <p style="margin:0 0 6px;font-size:13px;font-weight:700;letter-spacing:3px;color:#f97316;text-transform:uppercase;">SHALOM YOUTH CONFERENCE</p>
            <p style="margin:0;font-size:12px;color:#555555;">
              Questions? Email us at
              <a href="mailto:media@shalomconference.com" style="color:#f97316;text-decoration:none;">media@shalomconference.com</a>
            </p>
            <p style="margin:12px 0 0;font-size:11px;color:#3a3a3a;">© ${opts.conferenceYear} Shalom Youth Conference. All rights reserved.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const connectors = new ReplitConnectors();
  const raw = buildRawMessage({
    to: opts.email,
    subject: `You're registered for Shalom ${opts.conferenceYear}! 🔥`,
    html,
  });

  const response = await connectors.proxy(
    "google-mail",
    "/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      body: JSON.stringify({ raw }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gmail API error ${response.status}: ${text}`);
  }
}
