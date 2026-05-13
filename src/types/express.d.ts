/**
 * @fileoverview Extensiones de tipos para Express
 * @fileoverview Express type extensions
 * @es Extensiones de tipos para Express
 * @en Express type extensions
 */

import type {
  NextFunction as ExpressNextFunction,
  Response as ExpressResponse,
} from 'express';

/**
 * Extensiones de tipos para Express
 * @en Express type extensions
 * @es Extensiones de tipos para Express
 */
declare global {
  namespace Express {
    /**
     * Usuario autenticado en la sesión
     * @en User authenticated in session
     * @es Usuario autenticado en la sesión
     */
    interface User {
      /** ID del usuario | User ID */
      _id: string;
      /** Nombre del usuario | User name */
      nombre: string;
      /** Correo electrónico | Email */
      email: string;
      /** URL de la imagen | Image URL */
      imagen?: string;
    }

    /**
     * Request con usuario autenticado
     * @en Request with authenticated user
     * @es Request con usuario autenticado
     */
    interface Request {
      user?: User;
      flash(): { [key: string]: string[] };
      flash(type: string): string[];
      flash(type: string, message: string | string[]): any;
    }

    /**
     * Alias de NextFunction para rutas
     * @en NextFunction alias for routes
     * @es Alias de NextFunction para rutas
     */
    type NextFunction = ExpressNextFunction;

    /**
     * Response de Express con tipado completo
     * @en Fully typed Express Response
     * @es Response de Express con tipado completo
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Response extends ExpressResponse {}
  }
}

export {};