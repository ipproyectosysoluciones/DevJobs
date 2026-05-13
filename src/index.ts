import dotenv from "dotenv";

// Manejo de errores no捕获ados
process.on("unhandledRejection", (reason, _promise) => {
  console.error("❌ Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

// Cargar variables de entorno ANTES de cualquier otro import
dotenv.config({ path: ".env" });

import express, { Request, Response, NextFunction, type Express } from "express";
import exphbs from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import session from "express-session";
import flash from "connect-flash";
import createError from "http-errors";
import passport from "./config/passport.js";

// Importar configuración de la base de datos
import conectarDB from "./config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();

// biome-ignore lint/suspicious/noExplicitAny: express-handlebars v9 types issue
const hbs = exphbs as any;
app.engine(
  "handlebars",
  hbs.engine({
    defaultLayout: "layout",
    helpers: (await import("./helpers/handlebars.js")).default,
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
await conectarDB();

app.use((req: Request, res: Response, next: NextFunction): void => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  res.locals.mensajes = (req as any).flash();
  next();
});

app.use("/", (await import("./routes/index.js")).default());

app.use((_req: Request, _res: Response, next: NextFunction): void => {
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
const server = app.listen(PORT, () => console.log(`✅ Servidor en puerto ${PORT}`));

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Puerto ${PORT} en uso`);
  } else {
    console.error("❌ Error del servidor:", err);
  }
});

export default app;