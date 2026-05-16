/**
 * @fileoverview Controlador de vistas de analíticas
 * @fileoverview Analytics view controller
 * @module controllers/analiticasController
 */

import type { Request, Response } from 'express';
import Vacante from '../models/Vacantes.js';
import Usuario from '../models/Usuarios.js';

/**
 * Mostrar panel de analíticas
 * @route GET /analiticas
 */
export async function mostrarAnaliticas(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: { _id?: string } }).user?._id;

    if (!userId) {
      res.redirect('/iniciar-sesion');
      return;
    }

    // Obtener métricas
    const totalVacantes = await Vacante.countDocuments();
    const totalUsuarios = await Usuario.countDocuments();
    
    // Obtener vacantes recientes para el top
    const vacantesQuery = Vacante.find().sort({ createdAt: -1 }).limit(10);
    const vacantesRecientes = await vacantesQuery;

    const topVacantes = vacantesRecientes.map(v => ({
      titulo: v.titulo,
      empresa: v.empresa,
      url: v.url,
      visitas: 'N/A',
      postulaciones: v.candidatos?.length || 0,
    }));

    const totalPostulaciones = vacantesRecientes.reduce(
      (sum, v) => sum + (v.candidatos?.length || 0), 
      0
    );

    res.render('analiticas', {
      nombrePagina: 'Analíticas | Analytics',
      metrics: {
        totalVacantes,
        totalPostulaciones,
        totalUsuarios,
        visitasHoy: vacantesRecientes.length,
      },
      topVacantes,
      events: vacantesRecientes.slice(0, 5).map(v => ({
        tipo: 'Vacante creada',
        usuario: v.autor || 'Sistema',
        fecha: new Date(),
      })),
      mensajes: [],
      errores: [],
      cerrarSesion: true,
      nombre: (req as Request & { user?: { nombre?: string } }).user?.nombre,
      imagen: (req as Request & { user?: { imagen?: string } }).user?.imagen,
    });
  } catch (error) {
    console.error('Error al mostrar analíticas:', error);
    res.render('analiticas', {
      nombrePagina: 'Analíticas | Analytics',
      metrics: {
        totalVacantes: 0,
        totalPostulaciones: 0,
        totalUsuarios: 0,
        visitasHoy: 0,
      },
      topVacantes: [],
      events: [],
      mensajes: [],
      errores: ['Error al cargar analíticas'],
      cerrarSesion: true,
      nombre: (req as Request & { user?: { nombre?: string } }).user?.nombre,
      imagen: (req as Request & { user?: { imagen?: string } }).user?.imagen,
    });
  }
}

export default {
  mostrarAnaliticas,
};
