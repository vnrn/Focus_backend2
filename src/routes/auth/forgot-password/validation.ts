import { Request, Response, NextFunction } from "express";
import zod, { ZodError } from "zod";
import "dotenv/config";

const ForgotPasswordSchema = zod.object({
  usernameOrEmail: zod
    .string({ message: "Please enter a string username or email" })
    .min(1, { message: "Please enter your username or email" })
    .min(3, {
      message: "Username or email must be at least 3 characters long"
    })
});

export default function ForgotPasswordValidation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { usernameOrEmail } = req.body;

  try {
    ForgotPasswordSchema.parse({ usernameOrEmail });
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
