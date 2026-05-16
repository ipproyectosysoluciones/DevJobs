/**
 * @fileoverview Controlador de vistas de auditoría
 * @fileoverview Audit log view controller
 * @module controllers/auditoriaController
 */

import type { Request, Response } from 'express';
import AuditLog from '../models/AuditLog.js';

const ITEMS_PER_PAGE = 20;

/**
 * Mostrar registro de auditoría
 * @route GET /admin/auditoria
 */
export async function mostrarAuditoria(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: { _id?: string } }).user?._id;

    if (!userId) {
      res.redirect('/iniciar-sesion');
      return;
    }

    const page = Math.max(1, parseInt(req.query.pagina as string) || 1);
    const accionFilter = req.query.accion as string;
    const usuarioFilter = req.query.usuario as string;

    // Construir filtro
    const filter: Record<string, unknown> = {};
    if (accionFilter) {
      filter.action = accionFilter;
    }
    if (usuarioFilter) {
      filter.$or = [
        { targetUserId: usuarioFilter },
        { performedBy: usuarioFilter },
      ];
    }

    const skip = (page - 1) * ITEMS_PER_PAGE;

    const logsQuery = AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(ITEMS_PER_PAGE);
    
    const logs = await logsQuery;
    const total = await AuditLog.countDocuments(filter);

    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    // Transformar datos para la vista
    const transformedLogs = logs.map(log => ({
      fecha: log.timestamp,
      usuarioId: log.targetUserId?.toString() || log.performedBy?.toString() || 'N/A',
      accion: log.action,
      detalles: {
        descripcion: log.description || 'Sin detalles',
        realizado_por: log.performedByName || log.performedBy?.toString() || 'Sistema',
        valor_anterior: log.previousValue || '-',
        valor_nuevo: log.newValue || '-',
      },
      ip: log.ipAddress || '-',
    }));

    res.render('auditoria', {
      nombrePagina: 'Auditoría | Audit Log',
      logs: transformedLogs,
      filtros: {
        accion: accionFilter || '',
        usuario: usuarioFilter || '',
      },
      pagination: {
        page,
        pages: totalPages,
        prev: page > 1 ? page - 1 : null,
        next: page < totalPages ? page + 1 : null,
      },
      mensajes: [],
      errores: [],
      cerrarSesion: true,
      nombre: (req as Request & { user?: { nombre?: string } }).user?.nombre,
      imagen: (req as Request & { user?: { imagen?: string } }).user?.imagen,
    });
  } catch (error) {
    console.error('Error al mostrar auditoría:', error);
    res.render('auditoria', {
      nombrePagina: 'Auditoría | Audit Log',
      logs: [],
      filtros: { accion: '', usuario: '' },
      pagination: { page: 1, pages: 0, prev: null, next: null },
      mensajes: [],
      errores: ['Error al cargar el registro de auditoría'],
      cerrarSesion: true,
      nombre: (req as Request & { user?: { nombre?: string } }).user?.nombre,
      imagen: (req as Request & { user?: { imagen?: string } }).user?.imagen,
    });
  }
}

export default {
  mostrarAuditoria,
};
