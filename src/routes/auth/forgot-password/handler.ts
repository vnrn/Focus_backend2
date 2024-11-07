import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import db from "../../../db/connect";
import { usersTable } from "../../../db/schema";
import { and, eq, or } from "drizzle-orm";
import "dotenv/config";
import sendEmail from "../../../utils/email/sender";

export default async function forgotPasswordHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { usernameOrEmail } = req.body;
  try {
    await db.transaction(async (tx) => {
      const user = await tx
        .select()
        .from(usersTable)
        .where(
          or(
            and(
              eq(usersTable.username, usernameOrEmail),
              eq(usersTable.provider, "local")
            ),
            and(
              eq(usersTable.email, usernameOrEmail),
              eq(usersTable.provider, "local")
            )
          )
        )
        .limit(1);

      if (user.length === 0) {
        const isItEmail = usernameOrEmail.includes("@");
        res.status(400).json({
          errorType: process.env.APP_NAME,
          errors: [
            {
              field: "usernameOrEmail",
              message: `Sorry, we couldn't find an account with that ${
                isItEmail ? "email" : "username"
              }.`
            }
          ]
        });
        return;
      }

      const resetPasswordToken = jwt.sign(
        { type: "resetPassword", userId: user[0].id, provider: "local" },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "1d"
        }
      );

      await tx
        .update(usersTable)
        .set({ resetPasswordToken })
        .where(eq(usersTable.id, user[0].id));

      await sendEmail(
        [user[0].email as string],
        "Reset Your Password",
        `<a href="${process.env.FRONTEND_BASE}/auth/reset-password?token=${resetPasswordToken}">Click here to reset your password</a>`
      );

      res.status(200).json({
        message: `Password reset email sent to ${obfuscateEmail(
          user[0].email as string
        )}`,
        email: obfuscateEmail(user[0].email as string)
      });
      return;
    });
  } catch (error) {
    console.error(error);
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

function obfuscateEmail(email: string) {
  const [localPart, domain] = email.split("@");
  const halfLength = Math.ceil(localPart.length / 2);

  const obfuscatedPart = "*".repeat(halfLength) + localPart.slice(halfLength);
  const obfuscatedEmail = obfuscatedPart + "@" + domain;

  return obfuscatedEmail;
}
