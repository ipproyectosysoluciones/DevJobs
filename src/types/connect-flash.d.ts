/**
 * @fileoverview Declaración de tipos para connect-flash
 * @en Type declarations for connect-flash
 * @es Declaración de tipos para connect-flash
 */

/**
 * Módulo connect-flash
 * @en connect-flash module
 * @es Módulo connect-flash
 */
declare module "connect-flash" {
  import { RequestHandler } from "express";

  /**
   * Middleware de flash messages para Express
   * @en Flash messages middleware for Express
   * @es Middleware de flash messages para Express
   */
  function flash(): RequestHandler;

  /**
   * Interfaz del módulo para soportar import default
   * @en Module interface to support default import
   * @es Interfaz del módulo para soportar import default
   */
  namespace flash {
    // Intencionalmente vacío - el módulo no exporta más que el middleware
  }

  export = flash;
}
