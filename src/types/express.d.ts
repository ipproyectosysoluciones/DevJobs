/**
 * @fileoverview Extensiones de tipos para Express
 * @fileoverview Express type extensions
 * @es Extensiones de tipos para Express
 * @en Express type extensions
 */

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
      _id: string; // Changed from Types.ObjectId to string for consistency with our AuthUser
      nombre: string;
      email: string;
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
  }
}

export {};