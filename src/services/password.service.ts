import bcrypt from "bcrypt";

import { configs } from "../configs";

class PasswordService {
  // Метод хешування пароля
  public async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, +configs.SECRET_SALT);
  }

  // Метод для порівняння паролів
  public async compare(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}

export const passwordService = new PasswordService();
