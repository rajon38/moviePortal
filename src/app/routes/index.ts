import { Router } from "express";
import { AuthRoutes } from "../module/auth/auth.route";

const router = Router()

router.use("/auths", AuthRoutes)
export const IndexRoute = router;