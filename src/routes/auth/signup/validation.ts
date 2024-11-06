import { NextFunction, Request, Response } from "express";
import z from "zod";

export default async function SignUpValidation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { username, email, password } = req.body;
  const signupSchema = z.object({
    username: z
      .string({ message: "please, enter your username" })
      .min(3, { message: "sorry, Username must be at least 3 characters" })
      .max(30, { message: "sorry, Username cannot exceed 20 characters" })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message:
          "sorry, Username can only contain letters, numbers, and underscores"
      }),
    email: z
      .string({ message: "please, enter your email" })
      .email({ message: "please, enter a valid email" }),
    password: z
      .string({ message: "please, enter your password" })
      .min(8, { message: "sorry, Password must be at least 8 characters" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[^a-zA-Z0-9]/, {
        message: "Password must contain at least one special character"
      })
  });

  try {
    await signupSchema.parseAsync({ username, email, password });
    next();
    return;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path[0],
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
