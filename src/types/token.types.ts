import { IUser } from "./user.types";

export interface ITokenPair {
  accessToken: string;
  refreshToken: string;
}

// Pick<IUser, "email" | "password"> — бере конкретні властивості з іншого інтерфейсу
export type ICredentials = Pick<IUser, "email" | "password">;

export type ITokenPayload = Pick<IUser, "name" | "_id">;
