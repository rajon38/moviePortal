import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { multerUpload } from "../../config/multer.config.js";
import { checkAuth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { MediaController } from "./media.controller.js";
import { updateMediaMiddleware, createMediaMiddleware } from "./media.middleware.js";
import { MediaValidation } from "./media.validation.js";

const router = Router();

router.get("/",
  checkAuth(Role.ADMIN, Role.USER),
  MediaController.getAll
);

router.get("/:id", checkAuth(Role.ADMIN, Role.USER), MediaController.getById);
router.post(
  "/",
  checkAuth(Role.ADMIN),
  multerUpload.fields([{ name: "imageUrl", maxCount: 1 }]),
  createMediaMiddleware,
  validateRequest(MediaValidation.createMediaZodSchema),
  MediaController.create
);

router.patch(
  "/:id",
  checkAuth(Role.ADMIN),
  multerUpload.fields([{ name: "imageUrl", maxCount: 1 }]),
  updateMediaMiddleware,
  validateRequest(MediaValidation.updateMediaZodSchema),
  MediaController.updateById
);

router.delete("/:id", checkAuth(Role.ADMIN), MediaController.deleteById);

export const MediaRoutes = router;
