import { Router } from "express";
import SignUpHandler from "./signup/handler";
import SignUpValidation from "./signup/validation";
import LoginValidation from "./login/validation";
import LoginHandler from "./login/handler";
import verifyHandler, { NewVerifyToken } from "./verify/handler";
import { rateLimit } from "express-rate-limit";
import ForgotPasswordValidation from "./forgot-password/validation";
import forgotPasswordHandler from "./forgot-password/handler";
import {
  GetResetPasswordHandler,
  resetPasswordHandler
} from "./reset-password/handler";
import ResetPasswordValidation from "./reset-password/validation";
import { GoogleOauthHandler } from "./oauth/google/handler";

const limiter = rateLimit({
  windowMs: 60000,
  limit: 20,
  standardHeaders: "draft-7",
  message: "Too many attempts, please try again later.",
  legacyHeaders: false
});

const AuthRouter = Router();
AuthRouter.use(limiter);

//main auth
AuthRouter.post("/signup", SignUpValidation, SignUpHandler);
AuthRouter.post("/login", LoginValidation, LoginHandler);

//account verify auth
AuthRouter.get("/verify", verifyHandler);
AuthRouter.post("/new-verify", NewVerifyToken);

//forgot password auth
AuthRouter.post(
  "/forgot-password",
  ForgotPasswordValidation,
  forgotPasswordHandler
);

//reset-password
AuthRouter.get("/reset-password", GetResetPasswordHandler);
AuthRouter.post(
  "/reset-password",
  ResetPasswordValidation,
  resetPasswordHandler
);

// oauth providers

AuthRouter.post("/oauth/google", GoogleOauthHandler);

export default AuthRouter;
