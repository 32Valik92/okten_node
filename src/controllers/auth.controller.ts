import { NextFunction, Request, Response } from "express";

import { authService } from "../services";
import { ITokenPair, ITokenPayload } from "../types";

class AuthController {
  // Метод для реєстрації
  public async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<void>> {
    try {
      await authService.register(req.body);

      return res.sendStatus(201);
    } catch (e) {
      next(e);
    }
  }

  public async activate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<void>> {
    try {
      // Дістаємо наш payload та передаємо в сервіс
      const { jwtPayload } = req.res.locals;
      await authService.activate(jwtPayload);

      return res.sendStatus(201);
    } catch (e) {
      next(e);
    }
  }

  public async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<ITokenPair>> {
    try {
      // Створюємо токен пару, де req.res.locals.user передається з user.middlewares.ts isUserExist()
      const tokensPair = await authService.login(req.body, req.res.locals.user);

      return res.status(200).json({
        ...tokensPair,
      });
    } catch (e) {
      next(e);
    }
  }

  public async changePassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<ITokenPair>> {
    try {
      // Беремо id нашого акаунта
      const { _id: userId } = req.res.locals.tokenPayload as ITokenPayload;

      await authService.changePassword(req.body, userId);

      return res.sendStatus(201);
    } catch (e) {
      next(e);
    }
  }

  public async refresh(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<ITokenPair>> {
    try {
      const oldTokenPair = req.res.locals.oldTokenPair as ITokenPair;
      const tokenPayload = req.res.locals.tokenPayload as ITokenPayload;

      // Отримуємо нову пару токенів
      const tokensPair = await authService.refresh(oldTokenPair, tokenPayload);

      return res.status(200).json(tokensPair);
    } catch (e) {
      next(e);
    }
  }

  public async forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<void>> {
    try {
      // Дістаємо пропущеного з middleware нашого користувача
      const { user } = res.locals;
      await authService.forgotPassword(user._id, req.body.email);

      return res.sendStatus(200);
    } catch (e) {
      next(e);
    }
  }

  public async setForgotPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<void>> {
    try {
      const { password } = req.body;
      const { jwtPayload } = req.res.locals;

      await authService.setForgotPassword(
        password,
        jwtPayload._id,
        req.params.token
      );

      return res.sendStatus(200);
    } catch (e) {
      next(e);
    }
  }
}

export const authController = new AuthController();
