import { Router } from "express";
import SignUpHandler from "./signup/handler";
import SignUpValidation from "./signup/validation";

const AuthRouter = Router();

AuthRouter.post("/signup", SignUpValidation, SignUpHandler);

export default AuthRouter;
