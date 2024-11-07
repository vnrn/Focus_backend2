import { Request, Response } from "express";
import axios from "axios";
import db from "../../../../db/connect";
import { usersTable } from "../../../../db/schema";
import { eq } from "drizzle-orm";

export default async function GithubOauthHandler(req: Request, res: Response) {
  const { code } = req.query as { code: string };
  if (!code) {
    res.status(400).redirect(`${process.env.FRONTEND_BASE}/auth/signup`);
    return;
  }
  try {
    const tokensUrl = "https://github.com/login/oauth/access_token";
    const tokens = await axios.post(tokensUrl, {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    });
    const params = new URLSearchParams(tokens.data);
    const accessToken = params.get("access_token") as string;

    const userDetails = await getGitHubUserDetails(accessToken);
    const githubId = userDetails.id.toString() as string;
    console.log(githubId, typeof githubId);
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.providerId, githubId))
      .limit(1);
    if (user.length > 0) {
      //login
      await db
        .update(usersTable)
        .set({ accessToken: accessToken, lastLoginAt: new Date() })
        .where(eq(usersTable.providerId, githubId));

      res
        .cookie("accessToken", accessToken, {
          httpOnly: true
        })
        .cookie("prov", "github");

      res.clearCookie("refToken");
      res.status(200).redirect(`${process.env.FRONTEND_BASE}/dashboard`);
      return;
    } else {
      //signup
      const user = await db.insert(usersTable).values({
        username: githubId,
        email: userDetails.email ? userDetails.email : "",
        provider: "github",
        providerId: githubId,
        accessToken: accessToken,
        lastLoginAt: new Date()
      });
      res
        .cookie("accessToken", accessToken, {
          httpOnly: true
        })
        .cookie("prov", "github");

      res.clearCookie("refToken");
      res.status(200).redirect(`${process.env.FRONTEND_BASE}/dashboard`);
      return;
    }
  } catch (error) {
    res.status(200).redirect(`${process.env.FRONTEND_BASE}/auth/signup`);
  }
}

async function getGitHubUserDetails(accessToken: string) {
  try {
    const response = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching GitHub user details:",
      error.response?.data || error.message
    );
    return null;
  }
}
