import { Router } from "express";

import { authController } from "../controllers";
import { EActionTokenTypes } from "../enums";
import {
  authMiddleware,
  commonMiddleware,
  userMiddleware,
} from "../middlewares";
import { ICredentials, IUser } from "../types";
import { UserValidator } from "../validators";

const router = Router();

router.post(
  "/register",
  commonMiddleware.isBodyValid(UserValidator.create), // Перевіряємо чи дані наші валідні
  userMiddleware.findAndThrow("email"), // Перевіряємо чи email не зайнятий
  authController.register // Реєструємося
);

router.post(
  "/register/:token",
  authMiddleware.checkActionToken(EActionTokenTypes.Activate),
  authController.activate
);

router.post(
  "/login",
  commonMiddleware.isBodyValid(UserValidator.login), // Перевіряємо на валідність дані
  userMiddleware.isUserExist<ICredentials>("email"), // Перевіряємо чи існує користувач з нашим логіном
  authController.login // Заходимо
);

router.post(
  "/changePassword",
  commonMiddleware.isBodyValid(UserValidator.changePassword), // Валідність наших паролів введених
  authMiddleware.checkAccessToken, // Перевірка чи токен робочий
  authController.changePassword // Зміна пароля
);

router.post(
  "/refresh",
  authMiddleware.checkRefreshToken, // Перевірка чи токен робочий
  authController.refresh // Отримуємо нову вару через refresh
);

router.post(
  "/forgot",
  commonMiddleware.isBodyValid(UserValidator.forgotPassword), // Перевіряє чи email проходить валідацію
  userMiddleware.isUserExist<IUser>("email"), // Чи існує через нашу пошту
  authController.forgotPassword // Відновлюємо пароль
);

router.put(
  "/forgot/:token",
  commonMiddleware.isBodyValid(UserValidator.setForgotPassword), // Перевіряє чи пароль проходить валідацію
  authMiddleware.checkActionToken(EActionTokenTypes.Forgot), // Перевірка чи токен робочий
  authController.setForgotPassword // Перезаписуємо пароль
);

export const authRouter = router;
