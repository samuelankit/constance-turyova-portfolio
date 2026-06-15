import { Router, type IRouter } from "express";
import healthRouter from "./health";
import slidesRouter from "./slides";
import blogRouter from "./blog";
import settingsRouter from "./settings";
import uploadRouter from "./upload";

const router: IRouter = Router();

router.use(healthRouter);
router.use(slidesRouter);
router.use(blogRouter);
router.use(settingsRouter);
router.use(uploadRouter);

export default router;
