import * as jwt from "jsonwebtoken";

import { ITokenPair } from "../types/token.types";

class TokenService {
  public generateTokenPair(
    payload: Record<string, string | number>
  ): ITokenPair {
    const accessToken = jwt.sign(payload, "jwtAccess", { expiresIn: "15m" });
    const refreshToken = jwt.sign(payload, "jwtRefresh", { expiresIn: "30d" });

    return {
      accessToken,
      refreshToken,
    };
  }
}

export const tokenService = new TokenService();
