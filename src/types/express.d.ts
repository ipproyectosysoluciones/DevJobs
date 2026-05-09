import { Types } from "mongoose";

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
     */
    interface User {
      _id: Types.ObjectId;
      nombre: string;
      email: string;
      imagen?: string;
    }

    /**
     * Request con usuario autenticado
     * @en Request with authenticated user
     */
    interface Request {
      user?: User;
      flash?(type: string, message?: string): any;
    }
  }
}

export {};