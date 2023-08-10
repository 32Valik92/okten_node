import { Router } from "express";

import { userController } from "../controllers";
import {
  authMiddleware,
  commonMiddleware,
  fileMiddleware,
} from "../middlewares";
import { UserValidator } from "../validators";

const router = Router();

router.get("/", userController.findAll);

router.get(
  "/:userId",
  commonMiddleware.isIdValid("userId"), // Перевіряємо чи валідна наша id
  authMiddleware.checkAccessToken, // Дивимося чи токени робочі
  userController.findById // Шукаємо по id
);

router.put(
  "/:userId",
  commonMiddleware.isIdValid("userId"), // Перевіряємо чи валідна наша id
  commonMiddleware.isBodyValid(UserValidator.update), // Перевіряємо чи дані наші валідні
  authMiddleware.checkAccessToken, // Перевіряємо наші токени
  userController.updateById // Оновлюємо користувача
);

router.delete(
  "/:userId",
  commonMiddleware.isIdValid("userId"), // Перевіряємо чи валідна наша id
  authMiddleware.checkAccessToken, // Перевіряємо наші токени
  userController.deleteById // Видаляємо нашого користувача
);

router.post(
  "/:userId/avatar",
  authMiddleware.checkAccessToken, // Перевіряємо наші токени
  commonMiddleware.isIdValid("userId"), // Перевіряємо чи валідна наша id
  fileMiddleware.isAvatarValid, // Перевіряємо чи валідна наша avatar
  userController.uploadAvatar // Завантажуємо нашу картинку
);

router.delete(
  "/:userId/avatar",
  authMiddleware.checkAccessToken, // Перевіряємо наші токени
  commonMiddleware.isIdValid("userId"), // Перевіряємо чи валідна наша id
  userController.deleteAvatar // Видаляємо нашу картинку
);

router.post(
  "/:userId/video",
  authMiddleware.checkAccessToken, // Перевіряємо наші токени
  commonMiddleware.isIdValid("userId"), // Перевіряємо чи валідна наша id
  userController.uploadVideo // Завантажуємо наше відео
);

export const userRouter = router;
