// @ts-nocheck
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mock } from "node:test";

const calls = [];
mock.module("@replit/connectors-sdk", {
  namedExports: {
    ReplitConnectors: class {
      async proxy(_provider, _path, options) {
        calls.push(JSON.parse(options.body));
        return { ok: true, status: 200, text: async () => "" };
      }
    },
  },
});

const { sendPrayerChainConfirmation, sendRegistrationConfirmation } = await import("../src/lib/email.ts");

describe("badge confirmation email", () => {
  it("sends a PNG attachment with a plain subject", async () => {
    await sendRegistrationConfirmation({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      conferenceYear: "2026",
      isVolunteer: false,
      attendeeBadge: Buffer.from("badge-png"),
    });

    const raw = Buffer.from(calls.at(-1).raw.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString();
    assert.match(raw, /Subject: Your Shalom 2026 attendee badge\r\n/);
    assert.doesNotMatch(raw.match(/Subject: ([^\r\n]+)/)[1], /[^\x00-\x7F]/);
    assert.match(raw, /Content-Type: image\/png; name="shalom-2026-attendee-badge\.png"/);
    assert.match(raw, /Content-Disposition: attachment; filename="shalom-2026-attendee-badge\.png"/);
    assert.ok(raw.includes(Buffer.from("badge-png").toString("base64")));
  });
});

describe("prayer-chain confirmation email", () => {
  it("includes every selected prayer time", async () => {
    await sendPrayerChainConfirmation({
      name: "Ada Lovelace",
      email: "ada@example.com",
      timeSlots: ["00:00", "05:00", "11:00"],
    });

    const raw = Buffer.from(calls.at(-1).raw.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString();
    const encodedHtml = raw.split("Content-Transfer-Encoding: base64\r\n\r\n")[1].split("\r\n\r\n--inner_")[0];
    const html = Buffer.from(encodedHtml.replace(/\r\n/g, ""), "base64").toString();

    assert.match(raw, /Subject: Your Shalom Prayer Chain registration is confirmed\r\n/);
    assert.match(html, /Hello Ada Lovelace/);
    assert.match(html, /12 AM – 1 AM/);
    assert.match(html, /5 AM – 6 AM/);
    assert.match(html, /11 AM – 12 PM/);
  });
});