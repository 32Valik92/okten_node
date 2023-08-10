import { NextFunction, Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import multer from "multer";
import { createReadStream } from "streamifier";

import { ApiError } from "../errors";
import { userMapper } from "../mapers";
import {
  IPaginationResponse,
  IQuery,
  s3Service,
  userService,
} from "../services";
import { IUser } from "../types";

class UserController {
  // Метод для повернення всіх користувачів
  public async findAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<IPaginationResponse<IUser>>> {
    try {
      // Беремо наших користувачів
      const users = await userService.findAllWithPagination(
        req.query as unknown as IQuery
      );

      // Повертаємо наш об'єкт
      return res.json(users);
    } catch (e) {
      next(e);
    }
  }

  // Метод для знаходження по _id
  public async findById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<IUser>> {
    try {
      const { userId } = req.params; // Дістаємо з параметрів _id
      const user = await userService.findById(userId); // Шукаємо по _id
      const response = userMapper.toResponse(user); // Створюємо об'єкт для response
      return res.json(response);
    } catch (e) {
      next(e);
    }
  }

  // Метод для оновлення по _id
  public async updateById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<IUser>> {
    try {
      const { userId } = req.params; // Дістаємо з параметрів _id
      const updateUser = await userService.updateById(userId, req.body); // Оновлюємо
      const response = userMapper.toResponse(updateUser); // Створюємо об'єкт для response

      return res.status(200).json(response);
    } catch (e) {
      next(e);
    }
  }

  // Метод для видалення по _id
  public async deleteById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<void>> {
    try {
      const { userId } = req.params; // Дістаємо з параметрів _id
      await userService.deleteById(userId); // Видаляємо

      return res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  }

  public async uploadAvatar(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<void>> {
    try {
      const { userId } = req.params;
      const avatar = req.files.avatar as UploadedFile;

      const user = await userService.uploadAvatar(userId, avatar);

      const response = userMapper.toResponse(user);
      return res.status(201).json(response);
    } catch (e) {
      next(e);
    }
  }

  public async deleteAvatar(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<void>> {
    try {
      const { userId } = req.params;

      const user = await userService.deleteAvatar(userId);

      const response = userMapper.toResponse(user);

      return res.status(201).json(response);
    } catch (e) {
      next(e);
    }
  }

  public async uploadVideo(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const { userId } = req.params;
      const upload = multer().single("");

      upload(req, res, async (err) => {
        if (err) {
          throw new ApiError("Download error", 500);
        }

        const video = req.files.video as UploadedFile;

        const stream = createReadStream(video.data);

        const pathToVideo = await s3Service.uploadStream(
          stream,
          "user",
          userId,
          video
        );
        return res.status(201).json(pathToVideo);
      });
    } catch (e) {
      next(e);
    }
  }
}

export const userController = new UserController();
