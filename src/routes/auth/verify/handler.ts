// GET ( FOR VERIFY ACCOUNT WITH (verify token )) & POST (TO SEND NEW VALIDATION LINK TO THE USER EMAIL (EMAIL OR USERNAME))
// Validation at the same file

import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { usersTable } from "../../../db/schema";
import db from "../../../db/connect";
import sendEmail from "../../../utils/email/sender";

//get request
export default async function verifyHandler(req: Request, res: Response) {
  const { token } = req.query;
  if (!token || typeof token !== "string" || token === "") {
    res.status(400).json({
      errors: [{ field: "general", message: "please provide a valid token." }]
    });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
      type: string;
    };
    if (decoded.type !== "verify") {
      res.status(400).json({ message: "please provide a valid token" });
      return;
    }

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, decoded.userId as string))
      .limit(1);

    if (!user || user.length < 1) {
      res.status(400).json({
        errors: [
          {
            field: "general",
            message: "sorry, this account does not exist"
          }
        ]
      });
      return;
    } else if (user[0].verifiedAt !== null) {
      res.status(400).json({
        errors: [
          {
            field: "general",
            message: "this account is already verified"
          }
        ]
      });
      return;
    } else if (user[0].verifyToken !== token) {
      res.status(400).json({
        errors: [
          {
            field: "general",
            message: "please provide a valid token"
          }
        ]
      });
      return;
    }

    await db
      .update(usersTable)
      .set({
        verifyToken: null,
        verifiedAt: new Date()
      })
      .where(eq(usersTable.id, decoded.userId as string));
    res.status(200).json({ message: "your account has been verified" });
    return;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res
        .status(400)
        .json({ erros: [{ field: "general", message: "token expired" }] });
      return;
    } else if (error instanceof jwt.JsonWebTokenError) {
      res
        .status(400)
        .json({ errors: [{ field: "general", message: "invalid token" }] });
      return;
    } else {
      console.log(error);
      res
        .status(400)
        .json({ message: "something went wrong, please try again" });
      return;
    }
  }
}

// get new account verifying token (post request)

export async function NewVerifyToken(req: Request, res: Response) {
  const { refToken } = req.body || req.cookies;

  if (!refToken || typeof refToken !== "string" || refToken === "") {
    res.status(400).json({
      errors: [{ field: "general", message: "please provide a valid token." }]
    });
    return;
  }

  try {
    const decoded = jwt.verify(refToken, process.env.JWT_SECRET as string) as {
      userId: string;
      type: string;
    };

    if (decoded.type !== "refresh") {
      res.status(400).json({
        errors: [{ field: "general", message: "please provide a valid token." }]
      });
      return;
    }

    //sending logic
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, decoded.userId as string))
      .limit(1);

    if (!user || user.length < 1) {
      res.status(400).json({
        errors: [
          {
            field: "general",
            message: "sorry, this account does not exist"
          }
        ]
      });
      return;
    } else if (user[0].refreshToken !== refToken) {
      res.status(400).json({
        errors: [
          {
            field: "general",
            message: "please provide a valid refresh token"
          }
        ]
      });
      return;
    }

    const verifyToken = jwt.sign(
      { type: "verify", userId: decoded.userId, provider: "local" },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    const updatedUser = await db
      .update(usersTable)
      .set({ verifyToken })
      .where(eq(usersTable.id, decoded.userId as string));
    res.status(200).json({ message: "please check your email" });
    sendEmail(
      [user[0].email as string],
      "Verify your account",
      `<a href="${process.env.VERIFY_ROUTE}/${verifyToken}">Verify your account</a>`
    );
    return;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res
        .status(400)
        .json({ erros: [{ field: "general", message: "token expired" }] });
      return;
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(400).json({
        errors: [{ field: "general", message: "please provide a valid token" }]
      });
      return;
    } else {
      console.log(error);
      res
        .status(400)
        .json({ message: "something went wrong, please try again" });
      return;
    }
  }
}
