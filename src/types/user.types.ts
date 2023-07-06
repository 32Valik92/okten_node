import { Document } from "mongoose";

export interface IUser extends Document {
  name?: string;
  age?: number;
  gender?: string;
  email: string;
  avatar?: string;
  password: string;
}
