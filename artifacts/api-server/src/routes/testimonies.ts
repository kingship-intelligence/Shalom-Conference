import { Router, type IRouter } from "express";
import { db, testimoniesTable } from "@workspace/db";
import {
  CreateTestimonyBody,
  ListTestimoniesResponse,
  ListTestimoniesResponseItem,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/testimonies", async (req, res): Promise<void> => {
  const parsed = CreateTestimonyBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid testimony body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [testimony] = await db
    .insert(testimoniesTable)
    .values(parsed.data)
    .returning();

  res.status(201).json(ListTestimoniesResponseItem.parse(testimony));
});

router.get("/testimonies", async (_req, res): Promise<void> => {
  const testimonies = await db
    .select()
    .from(testimoniesTable)
    .orderBy(testimoniesTable.createdAt);
  res.json(ListTestimoniesResponse.parse(testimonies));
});

export default router;
