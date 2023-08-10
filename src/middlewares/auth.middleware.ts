import { NextFunction, Request, Response } from "express";

import { EActionTokenTypes, ETokenType } from "../enums";
import { ApiError } from "../errors";
import { Action, Token } from "../models";
import { tokenService } from "../services";

class AuthMiddleware {
  // Метод для перевірки чи Access токен дійсні, щоб перейти на якийсь ендпроінт
  public async checkAccessToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Дістаємо наш accessToken із запиту
      const accessToken = req.get("Authorization");

      if (!accessToken) {
        throw new ApiError("No token", 401);
      }

      const payload = tokenService.checkToken(accessToken, ETokenType.Access);

      // Шукаємо токен по нашому взятому з запиту токену
      const entity = await Token.findOne({ accessToken });
      if (!entity) {
        throw new ApiError("Token not valid", 401);
      }

      req.res.locals.tokenPayload = payload;
      next();
    } catch (e) {
      next(e);
    }
  }

  // Метод для перевірки чи Refresh токен дійсні, щоб отримати нову пару токенів
  public async checkRefreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const refreshToken = req.get("Authorization");

      if (!refreshToken) {
        throw new ApiError("No token", 401);
      }

      const payload = tokenService.checkToken(refreshToken, ETokenType.Refresh);

      // Перевіримо чи це наш токен і чи він є в базі
      const entity = await Token.findOne({ refreshToken });
      if (!entity) {
        throw new ApiError("Token not valid", 401);
      }

      // Кладемо нашу пару токенів з DB в об'єкт, щоб потім використати Refresh та видалити старі
      req.res.locals.oldTokenPair = entity;
      // Передаємо корисне навантаження далі в tokenPayload
      req.res.locals.tokenPayload = { name: payload.name, _id: payload._id };

      next();
    } catch (e) {
      next(e);
    }
  }

  // Метод для фіксації чи наш токен для відновлення живий
  public checkActionToken(tokenType: EActionTokenTypes) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Дістаємо з параметрів
        const actionToken = req.params.token;

        if (!actionToken) {
          throw new ApiError("Token is not provided", 400);
        }

        const jwtPayload = tokenService.checkActionToken(
          actionToken,
          tokenType
        );

        const tokenFromDb = await Action.findOne({ actionToken });

        if (!tokenFromDb) {
          throw new ApiError("Token is invalid", 400);
        }

        req.res.locals = { jwtPayload, tokenFromDb };

        next();
      } catch (e) {
        next(e);
      }
    };
  }
}

export const authMiddleware = new AuthMiddleware();
