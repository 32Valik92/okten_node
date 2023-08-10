import { NextFunction, Request, Response } from "express";
import { ObjectSchema } from "joi";
import { isObjectIdOrHexString } from "mongoose";

import { ApiError } from "../errors";

class CommonMiddleware {
  // Метод для перевірки на валідність id
  // Ми робимо ф-цію у ф-ції, щоб прокидувати нашу id і не писати для перевірки id машинок чи користувачів і т.д.
  public isIdValid(field: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const id = req.params[field];

        // isObjectIdOrHexString - mongoose ф-ція, для перевірки id
        if (!isObjectIdOrHexString(id)) {
          throw new ApiError(`Id ${field} not valid`, 400);
        }

        next();
      } catch (e) {
        next(e);
      }
    };
  }

  // Метод для перевірки на валідність переданих даних
  // ObjectSchema треба, щоб validator мав метод валідації .validate
  public isBodyValid(validator: ObjectSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        // Використовується метод validate об'єкта validator, який призначений для перевірки даних на валідність.
        // Його призначенням є зв'язування об'єкта req.body зі схемою validator. Після перевірки метод validate повертає
        // об'єкт з властивостями error та value.
        const { error, value } = validator.validate(req.body);
        if (error) {
          throw new ApiError(error.message, 400);
        }

        // Якщо валідація успішна і немає помилок, ми замінюємо тіло запиту req.body на об'єкт value
        req.body = value;
        next();
      } catch (e) {
        next(e);
      }
    };
  }
}

export const commonMiddleware = new CommonMiddleware();
