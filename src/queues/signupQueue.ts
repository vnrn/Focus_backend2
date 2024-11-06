import Bull from "bull";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/email/sender";
import db, { RedisClient } from "../db/connect";
import {
  profilesTable,
  settingsTable,
  trailsTable,
  usersTable
} from "../db/schema";
import { getFutureDate } from "../routes/auth/functions/dates";
var settings = {
  // lockDuration: 30000, // Key expiration time for job locks.
  // lockRenewTime: 15000, // Interval on which to acquire the job lock
  // maxStalledCount: 1, // Max amount of times a stalled job will be re-processed.
  // retryProcessDelay: 5000, // delay before processing next job in case of internal error.
  // backoffStrategies: {}, // A set of custom backoff strategies keyed by name.
  stalledInterval: 300000, // How often check for stalled jobs (use 0 for never checking).
  guardInterval: 300000, // Poll interval for delayed jobs and added jobs.
  drainDelay: 300 // A timeout for when the queue is in drained state (empty waiting for jobs).
};

import Redis from "ioredis";

// const client = new Redis(
//   "rediss://default:AWlYAAIjcDEwNjQ4YjdmNDk1NjY0ODIzOTFkMWNiNmIzOGRkZGFhNHAxMA@fancy-sparrow-26968.upstash.io:6379",
//   {
//     maxRetriesPerRequest: null,
//     enableReadyCheck: false
//   }
// );

const signupQueue = new Bull(
  "signupQueue",
  process.env.REDIS_URL_BULL as string
);

signupQueue.process(async (jop, done) => {
  const { email, userId } = jop.data;
  console.log("Processing signup queue:", jop.data);
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
