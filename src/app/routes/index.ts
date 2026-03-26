import { Router } from "express";
import { AuthRoutes } from "../module/auth/auth.route";
import { MediaRoutes } from "../module/media/media.route";
import { ReviewRoutes } from "../module/review/review.route";

const router = Router()

router.use("/users", AuthRoutes)
router.use("/media", MediaRoutes)
router.use("/reviews", ReviewRoutes)
export const IndexRoute = router;