import Bull from "bull";
import { RedisClient } from "../redis/redisConnect";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/email/sender";
import db from "../db/connect";
import {
  profilesTable,
  settingsTable,
  trailsTable,
  usersTable
} from "../db/schema";
import { getFutureDate } from "../routes/auth/functions/dates";

let reconnectingEvent = false;
const signupQueue = new Bull(
  "signupQueue",
  process.env.REDIS_URL_BULL as string
);

signupQueue.process(async (jop, done) => {
  const { email, userId } = jop.data;
  try {
    const verifyToken = jwt.sign(
      { type: "verify", userId: userId, provider: "local" },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );
    await sendEmail(
      [email],
      "Verify your account",
      `<a href="${process.env.VERIFY_ROUTE}/${verifyToken}">Verify your account</a>`
    );
    jop.progress(50);
    await db.transaction(async (tx) => {
      await tx.update(usersTable).set({
        verifyToken
      });
      jop.progress(60);
      await tx.insert(settingsTable).values({
        userId,
        emailNotifications: true,
        pushNotifications: true
      });
      await tx.insert(profilesTable).values({
        gender: "prefer not to say",
        userId: userId
      });
      await tx.insert(trailsTable).values({
        userId,
        trail_end: getFutureDate(14, new Date())
      });
    });
    done();
  } catch (error) {
    console.error("Error processing signup queue:", error);
    done(new Error("Failed to process signup queue"));
  }
});

export default signupQueue;
