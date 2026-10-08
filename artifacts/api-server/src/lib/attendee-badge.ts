import { existsSync, readFileSync } from "node:fs";
import sharp from "sharp";

const templateUrls = [
  new URL("./assets/shalom-2026-attendee-template.png", import.meta.url),
  new URL("../../src/assets/shalom-2026-attendee-template.png", import.meta.url),
];
const templateUrl = templateUrls.find((url) => existsSync(url));

if (!templateUrl) {
  throw new Error("The attendee badge template is missing.");
}

const ATTENDEE_TEMPLATE = readFileSync(templateUrl);

const PHOTO_AREA = {
  left: 367,
  top: 702,
  width: 388,
  height: 485,
  radius: 42,
} as const;

// Modern phones commonly capture 48 MP photos. Keep a finite decompression
// limit for safety while allowing normal high-resolution portraits.
const MAX_PORTRAIT_PIXELS = 100_000_000;

export async function createAttendeeBadge(input: {
  portrait: Buffer;
  firstName: string;
  lastName: string;
  conferenceYear: number;
}): Promise<Buffer> {
  const portrait = await sharp(input.portrait, { limitInputPixels: MAX_PORTRAIT_PIXELS })
    .rotate()
    .resize(PHOTO_AREA.width, PHOTO_AREA.height, { fit: "cover", position: "center" })
    .composite([
      {
        input: Buffer.from(
          `<svg width="${PHOTO_AREA.width}" height="${PHOTO_AREA.height}" xmlns="http://www.w3.org/2000/svg"><rect width="${PHOTO_AREA.width}" height="${PHOTO_AREA.height}" rx="${PHOTO_AREA.radius}" fill="#fff"/></svg>`,
        ),
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();

  return sharp(ATTENDEE_TEMPLATE)
    .composite([{ input: portrait, top: PHOTO_AREA.top, left: PHOTO_AREA.left }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}