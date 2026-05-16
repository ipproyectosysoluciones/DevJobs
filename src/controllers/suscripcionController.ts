/**
 * @fileoverview Controlador de vistas de suscripción
 * @fileoverview Subscription view controller
 * @module controllers/suscripcionController
 */

import type { Request, Response } from 'express';
import Subscription from '../models/Subscription.js';

/**
 * Planes disponibles con precios y características
 */
const PLANES = [
  {
    name: 'free',
    precio: 0,
    features: [
      'Publicar hasta 3 vacantes',
      'Postular a vacantes',
      'Perfil básico',
      'Soporte por email',
    ],
  },
  {
    name: 'basic',
    precio: 9.99,
    features: [
      'Publicar hasta 20 vacantes',
      'Postular a vacantes ilimitadas',
      'Perfil destacado',
      'Estadísticas básicas',
      'Soporte prioritario',
      'Chat en vivo',
    ],
  },
  {
    name: 'premium',
    precio: 29.99,
    features: [
      'Publicar vacantes ilimitadas',
      'Postular a vacantes ilimitadas',
      'Perfil destacado con badge',
      'Estadísticas avanzadas',
      'Soporte 24/7',
      'Chat en vivo prioritario',
      'Alertas de candidatos',
      'API access',
    ],
  },
];

/**
 * Mostrar página de suscripción del usuario
 * @route GET /suscripcion
 */
export async function mostrarSuscripcion(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: { _id?: string } }).user?._id;

    if (!userId) {
      res.redirect('/iniciar-sesion');
      return;
    }

    // Buscar suscripción activa del usuario
    const subscriptionQuery = Subscription.findOne({
      userId,
      status: 'active',
    });
    const subscription = await subscriptionQuery.sort({ createdAt: -1 });

    res.render('mi-suscripcion', {
      nombrePagina: 'Mi Suscripción | My Subscription',
      subscription: subscription ? {
        plan: subscription.plan,
        status: subscription.status,
        startDate: subscription.startDate.toLocaleDateString('es-ES'),
        endDate: subscription.endDate?.toLocaleDateString('es-ES'),
      } : null,
      planes: PLANES,
      mensajes: req.flash?.('mensaje') || [],
      errores: req.flash?.('error') || [],
      cerrarSesion: true,
      nombre: (req as Request & { user?: { nombre?: string } }).user?.nombre,
      imagen: (req as Request & { user?: { imagen?: string } }).user?.imagen,
    });
  } catch (error) {
    console.error('Error al mostrar suscripción:', error);
    res.render('mi-suscripcion', {
      nombrePagina: 'Mi Suscripción | My Subscription',
      subscription: null,
      planes: PLANES,
      mensajes: [],
      errores: ['Error al cargar la información de suscripción'],
      cerrarSesion: true,
      nombre: (req as Request & { user?: { nombre?: string } }).user?.nombre,
      imagen: (req as Request & { user?: { imagen?: string } }).user?.imagen,
    });
  }
}

/**
 * Mostrar página de contratar plan
 * @route GET /suscripcion/contratar/:plan
 */
export async function contratarPlan(req: Request, res: Response): Promise<void> {
  try {
    const { plan } = req.params;
    const planInfo = PLANES.find(p => p.name === plan);

    if (!planInfo || plan === 'free') {
      req.flash?.('error', 'Plan no válido');
      res.redirect('/suscripcion');
      return;
    }

    const userId = (req as Request & { user?: { _id?: string } }).user?._id;

    if (!userId) {
      res.redirect('/iniciar-sesion');
      return;
    }

    res.render('contratar-plan', {
      nombrePagina: `Contratar ${planInfo.name} | Subscribe`,
      plan: planInfo,
      cerrarSesion: true,
      nombre: (req as Request & { user?: { nombre?: string } }).user?.nombre,
      imagen: (req as Request & { user?: { imagen?: string } }).user?.imagen,
      mensajes: [],
      errores: [],
    });
  } catch (error) {
    console.error('Error al mostrar plan:', error);
    res.redirect('/suscripcion');
  }
}

export default {
  mostrarSuscripcion,
  contratarPlan,
};
