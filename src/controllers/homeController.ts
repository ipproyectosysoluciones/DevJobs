import { Request, Response, NextFunction } from "express";

export const mostrarTrabajos = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const Vacante = (await import("../models/Vacantes.js")).default;
    const vacantes = await Vacante.find({}).lean();

    if (!vacantes) return next();

    res.render("home", {
      nombrePagina: "devJobs",
      tagline: "Encuentra y Pública Trabajos para Desarrolladores Web",
      barra: true,
      boton: true,
      vacantes,
    });
  } catch (error) {
    console.error("Error al mostrar trabajos:", error);
    next(error);
  }
};