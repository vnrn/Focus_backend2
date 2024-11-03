import { Router } from "express";
import SignUpHandler from "./signup/handler";
import SignUpValidation from "./signup/validation";
import LoginValidation from "./login/validation";
import LoginHandler from "./login/handler";

const AuthRouter = Router();

AuthRouter.post("/signup", SignUpValidation, SignUpHandler);
AuthRouter.post("/login", LoginValidation, LoginHandler);
export default AuthRouter;
