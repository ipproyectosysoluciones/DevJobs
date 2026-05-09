import { Request, Response, NextFunction } from "express";
import multer, { MulterError } from "multer";
import shortid from "shortid";
import path from "path";
import { fileURLToPath } from "url";
import type { IUsuarioDocument } from "../models/Usuarios.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configuración de multer para uploads de imágenes de perfil
 * @en Multer configuration for profile image uploads
 */
const configuracionMulter = {
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
export const validarRegistro = (req: Request, res: Response, next: NextFunction): void => {
  // Sanitizar | Sanitize
  req.sanitizeBody("nombre").escape();
  req.sanitizeBody("email").escape();
  req.sanitizeBody("password").escape();
  req.sanitizeBody("confirmar").escape();

  // Validar | Validate
  req.checkBody("nombre", "El Nombre es Obligatorio | Name is Required").notEmpty();
  req.checkBody("email", "El email debe ser válido | Email must be valid").isEmail();
  req.checkBody("password", "El password no puede ir vacío | Password cannot be empty").notEmpty();
  req.checkBody("confirmar", "Confirmar password no puede ir vacío | Confirm password cannot be empty").notEmpty();
  req.checkBody("confirmar", "El password es diferente | Password is different").equals(req.body.password);

  const errores = req.validationErrors();

  if (errores) {
    req.flash(
      "error",
      errores.map((error) => error.msg)
    );
    res.render("crear-cuenta", {
      nombrePagina: "Crea tu cuenta en devJobs | Create your account on devJobs",
      tagline: "Comienza a publicar tus vacantes gratis, solo debes crear una cuenta",
      mensajes: req.flash(),
    });
    return;
  }

  // Si toda la validación es correcta | If all validation is correct
  next();
};

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
  const usuario = await Usuario.findById<IUsuarioDocument>(req.user?._id);

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
export const validarPerfil = (req: Request, res: Response, next: NextFunction): void => {
  // Sanitizar | Sanitize
  req.sanitizeBody("nombre").escape();
  req.sanitizeBody("email").escape();
  if (req.body.password) {
    req.sanitizeBody("password").escape();
  }

  // Validar | Validate
  req.checkBody("nombre", "El nombre no puede ir vacío | Name cannot be empty").notEmpty();
  req.checkBody("email", "El correo no puede ir vacío | Email cannot be empty").notEmpty();

  const errores = req.validationErrors();

  if (errores) {
    req.flash(
      "error",
      errores.map((error) => error.msg)
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
};