/**
 * @fileoverview Middleware de Verificación de Suscripción
 * @fileoverview Subscription Verification Middleware
 * @module middleware/verificarSuscripcion
 */

import type { Request, Response, NextFunction } from 'express';
import Subscription from '../models/Subscription.js';

/**
 * Plan requerido | Required plan
 */
type RequiredPlan = 'free' | 'basic' | 'premium';

/**
 * Jerarquía de planes | Plan hierarchy
 */
const PLAN_HIERARCHY: Record<RequiredPlan, number> = {
  free: 0,
  basic: 1,
  premium: 2,
};

/**
 * Verificar nivel de suscripción
 * @description Middleware para verificar que el usuario tenga el plan requerido
 * @en Middleware to verify user has required subscription plan
 * @param {RequiredPlan} requiredPlan - Plan mínimo requerido
 */
export function verificarSuscripcion(requiredPlan: RequiredPlan) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as Request & { user?: { _id?: string } }).user?._id;
      
      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Usuario no autenticado'
        });
        return;
      }

      const subscription = await Subscription.findOne({
        userId,
        status: 'active'
      }).sort({ createdAt: -1 });

      // Si no tiene suscripción activa, asume plan free
      const userPlan = subscription?.plan || 'free';
      
      const userPlanLevel = PLAN_HIERARCHY[userPlan] || 0;
      const requiredPlanLevel = PLAN_HIERARCHY[requiredPlan];

      if (userPlanLevel < requiredPlanLevel) {
        res.status(403).json({
          error: 'Insufficient subscription',
          message: `Se requiere plan ${requiredPlan} o superior`,
          currentPlan: userPlan,
          requiredPlan
        });
        return;
      }

      // Adjuntar info de suscripción al request para uso posterior
      (req as Request & { subscription?: { plan: string; status: string } }).subscription = {
        plan: userPlan,
        status: subscription?.status || 'inactive'
      };

      next();
    } catch (error) {
      console.error('Error verifying subscription:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Error al verificar suscripción'
      });
    }
  };
}

/**
 * Verificar si es usuario premium
 * @description Middleware específico para contenido premium
 * @en Middleware for premium content access
 */
export function soloPremium() {
  return verificarSuscripcion('premium');
}

/**
 * Verificar si tiene plan básico o superior
 * @description Middleware para contenido básico
 * @en Middleware for basic content
 */
export function soloBasico() {
  return verificarSuscripcion('basic');
}

export default {
  verificarSuscripcion,
  soloPremium,
  soloBasico,
};