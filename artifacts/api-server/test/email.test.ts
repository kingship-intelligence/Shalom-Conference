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

const { sendRegistrationConfirmation } = await import("../src/lib/email.ts");

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