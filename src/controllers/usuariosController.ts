import { Request, Response, NextFunction } from "express";
import multer, { MulterError } from "multer";
import shortid from "shortid";
import path from "path";
import { fileURLToPath } from "url";
import { body, validationResult } from "express-validator";
import type { IUsuarioDocument } from "../models/Usuarios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configuración de multer para uploads de imágenes de perfil
 * @en Multer configuration for profile image uploads
 */
const configuracionMulter: multer.Options = {
  limits: { fileSize: 100000 },
  storage: multer.diskStorage({
    destination: (_req, _file, cb): void => {
      cb(null, path.join(__dirname, "../../public/uploads/perfiles"));
    },
    filename: (_req, file, cb): void => {
      const extension = file.mimetype.split("/")[1];
      cb(null, `${shortid.generate()}.${extension}`);
    },
  }),
  fileFilter(_req, file, cb): void {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb(new Error("Formato No Válido | Invalid Format"));
    }
  },
};

const upload = multer(configuracionMulter).single("imagen");

/**
 * Middleware para subir imagen de perfil
 * @en Middleware to upload profile image
 */
export const subirImagen = (req: Request, res: Response, next: NextFunction): void => {
  upload(req, res, function (error) {
    if (error) {
      if (error instanceof MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          req.flash("error", "El archivo es muy grande: Máximo 100kb | File too large: Max 100kb");
        } else {
          req.flash("error", error.message);
        }
      } else {
        req.flash("error", error.message);
      }
      res.redirect("/administracion");
      return;
    }
    next();
  });
};

/**
 * Mostrar formulario para crear cuenta
 * @en Show form to create account
 */
export const formCrearCuenta = (req: Request, res: Response): void => {
  res.render("crear-cuenta", {
    nombrePagina: "Crea tu cuenta en devJobs | Create your account on devJobs",
    tagline:
      "Comienza a publicar tus vacantes gratis, solo debes crear una cuenta | Start posting your vacancies for free, just create an account",
  });
};

/**
 * Validar datos de registro
 * @en Validate registration data
 */
export const validarRegistro = [
  // Sanitizar y validar | Sanitize and validate
  body("nombre").trim().escape().notEmpty().withMessage("El Nombre es Obligatorio | Name is Required"),
  body("email").trim().escape().isEmail().withMessage("El email debe ser válido | Email must be valid"),
  body("password").notEmpty().withMessage("El password no puede ir vacío | Password cannot be empty"),
  body("confirmar")
    .notEmpty().withMessage("Confirmar password no puede ir vacío | Confirm password cannot be empty")
    .custom((value, { req }) => value === req?.body.password)
    .withMessage("El password es diferente | Password is different"),

  // Handler de errores | Error handler
  (req: Request, res: Response, next: NextFunction): void => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
      req.flash(
        "error",
        errores.array().map((error) => error.msg)
      );
      res.render("crear-cuenta", {
        nombrePagina: "Crea tu cuenta en devJobs | Create your account on devJobs",
        tagline: "Comienza a publicar tus vacantes gratis, solo debes crear una cuenta",
        mensajes: req.flash(),
      });
      return;
    }

    next();
  },
];

/**
 * Crear nuevo usuario
 * @en Create new user
 */
export const crearUsuario = async (req: Request, res: Response): Promise<void> => {
  const Usuario = (await import("../models/Usuarios.js")).default;
  const usuario = new Usuario(req.body);
  try {
    await usuario.save();
    res.redirect("/iniciar-sesion");
  } catch (error) {
    req.flash("error", String(error));
    res.redirect("/crear-cuenta");
  }
};

/**
 * Mostrar formulario para iniciar sesión
 * @en Show form to sign in
 */
export const formIniciarSesion = (req: Request, res: Response): void => {
  res.render("iniciar-sesion", {
    nombrePagina: "Iniciar Sesión devJobs | Sign In to devJobs",
  });
};

/**
 * Mostrar formulario para editar perfil
 * @en Show form to edit profile
 */
export const formEditarPerfil = (req: Request, res: Response): void => {
  res.render("editar-perfil", {
    nombrePagina: "Edita tu perfil en devJobs | Edit your profile on devJobs",
    usuario: req.user,
    cerrarSesion: true,
    nombre: req.user?.nombre,
    imagen: req.user?.imagen,
  });
};

/**
 * Guardar cambios del perfil editado
 * @en Save edited profile changes
 */
export const editarPerfil = async (req: Request, res: Response): Promise<void> => {
  const Usuario = (await import("../models/Usuarios.js")).default;
  const usuario = await Usuario.findById(req.user?._id);

  if (usuario) {
    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;
    if (req.body.password) {
      usuario.password = req.body.password;
    }

    if (req.file) {
      usuario.imagen = (req.file as Express.Multer.File).filename;
    }

    await usuario.save();

    req.flash("correcto", "Cambios Guardados Correctamente | Changes Saved Successfully");
  }
  res.redirect("/administracion");
};

/**
 * Validar datos del perfil
 * @en Validate profile data
 */
export const validarPerfil = [
  // Sanitizar y validar | Sanitize and validate
  body("nombre").trim().escape().notEmpty().withMessage("El nombre no puede ir vacío | Name cannot be empty"),
  body("email").trim().escape().notEmpty().withMessage("El correo no puede ir vacío | Email cannot be empty"),
  body("password").optional().trim().escape(),

  // Handler de errores | Error handler
  (req: Request, res: Response, next: NextFunction): void => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
      req.flash(
        "error",
        errores.array().map((error) => error.msg)
      );
      res.render("editar-perfil", {
        nombrePagina: "Edita tu perfil en devJobs | Edit your profile on devJobs",
        usuario: req.user,
        cerrarSesion: true,
        nombre: req.user?.nombre,
        imagen: req.user?.imagen,
        mensajes: req.flash(),
      });
      return;
    }
    next();
  },
];