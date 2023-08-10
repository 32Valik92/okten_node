import { model, Schema } from "mongoose";

import { EGenders, EUserStatus } from "../enums";

const userSchema = new Schema(
  {
    name: {
      type: String,
    },
    age: {
      type: Number,
      min: [1, "Minimum value for age is 1"],
      max: [199, "Maximum value for age is 199"],
    },
    gender: {
      type: String,
      enum: EGenders,
    },
    status: {
      type: String,
      default: EUserStatus.Inactive,
      enum: EUserStatus,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    avatar: {
      type: String,
      required: false,
    },
  },
  {
    versionKey: false, // Це поле "__v", яке показує, скільки разів даний користувач був оновлений
    timestamps: true, // Буде показувати два додаткових поля про час створення та останнього оновлення
  }
);

// User - наша константа, яку ми будемо використовувати
// model('Назва нашої модельки в DB', userSchema - наш шаблон, який ми описали вище)
export const User = model("user", userSchema);
