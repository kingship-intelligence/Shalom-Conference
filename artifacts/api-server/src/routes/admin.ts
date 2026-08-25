import { Router, type IRouter } from "express";
import { establishAdminSession } from "../lib/admin-session";

const router: IRouter = Router();

router.post("/admin/login", (req, res): void => {
  const { username, password } = req.body as { username?: string; password?: string };

  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedUsername || !expectedPassword) {
    req.log.error("Admin credentials not configured");
    res.status(500).json({ error: "Server misconfiguration" });
    return;
  }

  if (username === expectedUsername && password === expectedPassword) {
    if (!establishAdminSession(res, username)) {
      req.log.error("Session secret not configured");
      res.status(500).json({ error: "Server misconfiguration" });
      return;
    }
    res.json({ ok: true });
    return;
  }

  res.status(401).json({ error: "Invalid credentials" });
});

export default router;
