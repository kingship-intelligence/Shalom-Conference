import { Router, type IRouter } from "express";
import healthRouter from "./health";
import registrationsRouter from "./registrations";
import checkInRouter from "./check-in";
import testimoniesRouter from "./testimonies";
import adminRouter from "./admin";
import merchOrdersRouter from "./merch-orders";
import prayerChainSignupsRouter from "./prayer-chain-signups";
import prayerChargeSurveyRouter from "./prayer-charge-survey-responses";
import firstTimerResponsesRouter from "./first-timer-responses";

import newConvertsRouter from "./new-converts";

const router: IRouter = Router();

router.use(healthRouter);
router.use(newConvertsRouter);
router.use(registrationsRouter);
router.use(checkInRouter);
router.use(testimoniesRouter);
router.use(adminRouter);
router.use(merchOrdersRouter);
router.use(prayerChainSignupsRouter);
router.use(prayerChargeSurveyRouter);
router.use(firstTimerResponsesRouter);

export default router;
