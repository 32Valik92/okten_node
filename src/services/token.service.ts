import * as jwt from "jsonwebtoken";

import { configs } from "../configs";
import { EActionTokenTypes, ETokenType } from "../enums";
import { ApiError } from "../errors";
import { ITokenPair, ITokenPayload } from "../types";

class TokenService {
  public generateTokenPair(payload: ITokenPayload): ITokenPair {
    // Створюємо пару tokens. expiresIn - час життя їхнього
    const accessToken = jwt.sign(payload, configs.JWT_ACCESS_SECRET, {
      expiresIn: "1d",
    });
    const refreshToken = jwt.sign(payload, configs.JWT_REFRESH_SECRET, {
      expiresIn: "30d",
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  // Метод на перевірку самого токена чи він наш
  public checkToken(token: string, type: ETokenType): ITokenPayload {
    try {
      let secret: string;

      // По якому ключі його перевіряти
      switch (type) {
        case ETokenType.Access:
          secret = configs.JWT_ACCESS_SECRET;
          break;
        case ETokenType.Refresh:
          secret = configs.JWT_REFRESH_SECRET;
          break;
      }

      // Повертаємо payload or false для verify
      return jwt.verify(token, secret) as ITokenPayload;
    } catch (e) {
      throw new ApiError("Token not valid", 401);
    }
  }

  // Метод для створення допоміжного токена для відновлення пароля
  // Принцип той самий, що й в методі вище
  public generateActionToken(
    payload: ITokenPayload,
    tokenType: EActionTokenTypes
  ): string {
    try {
      let secret: string;

      switch (tokenType) {
        case EActionTokenTypes.Forgot:
          secret = configs.JWT_FORGOT_SECRET;
          break;
        case EActionTokenTypes.Activate:
          secret = configs.JWT_ACTIVATE_SECRET;
          break;
      }

      return jwt.sign(payload, secret, { expiresIn: "7d" });
    } catch (e) {
      throw new ApiError("Token not valid", 401);
    }
  }

  // Метод подібний до checkToken, але перевіряє допоміжні токени для відновлення та активації
  public checkActionToken(
    token: string,
    tokenType: EActionTokenTypes
  ): ITokenPayload {
    try {
      let secret: string;

      switch (tokenType) {
        case EActionTokenTypes.Forgot:
          secret = configs.JWT_FORGOT_SECRET;
          break;
        case EActionTokenTypes.Activate:
          secret = configs.JWT_ACTIVATE_SECRET;
          break;
      }

      return jwt.verify(token, secret) as ITokenPayload;
    } catch (e) {
      throw new ApiError("Token not valid", 401);
    }
  }
}

export const tokenService = new TokenService();
