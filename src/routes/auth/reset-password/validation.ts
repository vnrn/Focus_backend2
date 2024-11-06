import zod, { ZodError } from "zod";
import "dotenv/config";
import { NextFunction, Request, Response } from "express";

const ResetPasswordSchema = zod
  .object({
    token: zod.string({ message: "Please enter a token" }).min(1, {
      message: "Please enter a valid token"
    }),
    password: zod
      .string({ message: "please, enter your password" })
      .min(8, { message: "sorry, Password must be at least 8 characters" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[^a-zA-Z0-9]/, {
        message: "Password must contain at least one special character"
      }),
    passwordRepeat: zod.string({ message: "Please repeat your password" })
  })
  .refine((data) => data.password === data.passwordRepeat, {
    message: "Passwords do not match",
    path: ["passwordRepeat"]
  });

export default function ResetPasswordValidation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { token, password, passwordRepeat } = req.body;
  try {
    ResetPasswordSchema.parse({ token, password, passwordRepeat });
    next();
    return;
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        errorType: "zod",
        errors: error.errors.map((err) => ({
          field: err.path[0],
          message: err.message
        }))
      });
      return;
    }
    res.status(500).json({
      errorType: process.env.APP_NAME,
      errors: [
        {
          field: "general",
          message: "Something went wrong, please try again"
        }
      ]
    });
    return;
  }
}
