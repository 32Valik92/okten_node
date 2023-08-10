import { removeOldPasswords } from "./remove-old-password";
import { removeOldTokens } from "./remove-old-tokens.cron";

// Запуск наших cron
export const cronRunner = () => {
  removeOldTokens.start();
  removeOldPasswords.start();
};
