import express, { NextFunction, Request, Response } from "express";
import * as mongoose from "mongoose";

import { configs } from "./configs/config";
import { ApiError } from "./errors";
import { User } from "./models/User.model";
import { IUser } from "./types/user.types";
import { UserValidator } from "./validators";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CRUD - create, read, update, delete

app.get(
  "/users",
  async (req: Request, res: Response): Promise<Response<IUser[]>> => {
    try {
      const users = await User.find();
      return res.json(users);
    } catch (e) {
      console.log(e);
    }
  }
);

app.get("/users/:id", async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    return res.json(user);
  } catch (e) {
    console.log(e);
  }
});

app.post(
  "/users",
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<IUser>> => {
    try {
      const { error, value } = UserValidator.create.validate(req.body);
      if (error) {
        throw new ApiError(error.message, 400);
      }
      const createUser = await User.create(value);
      return res.status(201).json(createUser);
    } catch (e) {
      next(e);
    }
  }
);

app.put(
  "/users/:id",
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<IUser>> => {
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
);

app.delete("/users/:id", async (req, res): Promise<Response<void>> => {
  try {
    const { id } = req.params;

    await User.deleteOne({ _id: id });

    return res.sendStatus(200);
  } catch (e) {
    console.log(e);
  }
});

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  const status = error.status || 500;
  return res.status(status).json(error.message);
});

app.listen(configs.PORT, () => {
  mongoose.connect(configs.DB_URL);
  console.log(`Server has started on PORT ${configs.PORT}`);
});
