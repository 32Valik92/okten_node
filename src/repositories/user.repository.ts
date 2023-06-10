import { User } from "../models/User.model";
import { IUser } from "../types/user.types";

class UserRepository {
  public async create(data: IUser): Promise<IUser> {
    return User.create(data);
  }
}

export const userRepository = new UserRepository();
