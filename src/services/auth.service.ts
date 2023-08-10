import { AnyObject, Types } from "mongoose";

import { EActionTokenTypes, EEmailActions, EUserStatus } from "../enums";
import { ApiError } from "../errors";
import { Action, OldPassword, Token, User } from "../models";
import { ICredentials, ITokenPair, ITokenPayload, IUser } from "../types";
import { emailService } from "./email.service";
import { passwordService } from "./password.service";
import { tokenService } from "./token.service";

class AuthService {
  // Метод для реєстрації
  public async register(data: IUser): Promise<void> {
    try {
      // Хешуємо пароль
      const hashedPassword = await passwordService.hash(data.password);

      // Створюємо нашого користувача з валідними даними в нашу DB
      const user = await User.create({ ...data, password: hashedPassword });

      // Генеруємо пару токенів для нього
      const actionToken = tokenService.generateActionToken(
        { _id: user._id },
        EActionTokenTypes.Activate
      );

      await Promise.all([
        // Зберігаємо токен в базі
        Action.create({
          actionToken,
          tokenType: EActionTokenTypes.Activate,
          _userId: user._id,
        }),
        // Надсилаємо наш лист до користувача з активацією
        emailService.sendMail(data.email, EEmailActions.WELCOME, {
          name: data.name,
          actionToken,
        }),
      ]);
    } catch (e) {
      throw new ApiError(e.message, e.status);
    }
  }

  // Метод для активації
  public async activate(jwtPayload: ITokenPayload): Promise<void> {
    try {
      await Promise.all([
        // Оновлюємо в базі даних те, що користувач активував свій акаунт
        User.updateOne({ _id: jwtPayload._id }, { status: EUserStatus.Active }),
        // Видаляємо всі токени, які запрошував користувач
        Action.deleteMany({
          _userId: jwtPayload._id,
          tokenType: EActionTokenTypes.Activate,
        }),
      ]);
    } catch (e) {
      throw new ApiError(e.message, e.status);
    }
  }

  // Метод для логінації
  public async login(
    credentials: ICredentials, // Вхідні дані(Логін та пароль)
    user: IUser
  ): Promise<ITokenPair> {
    try {
      // Порівнюємо паролі
      const isMatched = await passwordService.compare(
        credentials.password,
        user.password
      );

      // Якщо паролі не збігаються
      if (!isMatched) {
        throw new ApiError("Invalid email or password", 401);
      }

      // Якщо все ОК, то ми створюємо пару токенів, в який передаємо корисне навантаження
      const tokenPair = await tokenService.generateTokenPair({
        _id: user.id,
        name: user.name,
      });

      // Створюємо в базі даних в моделі Token відповідний запис
      await Token.create({
        ...tokenPair,
        _userId: user.id, // Користувач який то все робив
      });

      return tokenPair;
    } catch (e) {
      throw new ApiError(e.message, e.status);
    }
  }

  public async refresh(
    oldTokensPair: ITokenPair,
    tokenPayload: ITokenPayload
  ): Promise<ITokenPair> {
    try {
      const tokensPair = await tokenService.generateTokenPair(tokenPayload);

      await Promise.all([
        Token.create({ _userId: tokenPayload._id, ...tokensPair }), // Створили новий запис в DB
        Token.deleteOne({ refreshToken: oldTokensPair.refreshToken }), // Видалили старі токени з DB
      ]);

      return tokensPair;
    } catch (e) {
      throw new ApiError(e.message, e.status);
    }
  }

  public async changePassword(
    dto: { newPassword: string; oldPassword: string },
    userId: string
  ): Promise<void> {
    try {
      // Отримуємо масив з OldPassword по userId та користувача
      const [oldPasswords, user]: [AnyObject[], IUser] = await Promise.all([
        OldPassword.find({ _userId: userId }).lean(),
        User.findById(userId).select("password"), // Шукаємо користувача відповідного
      ]);

      const passwords = [...oldPasswords, { password: user.password }];

      //
      await Promise.all(
        // Пробігаємося по всіх старих паролів і порівнюємо з новим який хочемо мати
        passwords.map(async ({ password: hash }) => {
          // Порівняння
          const isMatched = await passwordService.compare(
            dto.newPassword,
            hash
          );
          // Якщо ми ввели такий, який вже був
          if (isMatched) {
            throw new ApiError("Wrong old password", 400);
          }
        })
      );

      // Новий захешований пароль
      const newHash = await passwordService.hash(dto.newPassword);

      // Створюємо записи для декларації старих паролів та оновлюємо користувача новим паролем
      await Promise.all([
        OldPassword.create({ password: user.password, _userId: userId }),
        User.updateOne({ _id: userId }, { password: newHash }),
      ]);
    } catch (e) {
      throw new ApiError(e.message, e.status);
    }
  }

  public async forgotPassword(
    userId: Types.ObjectId,
    email: string
  ): Promise<void> {
    try {
      // Створюємо допоміжний токен для відновлення
      const actionToken = tokenService.generateActionToken(
        { _id: userId },
        EActionTokenTypes.Forgot
      );

      await Promise.all([
        // Створює запис в колекції
        await Action.create({
          actionToken,
          tokenType: EActionTokenTypes.Forgot,
          _userId: userId,
        }),

        // Надсилає email до користувача
        await emailService.sendMail(email, EEmailActions.FORGOT_PASSWORD, {
          actionToken,
        }),
      ]);
    } catch (e) {
      throw new ApiError(e.message, e.status);
    }
  }

  // Метод для перезапису пароля
  public async setForgotPassword(
    password: string,
    userId: Types.ObjectId,
    actionToken: string
  ): Promise<void> {
    try {
      // Хешуємо новий пароль
      const hashedPassword = await passwordService.hash(password);
      await Promise.all([
        // Оновлюємо новий пароль та видаляємо допоміжний токен з DB
        User.updateOne({ _id: userId }, { password: hashedPassword }),
        Action.deleteOne({ actionToken }),
      ]);
    } catch (e) {
      throw new ApiError(e.message, e.status);
    }
  }
}

export const authService = new AuthService();
