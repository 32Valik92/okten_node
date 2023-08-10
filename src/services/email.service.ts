import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import * as path from "path";

import { configs } from "../configs";
import { allTemplates } from "../constants";
import { EEmailActions } from "../enums";

class EmailService {
  // Річ, яка займається відправленням emails
  private transporter;

  // Створюємо оцей транспортер для автоматизованого відправлення
  constructor() {
    // Вказуємо конфігураційні опції сервісу, який ми будемо використовувати
    this.transporter = nodemailer.createTransport({
      from: "No reply",
      service: "gmail",
      auth: {
        user: configs.NO_REPLY_EMAIL,
        pass: configs.NO_REPLY_PASSWORD,
      },
    });

    const hbsOptions = {
      viewEngine: {
        extname: ".hbs", // Говоримо, що будемо використовувати щце розширення
        defaultLayout: "main",
        // Шлях до теки з layouts
        layoutsDir: path.join(
          process.cwd(),
          "src",
          "email-templates",
          "layouts"
        ),
        // Шлях до теки з partials. Наші footer та header
        partialsDir: path.join(
          process.cwd(),
          "src",
          "email-templates",
          "partials"
        ),
      },
      viewPath: path.join(process.cwd(), "src", "email-templates", "views"),
      extName: ".hbs",
    };

    // Ми маємо подружити nodemailer та hbs між собою в середині express
    this.transporter.use("compile", hbs(hbsOptions));
  }

  public async sendMail(
    email: string,
    emailAction: EEmailActions,
    context: Record<string, string | number> = {} // пари, де ключ - це рядок (string), а значення може бути або рядком або числом
  ) {
    // Щоб не створювати для реєстрації та забуття пароля ми робимо динамічно та дестуктуризуємо
    const { templateName, subject } = allTemplates[emailAction];

    // Посилання на фронт, яке йде
    context.frontUrl = configs.FRONT_URL;

    const mailOptions = {
      to: email,
      subject,
      template: templateName,
      context: context,
    };

    return await this.transporter.sendMail(mailOptions);
  }
}

export const emailService = new EmailService();
