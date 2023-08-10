import { CronJob } from "cron";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { Token } from "../models";

dayjs.extend(utc);

const tokensRemover = async () => {
  // .utc() - дає час нам в нульовій зоні
  // .subtract() - віднімаємо від поточного скількись часу для видалення старих
  const previousMonth = dayjs().utc().subtract(30, "days");

  await Token.deleteMany({
    createdAt: { $lte: previousMonth },
  });
};

export const removeOldTokens = new CronJob("10 * * * * * ", tokensRemover);
