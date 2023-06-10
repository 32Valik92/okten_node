import { ApiError } from "../errors";
import { User } from "../models/User.model";
import { userRepository } from "../repositories/user.repository";
import { IUser } from "../types/user.types";

class UserService {
  public async findAll(): Promise<IUser[]> {
    try {
      return User.find().select("-password");
    } catch (e) {
      throw new ApiError(e.message, e.status);
    }
  }

  public async create(data: IUser): Promise<IUser> {
    return userRepository.create(data);
  }

  public async findById(id: string): Promise<IUser> {
    return User.findById(id);
  }
}

export const userService = new UserService();
