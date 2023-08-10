import { model, Schema, Types } from "mongoose";

import { EActionTokenTypes } from "../enums";
import { User } from "./User.model";

// Ця колекція нам потрібна для того, щоб відновлювати пароль. Цей токен буде просто прокидувати інформацію
const actionSchema = new Schema({
  actionToken: {
    type: String,
    required: true,
  },
  tokenType: {
    type: String,
    required: true,
    enum: EActionTokenTypes,
  },
  _userId: {
    type: Types.ObjectId,
    required: true,
    ref: User, // Посилання на користувача який створив пару tokens
  },
});

// Action - наша константа, яку ми будемо використовувати
// model('Назва нашої модельки в DB', actionSchema - наш шаблон, який ми описали вище)
export const Action = model("action", actionSchema);
