import { Document } from "mongoose";

// Document - це той тип, який вже в собі має _id та __v
export interface IUser extends Document {
  name?: string;
  age?: number;
  gender?: string;
  email: string;
  avatar?: string;
  password: string;
}
