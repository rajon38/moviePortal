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

router.post("/:id/like", checkAuth(Role.USER), ReviewController.toggleLike);

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

router.post("/comments", checkAuth(Role.USER), ReviewController.createComment);

router.patch("/comments/:id", checkAuth(Role.USER), ReviewController.updateComment);

router.delete("/comments/:id", checkAuth(Role.USER), ReviewController.deleteComment);

export const ReviewRoutes = router;
