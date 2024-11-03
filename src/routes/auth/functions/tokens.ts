import jwt from "jsonwebtoken";
import "dotenv/config";

function genAccessToken(refreshToken: string): string | null {
  try {
    // Verify and decode the refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET as string
    ) as {
      userId: string;
      type: string;
    };

    if (decoded.type !== "refresh") return null;

    // Generate a new access token with the specified payload structure
    const accessToken = jwt.sign(
      { type: "access", userId: decoded.userId },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" }
    );

    return accessToken;
  } catch (error) {
    return null;
  }
}

export { genAccessToken };
