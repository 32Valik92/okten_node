import { model, Schema, Types } from "mongoose";

import { User } from "./User.model";

const oldPasswordSchema = new Schema(
  {
    password: {
      type: String,
      required: true,
    },
    _userId: {
      type: Types.ObjectId,
      required: true,
      ref: User, // Посилання на користувача який створив пару tokens
    },
  },
  {
    versionKey: false, // Це поле "__v", яке показує, скільки разів даний користувач був оновлений
    timestamps: true, // Буде показувати два додаткових поля про час створення та останнього оновлення
  }
);

// OldPassword - наша константа, яку ми будемо використовувати
// model('Назва нашої модельки в DB', oldPasswordSchema - наш шаблон, який ми описали вище)
export const OldPassword = model("oldPassword", oldPasswordSchema);
