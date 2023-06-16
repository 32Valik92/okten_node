import { EEmailActions } from "../enums/email.enum";
import { ApiError } from "../errors";
import { OldPassword } from "../models/OldPassword.model";
import { Token } from "../models/Token.model";
import { User } from "../models/User.model";
import { ICredentials, ITokenPair, ITokenPayload } from "../types/token.types";
import { IUser } from "../types/user.types";
import { emailService } from "./email.service";
import { passwordService } from "./password.service";
import { tokenService } from "./token.service";

class AuthService {
  public async register(data: IUser): Promise<void> {
    try {
      const hashedPassword = await passwordService.hash(data.password);

      await User.create({ ...data, password: hashedPassword });
      await emailService.sendMail(data.email, EEmailActions.WELCOME, {
        name: data.name,
      });
    } catch (e) {
      throw new ApiError(e.message, e.status);
    }
  }

  public async login(
    credentials: ICredentials,
    user: IUser
  ): Promise<ITokenPair> {
    try {
      const isMatched = await passwordService.compare(
        credentials.password,
        user.password
      );
      if (!isMatched) {
        throw new ApiError("Invalid email or password", 401);
      }
      const tokenPair = await tokenService.generateTokenPair({
        _id: user.id,
        name: user.name,
      });

      await Token.create({
        ...tokenPair,
        _userId: user.id,
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
        Token.create({ _userId: tokenPayload._id, ...tokensPair }),
        Token.deleteOne({ refreshToken: oldTokensPair.refreshToken }),
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
      const oldPasswords = await OldPassword.find({ _userId: userId });
      await Promise.all(
        oldPasswords.map(async ({ password: hash }) => {
          const isMatched = await passwordService.compare(
            dto.oldPassword,
            hash
          );
          if (isMatched) {
            throw new ApiError("Wrong old password", 400);
          }
        })
      );

      const user = await User.findById(userId).select("password");

      const isMatched = await passwordService.compare(
        dto.oldPassword,
        user.password
      );
      if (!isMatched) {
        throw new ApiError("Wrong old password", 400);
      }

      const newHash = await passwordService.hash(dto.newPassword);
      await Promise.all([
        OldPassword.create({ password: user.password, _userId: userId }),
        User.updateOne({ _id: userId }, { password: newHash }),
      ]);
    } catch (e) {
      throw new ApiError(e.message, e.status);
    }
  }
}

export const authService = new AuthService();
