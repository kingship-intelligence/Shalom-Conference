import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, merchOrdersTable } from "@workspace/db";
import { CreateMerchOrderBody, ListMerchOrdersResponse } from "@workspace/api-zod";
import { sendMerchOrderNotification, sendMerchOrderReceived } from "../lib/email";
import { hasAdminSession } from "../lib/admin-session";

const router: IRouter = Router();

router.post("/merch-orders", async (req, res): Promise<void> => {
  const parsed = CreateMerchOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [order] = await db
    .insert(merchOrdersTable)
    .values({
      ...parsed.data,
      items: parsed.data.items,
      status: "awaiting_verification",
    })
    .returning();

  const emailOrder = {
    ...order,
    items: parsed.data.items,
  };
  Promise.all([
    sendMerchOrderReceived(emailOrder),
    sendMerchOrderNotification(emailOrder),
  ]).catch((err: unknown) => {
    req.log.error({ err, orderId: order.id }, "Failed to send merch order confirmation");
  });

  res.status(201).json({
    id: order.id,
    name: order.name,
    email: order.email,
    phone: order.phone,
    paymentReference: order.paymentReference,
    items: order.items,
    total: order.total,
    status: order.status,
    createdAt: order.createdAt,
  });
});

router.get("/merch-orders", async (req, res): Promise<void> => {
  if (!hasAdminSession(req)) {
    res.status(401).json({ error: "Admin sign-in is required." });
    return;
  }
  const orders = await db
    .select()
    .from(merchOrdersTable)
    .orderBy(desc(merchOrdersTable.createdAt));
  res.json(ListMerchOrdersResponse.parse(orders));
});

export default router;