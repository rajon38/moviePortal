import { Router } from "express";
import { AuthRoutes } from "../module/auth/auth.route";
import { MediaRoutes } from "../module/media/media.route";

const router = Router()

router.use("/users", AuthRoutes)
router.use("/media", MediaRoutes)
export const IndexRoute = router;