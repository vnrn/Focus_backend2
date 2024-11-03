import { NextFunction, Request, Response } from "express";
import z from "zod";

export default async function LoginValidation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { usernameOrEmail, password } = req.body;
  const LoginSchema = z.object({
    usernameOrEmail: z
      .string({ message: "please, enter your username or email" })
      .min(3, {
        message: "sorry, Username or Email must be at least 3 characters"
      })
      .max(30, { message: "sorry, Username cannot exceed 20 characters" }),
    password: z
      .string({ message: "please, enter your password" })
      .min(8, { message: "sorry, Password must be at least 8 characters" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[^a-zA-Z0-9]/, {
        message: "Password must contain at least one special character"
      })
  });

  try {
    await LoginSchema.parseAsync({ usernameOrEmail, password });
    next();
    return;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        path: err.path,
        message: err.message
      }));
      res.status(400).json({
        from: "zod",
        errors: formattedErrors
      });
      return;
    } else {
      res.status(500).json({
        from: process.env.APP_NAME as string,
        message: "Internal Server Error"
      });
      return;
    }
  }
}
