import { Router } from "express";
import { AuthController } from "./auth.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { AuthValidation } from "./auth.validation";
import { multerUpload } from "../../config/multer.config";
import { updateProfileMiddleware } from "./auth.middleware";

const router = Router();

router.post("/register", validateRequest(AuthValidation.registerZodSchema), AuthController.register);
router.post("/login", validateRequest(AuthValidation.loginZodSchema), AuthController.login);
router.get("/me", checkAuth(Role.ADMIN, Role.USER), AuthController.getMe);
router.post("/refresh-token", AuthController.getNewToken);
router.post("/change-password",
    checkAuth(Role.ADMIN, Role.USER),
    validateRequest(AuthValidation.changePasswordZodSchema),
    AuthController.changePassword);
router.post("/logout",
    checkAuth(Role.ADMIN, Role.USER),
    AuthController.logoutUser);
router.post("/verify-email", validateRequest(AuthValidation.verifyEmailZodSchema), AuthController.verifyEmail);
router.post("/forget-password", validateRequest(AuthValidation.forgetPasswordZodSchema), AuthController.forgetPassword);
router.post("/reset-password", validateRequest(AuthValidation.resetPasswordZodSchema), AuthController.resetPassword);
router.get("/login/google", AuthController.googleLogin);
router.get("/google/success", AuthController.googleLoginSuccess);
router.get("/oauth/error", AuthController.handleOAuthError);
router.patch("/updateProfile", checkAuth(Role.ADMIN, Role.USER),
  multerUpload.fields([{ name: "image", maxCount: 1 }]),
  updateProfileMiddleware,
  AuthController.updateProfile);

export const AuthRoutes = router;
