import dotenv from "dotenv";
import mongoose from "mongoose";
import express, { Request, Response, NextFunction } from "express";
import exphbs from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import session from "express-session";
import bodyParser from "body-parser";
import expressValidator from "express-validator";
import flash from "connect-flash";
import createError from "http-errors";
import passport from "./config/passport.js";

dotenv.config({ path: ".env" });
import "./config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.engine("handlebars", exphbs({
  defaultLayout: "layout",
  helpers: (await import("./helpers/handlebars.js")).default,
}));
app.set("view engine", "handlebars");

app.use(express.static(path.join(__dirname, "public")));
app.use(expressValidator());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use(session({
  secret: process.env.SECRETO ?? "devjobs-secret",
  resave: false,
  saveUninitialized: false,
} as any));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req: Request, res: Response, next: NextFunction): void => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  res.locals.mensajes = (req as any).flash();
  next();
});

app.use("/", (await import("./routes/index.js")).default());

app.use((req: Request, _res: Response, next: NextFunction): void => {
  next(createError(404, "No Encontrado"));
});

app.use((error: { message: string; status?: number }, _req: Request, res: Response): void => {
  const message = error.message;
  const status = error.status || 500;
  res.locals.mensaje = message;
  res.locals.status = status;
  res.status(status).render("error");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));

export default app;