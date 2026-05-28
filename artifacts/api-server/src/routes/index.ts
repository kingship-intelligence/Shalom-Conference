import { Router, type IRouter } from "express";
import healthRouter from "./health";
import registrationsRouter from "./registrations";
import testimoniesRouter from "./testimonies";

const router: IRouter = Router();

router.use(healthRouter);
router.use(registrationsRouter);
router.use(testimoniesRouter);

export default router;
