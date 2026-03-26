import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { checkAuth } from "../../middleware/checkAuth.js";
import { WatchListController } from "./watchList.controller.js";

const router = Router();

router.get("/", checkAuth(Role.USER), WatchListController.getAll);

router.get("/:id", checkAuth(Role.USER), WatchListController.getById);

router.post(
  "/",
  checkAuth(Role.USER),
  WatchListController.create
);

router.delete("/:id", checkAuth(Role.USER), WatchListController.deleteById);

router.delete("/", checkAuth(Role.USER), WatchListController.deleteAll);

export const WatchListRoutes = router;
