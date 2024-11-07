import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import db from "../../../db/connect";
import { usersTable } from "../../../db/schema";
import { and, eq, or } from "drizzle-orm";
import "dotenv/config";
import signupQueue from "../../../queues/signupQueue";

export default async function SignUpHandler(req: Request, res: Response) {
  const { username, email, password } = req.body;
  console.log(req.body);
  try {
    const IsUserExists = await db
      .select()
      .from(usersTable)
      .where(
        or(
          eq(usersTable.username, username),
          and(eq(usersTable.email, email), eq(usersTable.provider, "local"))
        )
      )
      .limit(1);

    if (IsUserExists.length > 0) {
      const isEmailExists = IsUserExists[0].email === email;
      const isUsernameExists = IsUserExists[0].username === username;
      const errors: { field: string; message: string }[] = [];
      if (isEmailExists) {
        errors.push({
          field: "email",
          message: "sorry, email is already exists"
        });
      }
      if (isUsernameExists) {
        errors.push({
          field: "username",
          message: "sorry, username is already taken"
        });
      }
      res.status(400).json({ from: process.env.APP_NAME as string, errors });
      return;
    }
    // saving new user logic
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db
      .insert(usersTable)
      .values({
        username: username,
        email: email,
        password: hashedPassword,
        provider: "local"
      })
      .returning({
        id: usersTable.id
      });

    //run queue here
    await signupQueue
      .add(
        { email, userId: user[0].id },
        {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 5000
          },
          removeOnComplete: true,
          removeOnFail: true
        }
      )
      .catch((e) => console.log(`faild pushing the process to signup queue`));
    res.status(201).json({
      from: process.env.APP_NAME as string,
      data: {
        userId: user[0].id
      },
      message: "user created successfully"
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      from: process.env.APP_NAME as string,
      errors: [
        {
          field: "general",
          message: "something went wrong"
        }
      ]
    });
  }
}
