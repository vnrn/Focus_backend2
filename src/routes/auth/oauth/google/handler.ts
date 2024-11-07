import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import db, { RedisClient } from "../../../../db/connect";
import { usersTable } from "../../../../db/schema";
import { and, eq } from "drizzle-orm";

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

import axios from "axios";

async function getGoogleTokens(code: string) {
  const tokenEndpoint = "https://oauth2.googleapis.com/token";

  try {
    const response = await axios.post(tokenEndpoint, {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code"
    });

    const { access_token, refresh_token, expires_in, id_token } = response.data;
    return {
      accessToken: access_token,
      refreshToken: refresh_token,
      idToken: id_token,
      expiresIn: expires_in
    };
  } catch (error) {
    console.error("Failed to exchange code for tokens:", error);
    throw new Error("Could not retrieve tokens");
  }
}

export async function GoogleOauthHandler(req: Request, res: Response) {
  const { code } = req.query as { code: string };
  console.log(code);
  if (!code) {
    res.status(400).redirect(`${process.env.FRONTEND_BASE}/auth/signup`);
    return;
  }
  try {
    const tokens = await getGoogleTokens(code);
    const decode: any = jwt.decode(tokens.idToken);
    const googleSubid = decode.sub.toString() as string;

    const user = await db
      .select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.providerId, googleSubid),
          eq(usersTable.provider, "google")
        )
      )
      .limit(1);

    if (user.length > 0) {
      //login
      await db
        .update(usersTable)
        .set({
          refreshToken: tokens.refreshToken,
          accessToken: tokens.accessToken,
          lastLoginAt: new Date()
        })
        .where(eq(usersTable.id, user[0].id));

      res
        .status(200)
        .cookie("refToken", tokens.refreshToken, { httpOnly: true })
        .cookie("accessToken", tokens.accessToken, {
          httpOnly: true
        })
        .cookie("prov", "google", { httpOnly: true })
        .redirect(`${process.env.FRONTEND_BASE}/dashboard`);
      return;
    } else {
      //signup
      const newUser = await db
        .insert(usersTable)
        .values({
          username: googleSubid,
          provider: "google",
          providerId: googleSubid,
          refreshToken: tokens.refreshToken,
          accessToken: tokens.accessToken,
          lastLoginAt: new Date()
        })
        .returning();
      res
        .status(200)
        .cookie("refToken", tokens.refreshToken, { httpOnly: true })
        .cookie("accessToken", tokens.accessToken, {
          httpOnly: true
        })
        .cookie("prov", "google", { httpOnly: true })
        .redirect("http://localhost:3000/dashboard");
      return;
    }
  } catch (error) {
    console.error("Error verifying Google OAuth code:", error);
    res.status(500).redirect("http://localhost:3000/auth/signup");
    return;
  }
}

// const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
// const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// async function verifyGoogleAccessToken(
//   accessToken: string,
//   refreshToken: string
// ): Promise<string | null> {
//   const cachedToken = await RedisClient.get(accessToken);

//   if (cachedToken) {
//     return accessToken;
//   }

//   // Token not in cache or expired, validate with Google
//   try {
//     const response = await axios.get(
//       `https://oauth2.googleapis.com/tokeninfo?access_token=${accessToken}`
//     );

//     if (response.data.aud !== GOOGLE_CLIENT_ID) {
//       throw new Error("Invalid token audience");
//     }

//     // Cache the token with an expiration slightly less than Google's expiration
//     const expiry = Math.max(
//       0,
//       response.data.exp - Math.floor(Date.now() / 1000) - 60
//     );
//     await RedisClient.setex(accessToken, expiry, "valid");

//     return accessToken; // Return the valid access token
//   } catch (error) {
//     console.error("Access token invalid, attempting to refresh:", error);

//     // Attempt to refresh the token
//     const newAccessToken = await refreshGoogleAccessToken(refreshToken);
//     if (!newAccessToken) {
//       return null; // Could not refresh, user needs to re-authenticate
//     }

//     // Cache the new access token and return it
//     await RedisClient.setex(newAccessToken, 3600, "valid");
//     return newAccessToken;
//   }
// }

// // Function to refresh the Google access token
// async function refreshGoogleAccessToken(
//   refreshToken: string
// ): Promise<string | null> {
//   try {
//     const response = await axios.post("https://oauth2.googleapis.com/token", {
//       client_id: GOOGLE_CLIENT_ID,
//       client_secret: GOOGLE_CLIENT_SECRET,
//       refresh_token: refreshToken,
//       grant_type: "refresh_token"
//     });

//     return response.data.access_token;
//   } catch (error) {
//     console.error("Failed to refresh Google access token:", error);
//     return null;
//   }
// }
