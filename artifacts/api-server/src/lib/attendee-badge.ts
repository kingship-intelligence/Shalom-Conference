import sharp from "sharp";

const BADGE_SIZE = 1080;

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (character) => {
    const entities: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      "'": "&apos;",
      '"': "&quot;",
    };
    return entities[character];
  });
}

export async function createAttendeeBadge(input: {
  portrait: Buffer;
  firstName: string;
  lastName: string;
  conferenceYear: number;
}): Promise<Buffer> {
  const fullName = escapeXml(`${input.firstName} ${input.lastName}`.trim().toUpperCase());
  const firstName = escapeXml(input.firstName.toUpperCase());

  const portrait = await sharp(input.portrait, { limitInputPixels: 20_000_000 })
    .rotate()
    .resize(620, 620, { fit: "cover", position: "attention" })
    .composite([
      {
        input: Buffer.from(
          '<svg width="620" height="620" xmlns="http://www.w3.org/2000/svg"><circle cx="310" cy="310" r="308" fill="#fff"/></svg>',
        ),
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();

  const artwork = Buffer.from(`
    <svg width="${BADGE_SIZE}" height="${BADGE_SIZE}" viewBox="0 0 ${BADGE_SIZE} ${BADGE_SIZE}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fire" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ff9a24"/>
          <stop offset="44%" stop-color="#f45c1f"/>
          <stop offset="100%" stop-color="#b41220"/>
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="0%" r="78%">
          <stop offset="0%" stop-color="#ffca55" stop-opacity=".5"/>
          <stop offset="100%" stop-color="#ffca55" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1080" height="1080" fill="#0c0b0e"/>
      <rect width="1080" height="1080" fill="url(#glow)"/>
      <path d="M-40 760 C180 620 280 900 505 748 S830 625 1120 770 L1120 1120 L-40 1120 Z" fill="url(#fire)"/>
      <path d="M-80 820 C172 715 315 985 545 830 S835 745 1160 850" fill="none" stroke="#ffc463" stroke-width="7" opacity=".7"/>
      <rect x="44" y="44" width="992" height="992" rx="44" fill="none" stroke="#ffffff" stroke-opacity=".36" stroke-width="3"/>
      <text x="540" y="135" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="78" font-weight="900" letter-spacing="9">SHALOM</text>
      <text x="540" y="188" text-anchor="middle" fill="#ffffff" fill-opacity=".82" font-family="Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="8">YOUTH CONFERENCE</text>
      <circle cx="540" cy="502" r="332" fill="none" stroke="#ff9228" stroke-width="18"/>
      <circle cx="540" cy="502" r="350" fill="none" stroke="#ffffff" stroke-opacity=".35" stroke-width="2"/>
      <rect x="152" y="793" width="776" height="92" rx="46" fill="#0c0b0e" fill-opacity=".86"/>
      <text x="540" y="850" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="35" font-weight="800" letter-spacing="5">I'M ATTENDING</text>
      <text x="540" y="940" text-anchor="middle" fill="#0c0b0e" font-family="Arial, sans-serif" font-size="74" font-weight="900">${fullName}</text>
      <text x="540" y="1000" text-anchor="middle" fill="#0c0b0e" fill-opacity=".8" font-family="Arial, sans-serif" font-size="26" font-weight="800" letter-spacing="7">OCT 9–10 • ${input.conferenceYear}</text>
      <text x="83" y="996" fill="#ffffff" fill-opacity=".4" font-family="Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="3">${firstName}</text>
    </svg>
  `);

  return sharp(artwork)
    .composite([{ input: portrait, top: 192, left: 230 }])
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();
}