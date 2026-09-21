import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db, merchOrdersTable } from "@workspace/db";
import {
  ConfirmMerchOrderPaymentParams,
  CreateMerchOrderBody,
  ListMerchOrdersResponse,
} from "@workspace/api-zod";
import {
  sendMerchOrderNotification,
  sendMerchOrderPaymentConfirmed,
  sendMerchOrderReceived,
} from "../lib/email";
import { getAdminIdentity, hasAdminSession } from "../lib/admin-session";

const router: IRouter = Router();

const MERCH_PRICES: Record<string, number> = {
  "The Comforter Tee": 30,
  "The Comforter Tee — Shalom Edition": 30,
  "The Comforter Crewneck": 40,
  "The Comforter Crewneck — Shalom Edition": 40,
};

const MerchOrderSubmission = CreateMerchOrderBody.superRefine((order, ctx) => {
  if (!order.name.trim()) {
    ctx.addIssue({ code: "custom", path: ["name"], message: "Name is required." });
  }
  if (!order.paymentReference.trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["paymentReference"],
      message: "Cash App reference is required.",
    });
  }

  let expectedTotal = 0;
  order.items.forEach((item, index) => {
    if (!item.productName.trim() || !(item.productName in MERCH_PRICES)) {
      ctx.addIssue({
        code: "custom",
        path: ["items", index, "productName"],
        message: "Unknown merch product.",
      });
    } else {
      expectedTotal += MERCH_PRICES[item.productName] * item.quantity;
    }
    if (!Number.isInteger(item.quantity)) {
      ctx.addIssue({
        code: "custom",
        path: ["items", index, "quantity"],
        message: "Quantity must be a whole number.",
      });
    }
  });

  if (!Number.isInteger(order.total) || order.total !== expectedTotal) {
    ctx.addIssue({
      code: "custom",
      path: ["total"],
      message: "Total does not match the selected merch.",
    });
  }
});

router.post("/merch-orders", async (req, res): Promise<void> => {
  const parsed = MerchOrderSubmission.safeParse(req.body);
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

router.patch("/merch-orders/:id/verify", async (req, res): Promise<void> => {
  if (!hasAdminSession(req)) {
    res.status(401).json({ error: "Admin sign-in is required." });
    return;
  }
  const adminIdentity = getAdminIdentity(req);
  if (!adminIdentity) {
    res.status(401).json({ error: "Admin sign-in is required." });
    return;
  }

  const parsed = ConfirmMerchOrderPaymentParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [order] = await db
    .update(merchOrdersTable)
    .set({
      status: "verified",
      paymentConfirmedAt: new Date(),
      paymentConfirmedBy: adminIdentity,
    })
    .where(
      and(
        eq(merchOrdersTable.id, parsed.data.id),
        eq(merchOrdersTable.status, "awaiting_verification"),
      ),
    )
    .returning();

  if (!order) {
    const [existingOrder] = await db
      .select()
      .from(merchOrdersTable)
      .where(eq(merchOrdersTable.id, parsed.data.id));

    if (!existingOrder) {
      res.status(404).json({ error: "Merch preorder not found." });
      return;
    }
    if (existingOrder.status === "verified") {
      res.status(409).json({ error: "This preorder has already been verified." });
      return;
    }
    res.status(409).json({ error: "This preorder is not awaiting verification." });
    return;
  }

  const verifiedOrder = ListMerchOrdersResponse.element.parse(order);
  try {
    await sendMerchOrderPaymentConfirmed(verifiedOrder);
  } catch (err: unknown) {
    req.log.error({ err, orderId: order.id }, "Payment verified but confirmation email failed");
    res.status(502).json({
      error: "Payment was verified, but the buyer confirmation email could not be sent.",
      order: verifiedOrder,
    });
    return;
  }

  res.json(verifiedOrder);
});

export default router;