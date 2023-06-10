import { NextFunction, Request, Response } from "express";

import { ApiError } from "../errors";
import { User } from "../models/User.model";
import { userService } from "../services/user.service";
import { IUser } from "../types/user.types";
import { UserValidator } from "../validators";

class UserController {
  public async findAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<IUser[]>> {
    try {
      const users = await userService.findAll();

      return res.json(users);
    } catch (e) {
      next(e);
    }
  }

  public async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<IUser>> {
    try {
      const createUser = await userService.create(req.res.locals as IUser);
      return res.status(201).json(createUser);
    } catch (e) {
      next(e);
    }
  }

  public async findById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<IUser>> {
    try {
      const user = await userService.findById(req.params.id);
      return res.json(user);
    } catch (e) {
      next(e);
    }
  }

  public async updateById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<IUser>> {
    try {
      const { error, value } = UserValidator.update.validate(req.body);
      if (error) {
        throw new ApiError(error.message, 400);
      }
      const { id } = req.params;

      const updateUser = await User.findOneAndUpdate(
        { _id: id },
        { ...value },
        { returnDocument: "after" }
      );

      return res.status(200).json(updateUser);
    } catch (e) {
      next(e);
    }
  }

  public async deleteById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<void>> {
    try {
      const { id } = req.params;
      await User.deleteOne({ _id: id });

      return res.sendStatus(200);
    } catch (e) {
      next(e);
    }
  }
}

export const userController = new UserController();
