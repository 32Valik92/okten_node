import { CronJob } from "cron";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { OldPassword } from "../models";

dayjs.extend(utc);

const oldPasswordsRemover = async () => {
  // .utc() - дає час нам в нульовій зоні
  // .subtract() - віднімаємо від поточного скількись часу для видалення старих
  const previousYear = dayjs().utc().subtract(1, "year");

  await OldPassword.deleteMany({
    createdAt: { $lte: previousYear },
  });
};

export const removeOldPasswords = new CronJob(
  "0 0 0 * * * ",
  oldPasswordsRemover
);
