import { Request, Response } from "express";
import crypto from "crypto";
import passport from "passport";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Passport = passport as any;

/**
 * Autenticar usuario con Passport Local
 */
export const autenticarUsuario = Passport.authenticate("local", {
  successRedirect: "/administracion",
  failureRedirect: "/iniciar-sesion",
  failureFlash: true,
  badRequestMessage: "Ambos campos son obligatorios",
});

/**
 * Revisar si el usuario está autenticado
 */
export const verificarUsuario = (req: Request, res: Response, next: () => void): void => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/iniciar-sesion");
};

/**
 * Mostrar panel de administración
 */
export const mostrarPanel = async (req: Request, res: Response): Promise<void> => {
  const Vacante = (await import("../models/Vacantes.js")).default;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vacantes = await Vacante.find({ autor: (req.user as any)?._id });

  res.render("administracion", {
    nombrePagina: "Panel de Administración",
    tagline: "Crea y Administra tus vacantes desde aquí",
    cerrarSesion: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nombre: (req.user as any)?.nombre,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    imagen: (req.user as any)?.imagen,
    vacantes,
  });
};

/**
 * Cerrar sesión del usuario
 */
export const cerrarSesion = (req: Request, res: Response): void => {
  req.logout(() => {
    req.flash("correcto", "Cerraste Sesión Correctamente");
    res.redirect("/iniciar-sesion");
  });
};

/**
 * Mostrar formulario para reestablecer password
 */
export const formReestablecerPassword = (req: Request, res: Response): void => {
  res.render("reestablecer-password", {
    nombrePagina: "Reestablece tu Password",
    tagline: "Si ya tienes una cuenta pero olvidaste tu password, coloca tu email",
  });
};

/**
 * Enviar token para reestablecer password
 */
export const enviarToken = async (req: Request, res: Response): Promise<void> => {
  const Usuario = (await import("../models/Usuarios.js")).default;
  try {
    const usuario = await Usuario.findOne({ email: req.body.email });

    if (!usuario) {
      req.flash("error", "No existe esa cuenta");
      return res.redirect("/iniciar-sesion");
    }

    usuario.token = crypto.randomBytes(20).toString("hex");
    usuario.expira = new Date(Date.now() + 3600000);

    await usuario.save();

    const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`;

    const { enviar } = await import("../handlers/email.js");
    await enviar({
      usuario,
      subject: "Password Reset",
      resetUrl,
      archivo: "reset",
    });

    req.flash("correcto", "Revisa tu email para las indicaciones");
    res.redirect("/iniciar-sesion");
  } catch (error) {
    console.error("Error al enviar token:", error);
    req.flash("error", "Error al procesar la solicitud");
    res.redirect("/reestablecer-password");
  }
};

/**
 * Mostrar formulario para nuevo password
 */
export const reestablecerPassword = async (req: Request, res: Response): Promise<void> => {
  const Usuario = (await import("../models/Usuarios.js")).default;
  try {
    const usuario = await Usuario.findOne({ token: req.params.token });

    if (!usuario) {
      req.flash("error", "El formulario ya no es válido, intenta de nuevo");
      return res.redirect("/reestablecer-password");
    }

    res.render("nuevo-password", {
      nombrePagina: "Nuevo Password",
    });
  } catch {
    req.flash("error", "Error al procesar la solicitud");
    res.redirect("/reestablecer-password");
  }
};

/**
 * Guardar nuevo password
 */
export const guardarPassword = async (req: Request, res: Response): Promise<void> => {
  const Usuario = (await import("../models/Usuarios.js")).default;
  try {
    const usuario = await Usuario.findOne({ token: req.params.token });

    if (!usuario) {
      req.flash("error", "El formulario ya no es válido, intenta de nuevo");
      return res.redirect("/reestablecer-password");
    }

    usuario.password = req.body.password;
    usuario.token = undefined;
    usuario.expira = undefined;

    await usuario.save();

    req.flash("correcto", "Password Modificado Correctamente");
    res.redirect("/iniciar-sesion");
  } catch (error) {
    console.error("Error al guardar password:", error);
    req.flash("error", "Error al actualizar el password");
    res.redirect("/reestablecer-password");
  }
};