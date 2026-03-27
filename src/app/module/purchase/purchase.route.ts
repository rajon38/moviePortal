import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { checkAuth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { PurchaseController } from "./purchase.controller.js";
import { PurchaseValidation } from "./purchase.validation.js";

const router = Router();

// Admin routes
router.get(
  "/",
  checkAuth(Role.ADMIN),
  PurchaseController.getAll
);

router.get(
  "/:id",
  checkAuth(Role.ADMIN, Role.USER),
  PurchaseController.getById
);

// Admin: Cancel unpaid purchases (scheduled task)
router.post(
  "/admin/cancel-unpaid",
  checkAuth(Role.ADMIN),
  PurchaseController.cancelUnpaidPurchases
);

// User routes
router.get(
  "/my-purchases/list",
  checkAuth(Role.USER),
  PurchaseController.getUserPurchases
);

router.get(
  "/access/:mediaId",
  checkAuth(Role.USER),
  PurchaseController.checkAccess
);

// 🛒 PAY LATER: Create purchase (user pays later)
router.post(
  "/",
  checkAuth(Role.USER),
  validateRequest(PurchaseValidation.createPurchaseZodSchema),
  PurchaseController.create
);

// 💳 PAY NOW: Create purchase + checkout session in one request
router.post(
  "/checkout",
  checkAuth(Role.USER),
  validateRequest(PurchaseValidation.createPurchaseZodSchema),
  PurchaseController.createAndCheckout
);

// 💰 PAY LATER: Initiate checkout for unpaid purchase
router.post(
  "/:purchaseId/initiate-payment",
  checkAuth(Role.USER),
  PurchaseController.initiatePayment
);

// Update & Delete
router.patch(
  "/:id",
  checkAuth(Role.USER),
  validateRequest(PurchaseValidation.updatePurchaseZodSchema),
  PurchaseController.updateById
);

router.delete(
  "/:id",
  checkAuth(Role.USER),
  PurchaseController.deleteById
);

export const PurchaseRoutes = router;
