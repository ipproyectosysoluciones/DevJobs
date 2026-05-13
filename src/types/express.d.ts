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
      _id: string;
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

    /**
     * Función next de Express
     * @en Express next function
     * @es Función next de Express
     */
    type NextFunction = (err?: unknown) => void;

    /**
     * Response de Express (versión simplificada para rutas)
     * @en Express Response (simplified for routes)
     * @es Response de Express (versión simplificada para rutas)
     */
    interface Response {
      status(code: number): Response;
      json(body?: unknown): void;
      send(body?: unknown): Response;
    }
  }
}

export {};
