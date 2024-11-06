import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import db from "../../../../db/connect";
import { usersTable } from "../../../../db/schema";
import { and, eq } from "drizzle-orm";

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function GoogleOauthHandler(req: Request, res: Response) {
  const { code } = req.body;
  if (!code) {
    res.status(400).json({ error: "No authorization code provided" });
    return;
  }
  try {
    // Exchange the authorization code for tokens
    const tokens = await client.getToken(code);
    if (!tokens.tokens) {
      res.status(400).json({ error: "Failed to exchange authorization code" });
      return;
    }
    const tokenInfo = await client.getTokenInfo(
      tokens.tokens.access_token as string
    );

    const googleSubId = tokenInfo.sub?.toString() as string;
    const user = await db
      .select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.providerId, googleSubId),
          eq(usersTable.provider, "google")
        )
      )
      .limit(1);

    if (user.length > 0) {
      //login
    } else {
      //signup
    }
    res.status(200).json({
      message: "Authentication successful",
      tokens: tokens
    });
  } catch (error) {
    console.error("Error verifying Google OAuth code:", error);
    res.status(500).json({ error: "Failed to authenticate" });
    return;
  }
}
