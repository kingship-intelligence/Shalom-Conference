---
name: Check-in QR credentials
description: Security and replacement-email rules for registration QR codes used at conference check-in.
---

QR payloads must contain only a versioned, high-entropy random bearer token. Never encode names, emails, registration IDs, or other personal data, and persist only a one-way hash. Scan endpoints remain admin-only and must enforce the selected session's conference year.

**Why:** QR codes can be shared or photographed, and a database leak should not expose usable attendee credentials. Hash-only storage means a raw QR cannot be recovered; issuing a replacement therefore requires a new token and invalidates older copies.

**How to apply:** Preserve the admin and year checks when changing QR flows. Make token replacement visible to staff. Existing registrants should receive replacement QR emails only through an explicit admin action, not a silent bulk send.