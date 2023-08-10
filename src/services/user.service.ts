import { UploadedFile } from "express-fileupload";

import { ApiError } from "../errors";
import { User } from "../models";
import { userRepository } from "../repositories";
import { IUser } from "../types";
import { s3Service } from "./s3.service";

export interface IQuery {
  page: string;
  limit: string;
  sortedBy: string;

  [key: string]: string;
}

export interface IPaginationResponse<T> {
  page: number;
  perPage: number;
  itemsCount: number;
  itemsFound: number;
  data: T[];
}

class UserService {
  // Метод для повернення всіх користувачів
  public async findAll(): Promise<IUser[]> {
    return await User.find(); // Звернення до бази даних
  }

  // Метод для повернення користувачів за допомогою пагінації
  public async findAllWithPagination(
    query: IQuery
  ): Promise<IPaginationResponse<IUser>> {
    try {
      const queryStr = JSON.stringify(query);
      const queryObj = JSON.parse(
        queryStr.replace(/\b(gte|lte|gt|lt)\b/, (match) => `$${match}`)
      );

      const {
        page = 1,
        limit = 10,
        sortedBy = "createdAt",
        ...searchObject
      } = queryObj;

      const skip = +limit * (+page - 1);

      const [users, usersTotalCount, usersSearchCount] = await Promise.all([
        User.find(searchObject).limit(+limit).skip(skip).sort(sortedBy), // Шукає відповідну сторінку та видає кількість
        User.count(), // Рахує всього
        User.count(searchObject), // Рахує знайдені
      ]);

      // Повертаємо об'єкт для Response на фронт
      return {
        page: +page,
        perPage: +limit,
        itemsCount: usersTotalCount,
        itemsFound: usersSearchCount,
        data: users,
      };
    } catch (e) {
      throw new ApiError(e.message, e.status);
    }
  }

  // Метод для створення нового користувача
  public async create(data: IUser): Promise<IUser> {
    return await userRepository.create(data); // Звернення до бази даних
  }

  // Метод для пошуку конкретного користувача
  public async findById(id: string): Promise<IUser> {
    return await this.getOneByIdOrThrow(id); // Приватний метод внизу для пошуку
  }

  // Метод для оновлення користувача
  public async updateById(
    userId: string,
    data: Partial<IUser>
  ): Promise<IUser> {
    // Перевіряємо чи наш користувач існує
    await this.getOneByIdOrThrow(userId);

    return await User.findOneAndUpdate(
      { _id: userId }, // Шукаємо
      { ...data }, // Передаємо поля, які хочемо оновити
      { returnDocument: "after" } // Нам буде повертатися вже оновлений користувач, а не старий, як по замовчуванню
    );
  }

  // Метод для видалення користувача
  public async deleteById(userId: string): Promise<void> {
    // Перевіряємо чи наш користувач існує
    await this.getOneByIdOrThrow(userId);

    await User.deleteOne({ _id: userId }); // Звернення до DB
  }

  // Метод для завантаження аватарки
  public async uploadAvatar(
    userId: string,
    avatar: UploadedFile
  ): Promise<IUser> {
    const user = await this.getOneByIdOrThrow(userId);

    if (user.avatar) {
      // Видаляємо з s3
      await s3Service.deleteFile(user.avatar);
    }
    const pathToFile = await s3Service.uploadFile(avatar, "user", userId);
    return await User.findByIdAndUpdate(
      userId,
      { $set: { avatar: pathToFile } },
      { new: true }
    );
  }

  // Метод для видалення аватарки
  public async deleteAvatar(userId: string): Promise<IUser> {
    const user = await this.getOneByIdOrThrow(userId);

    if (!user.avatar) {
      return user;
    }

    await s3Service.deleteFile(user.avatar);

    return await User.findByIdAndUpdate(
      userId,
      { $unset: { avatar: true } },
      { new: true }
    );
  }

  // Метод для повернення шуканого користувача або помилки про неіснування
  private async getOneByIdOrThrow(userId: string): Promise<IUser> {
    const user = await User.findById(userId); // Шукаємо, звернення до DB

    // Якщо не знайшли, то прокидаємо помилку
    if (!user) {
      throw new ApiError("User not found", 422);
    }
    return user;
  }
}

export const userService = new UserService();
