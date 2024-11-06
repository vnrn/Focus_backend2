import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import "dotenv/config";
import { Request, Response } from "express";
import db from "../../../db/connect";
import { usersTable } from "../../../db/schema";
import { and, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function GetResetPasswordHandler(req: Request, res: Response) {
  const token = req.query.token as string | undefined;

  if (!token || typeof token !== "string") {
    res.status(400).json({
      errorType: process.env.APP_NAME,
      errors: [
        {
          field: "general",
          message: "Please provide a valid token"
        }
      ]
    });
    return;
  }

  try {
    const tokenPayload = jwt.verify(
      token as string,
      process.env.JWT_SECRET as string
    ) as { userId: string; provider: string };

    const user = await db
      .select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.id, tokenPayload.userId),
          eq(usersTable.provider, "local")
        )
      )
      .limit(1);
    if (user.length === 0) {
      res.status(400).json({
        errorType: process.env.APP_NAME,
        errors: [
          {
            field: "general",
            message: "Invalid token"
          }
        ]
      });
      return;
    } else if ((user[0].resetPasswordToken as string | undefined) !== token) {
      res.status(400).json({
        errorType: process.env.APP_NAME,
        errors: [
          {
            field: "general",
            message: "Invalid token"
          }
        ]
      });
      return;
    }

    res.status(200).json({
      message: "that's a valid token"
    });
    return;
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      res.status(400).json({
        errorType: process.env.APP_NAME,
        errors: [
          {
            field: "general",
            message: "Invalid token"
          }
        ]
      });
      return;
    } else if (error instanceof TokenExpiredError) {
      res.status(400).json({
        errorType: process.env.APP_NAME,
        errors: [
          {
            field: "general",
            message: "Token expired"
          }
        ]
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

export async function resetPasswordHandler(req: Request, res: Response) {
  const { password, passwordRepeat, token } = req.body;
  if (!password || !passwordRepeat || !token) {
    res.status(400).json({
      errorType: process.env.APP_NAME,
      errors: [
        {
          field: "general",
          message: "Please provide all required data"
        }
      ]
    });
    return;
  }
  try {
    const tokenPayload = jwt.verify(
      token as string,
      process.env.JWT_SECRET as string
    ) as { type: string; userId: string; provider: string };

    if (!tokenPayload) {
      res.status(400).json({
        errorType: process.env.APP_NAME,
        errors: [
          {
            field: "general",
            message: "Invalid token"
          }
        ]
      });
      return;
    }

    if (password !== passwordRepeat) {
      res.status(400).json({
        errorType: process.env.APP_NAME,
        errors: [
          {
            field: "general",
            message: "Passwords do not match"
          }
        ]
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.transaction(async (tx) => {
      const user = await tx
        .select()
        .from(usersTable)
        .where(
          and(
            eq(usersTable.id, tokenPayload.userId),
            eq(usersTable.provider, "local")
          )
        )
        .limit(1);
      if (user.length === 0) {
        res.status(400).json({
          errorType: process.env.APP_NAME,
          errors: [
            {
              field: "general",
              message: "sorry, we can't find and update your account"
            }
          ]
        });
        return;
      }
      if (user[0].resetPasswordToken === token) {
        const updatedUser = await db
          .update(usersTable)
          .set({ password: hashedPassword, resetPasswordToken: null })
          .where(
            and(
              eq(usersTable.id, tokenPayload.userId),
              eq(usersTable.provider, "local")
            )
          )
          .returning({
            id: usersTable.id,
            email: usersTable.email
          });
        res.status(200).json({
          message: "Password reset successful",
          user: updatedUser
        });
        return;
      } else {
        res.status(400).json({
          errorType: process.env.APP_NAME,
          errors: [
            {
              field: "general",
              message: "Invalid token"
            }
          ]
        });
        return;
      }
    });
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      res.status(400).json({
        errorType: process.env.APP_NAME,
        errors: [
          {
            field: "general",
            message: "Invalid token"
          }
        ]
      });
      return;
    } else if (error instanceof TokenExpiredError) {
      res.status(400).json({
        errorType: process.env.APP_NAME,
        errors: [
          {
            field: "general",
            message: "Token expired"
          }
        ]
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
