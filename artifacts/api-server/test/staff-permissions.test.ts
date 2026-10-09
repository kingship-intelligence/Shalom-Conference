import { it } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import {
  establishAdminSession,
  hasAdminSession,
  hasRegistrationAccess,
  hasRegistrationCountAccess,
  hasNewConvertsAccess,
  hasCheckInAccess,
  hasFirstTimersAccess,
  hasMerchAccess,
  type AdminRole,
} from "../src/lib/admin-session";

it("enforces the signed-session access matrix for every staff role", async () => {
  process.env.SESSION_SECRET = "test-staff-role-secret";
  const matrix: [AdminRole, boolean[]][] = [
    ["admin", [true, true, true, true, true, true, true]],
    ["checkin", [false, false, false, false, true, false, false]],
    ["registration_viewer", [false, false, true, false, false, false, false]],
    ["new_converts", [false, false, false, true, false, false, false]],
    ["registration_checkin", [false, true, true, false, true, false, false]],
    ["first_timers", [false, false, false, false, false, true, false]],
    ["merch", [false, false, false, false, false, false, true]],
  ];
  for (const [role, expected] of matrix) {
    let cookie = "";
    const response = {
      cookie: (_name: string, value: string) => {
        cookie = `shalom_admin_session=${value}`;
      },
    };
    assert.equal(establishAdminSession(response as never, "staff", role), true);
    const request = { headers: { cookie } } as express.Request;
    const checks = [
      hasAdminSession,
      hasRegistrationAccess,
      hasRegistrationCountAccess,
      hasNewConvertsAccess,
      hasCheckInAccess,
      hasFirstTimersAccess,
      hasMerchAccess,
    ];
    assert.deepEqual(
      checks.map((check) => check(request)),
      expected,
      role,
    );
    request.headers.cookie = cookie.replace(`.${role}.`, ".owner.");
    assert.deepEqual(
      checks.map((check) => check(request)),
      [false, false, false, false, false, false, false],
    );
  }
});
