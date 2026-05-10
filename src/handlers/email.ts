import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import { fileURLToPath } from "url";
import path from "path";
import emailConfig from "../config/email";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface EmailOptions {
  usuario: { email: string };
  subject: string;
  resetUrl?: string;
  archivo: string;
}

const transport = nodemailer.createTransport({
  host: emailConfig.host as string,
  port: Number(emailConfig.port),
  auth: {
    user: emailConfig.auth.user,
    pass: emailConfig.auth.pass,
  },
} as any);

const handlebarOptions = {
  viewEngine: {
    extName: ".handlebars",
    defaultLayout: false,
    partialsDir: path.resolve(__dirname, "../views/emails"),
    layoutsDir: path.resolve(__dirname, "../views/emails"),
  },
  viewPath: path.resolve(__dirname, "../views/emails"),
  extName: ".handlebars",
};

// @ts-expect-error - nodemailer-express-handlebars types mismatch
transport.use("compile", hbs(handlebarOptions));

export const enviar = async (opciones: EmailOptions): Promise<void> => {
  const opcionesEmail = {
    from: "devJobs <noreply@devjobs.com>",
    to: opciones.usuario.email,
    subject: opciones.subject,
    template: opciones.archivo,
    context: { resetUrl: opciones.resetUrl },
  };

  try {
    await transport.sendMail(opcionesEmail as any);
  } catch (error) {
    console.error("Error al enviar email:", error);
    throw new Error("Error al enviar el email");
  }
};

export default { enviar };