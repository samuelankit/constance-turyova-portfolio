import { Router, type IRouter } from "express";
import healthRouter from "./health";
import slidesRouter from "./slides";
import blogRouter from "./blog";
import settingsRouter from "./settings";
import uploadRouter from "./upload";
import portfolioPhotosRouter from "./portfolioPhotos";
import portfolioVideosRouter from "./portfolioVideos";
import portfolioVoiceRecordsRouter from "./portfolioVoiceRecords";

const router: IRouter = Router();

router.use(healthRouter);
router.use(slidesRouter);
router.use(blogRouter);
router.use(settingsRouter);
router.use(uploadRouter);
router.use(portfolioPhotosRouter);
router.use(portfolioVideosRouter);
router.use(portfolioVoiceRecordsRouter);

export default router;
