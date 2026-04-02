import { Router } from "express";
import { AuthRoutes } from "../module/auth/auth.route";
import { MediaRoutes } from "../module/media/media.route";
import { ReviewRoutes } from "../module/review/review.route";
import { WatchListRoutes } from "../module/watchList/watchList.route";
import { PaymentRoutes } from "../module/payment/payment.route";
import { PurchaseRoutes } from "../module/purchase/purchase.route";

const router = Router()

router.use("/auth", AuthRoutes)
router.use("/media", MediaRoutes)
router.use("/reviews", ReviewRoutes)
router.use("/watch-lists", WatchListRoutes)
router.use("/payments", PaymentRoutes)
router.use("/purchases", PurchaseRoutes)
export const IndexRoute = router;