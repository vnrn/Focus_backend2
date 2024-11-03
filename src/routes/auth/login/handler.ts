import { Request, Response } from "express";
import db from "../../../db/connect";
import { usersTable } from "../../../db/schema";
import { and, eq, or } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { genAccessToken } from "../functions/tokens";

const APP_NAME = process.env.APP_NAME as string;
const JWT_SECRET = process.env.JWT_SECRET as string;

export default async function LoginHandler(req: Request, res: Response) {
  const { usernameOrEmail, password } = req.body;

  try {
    const user = await db
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

    if (user.length < 1) {
      res.status(400).json({
        from: APP_NAME,
        errors: [
          {
            field: "general",
            message:
              "Unable to log in. Please check your credentials and try again."
          }
        ]
      });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user[0].password as string
    );
    if (!isPasswordCorrect) {
      res.status(400).json({
        from: APP_NAME,
        errors: [
          {
            field: "password",
            message: "Sorry, password is incorrect."
          }
        ]
      });
      return;
    }

    const refreshToken = jwt.sign(
      { type: "refresh", userId: user[0].id },
      JWT_SECRET,
      { expiresIn: "60d" }
    );
    const accessToken = genAccessToken(refreshToken);

    await db
      .update(usersTable)
      .set({ refreshToken, lastLoginAt: new Date() })
      .where(eq(usersTable.id, user[0].id));

    res.cookie("refToken", refreshToken).status(200).json({
      from: APP_NAME,
      data: {
        accessToken,
        refreshToken
      }
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      from: APP_NAME,
      errors: [
        {
          field: "general",
          message: "Sorry, something went wrong. Please try again later."
        }
      ]
    });
    return;
  }
}
