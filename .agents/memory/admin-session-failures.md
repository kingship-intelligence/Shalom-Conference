---
name: Admin session failures
description: Why protected admin data needs server-session validation and explicit error states.
---

Protected admin query failures must never be converted into empty arrays or empty-list messages. Validate the secure server session before enabling protected queries, return to login on a 401, and show retryable errors for temporary failures.

**Why:** The browser can retain a client-side login hint after the signed server cookie expires or becomes invalid. Treating the resulting 401 as an empty response makes saved registrations appear to vanish even though the database is unchanged.

**How to apply:** Use the server session as the source of truth for admin access. Keep protected queries disabled until validation succeeds, include cookies explicitly, and distinguish loading, error, unauthorized, and genuinely empty states.

Check-in-only accounts must be restricted by server-side role checks; hiding admin UI is not an authorization boundary. They should use a minimal roster endpoint, while every unrelated protected endpoint continues to require the full-admin role. Roleless signed cookies from before role support may be treated as full admin only until their existing eight-hour expiry.

**Why:** Staff need enough attendee data to verify arrivals, but exposing the complete registration records or treating an old admin cookie as a staff cookie would either weaken privacy or unexpectedly lock out existing admins.

**How to apply:** Keep the full-admin and check-in predicates distinct in the shared session helper, test both allowed and denied endpoints, and return only the fields needed for arrival work.