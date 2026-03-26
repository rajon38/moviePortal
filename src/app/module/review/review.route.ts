import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { checkAuth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { ReviewController } from "./review.controller.js";
import { ReviewValidation } from "./review.validation.js";

const router = Router();

router.get("/", checkAuth(Role.ADMIN), ReviewController.getAll);

router.get("/:id", checkAuth(Role.ADMIN), ReviewController.getById);

router.post(
  "/",
  checkAuth(Role.USER),
  validateRequest(ReviewValidation.createReviewZodSchema),
  ReviewController.create
);

router.patch(
  "/:id",
  checkAuth(Role.USER),
  validateRequest(ReviewValidation.updateReviewZodSchema),
  ReviewController.updateById
);

router.patch(
  "/:id/status",
  checkAuth(Role.ADMIN),
  ReviewController.updateReviewStatusById
);

router.delete("/:id", checkAuth(Role.ADMIN), ReviewController.deleteById);

export const ReviewRoutes = router;
