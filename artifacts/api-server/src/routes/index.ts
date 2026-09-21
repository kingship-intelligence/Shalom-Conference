import { Router, type IRouter } from "express";
import healthRouter from "./health";
import registrationsRouter from "./registrations";
import testimoniesRouter from "./testimonies";
import adminRouter from "./admin";
import merchOrdersRouter from "./merch-orders";
import prayerChainSignupsRouter from "./prayer-chain-signups";

const router: IRouter = Router();

router.use(healthRouter);
router.use(registrationsRouter);
router.use(testimoniesRouter);
router.use(adminRouter);
router.use(merchOrdersRouter);
router.use(prayerChainSignupsRouter);

export default router;
