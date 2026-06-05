import { Router, type IRouter } from "express";
import healthRouter from "./health";
import registrationsRouter from "./registrations";
import testimoniesRouter from "./testimonies";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(registrationsRouter);
router.use(testimoniesRouter);
router.use(adminRouter);

export default router;
