/**
 * @fileoverview Utilidades para extraer parámetros de query de forma segura
 * @fileoverview Utilities for safely extracting query parameters
 * @module utils/queryParams
 */

import type { Request } from 'express';

/**
 * Extrae un string de un parámetro de query
 * @description Safely extracts a string value from a query parameter
 * @param {Request} req - Express request
 * @param {string} key - Query parameter key
 * @param {string} [defaultValue=''] - Optional default value
 * @returns {string} The extracted string value
 *
 * @example
 * ```ts
 * const name = queryString(req, 'name');
 * const page = queryString(req, 'page', '1');
 * ```
 */
export function queryString(req: Request, key: string, defaultValue: string = ''): string {
  const val = req.query[key];
  if (val === undefined || val === null) return defaultValue;
  if (Array.isArray(val)) return (val[0] as string | undefined) ?? defaultValue;
  return val as string;
}

/**
 * Extrae un array de strings de un parámetro de query
 * @description Safely extracts a string array from a query parameter
 * @param {Request} req - Express request
 * @param {string} key - Query parameter key
 * @returns {string[]} The extracted string array
 *
 * @example
 * ```ts
 * const ids = queryArray(req, 'ids');
 * ```
 */
export function queryArray(req: Request, key: string): string[] {
  const val = req.query[key];
  if (val === undefined || val === null) return [];
  if (Array.isArray(val)) return val as string[];
  return [val as string];
}

/**
 * Extrae un string opcional de un parámetro de query
 * @description Safely extracts an optional string from a query parameter
 * @param {Request} req - Express request
 * @param {string} key - Query parameter key
 * @returns {string | undefined} The extracted value or undefined
 *
 * @example
 * ```ts
 * const filter = queryOptional(req, 'filter');
 * ```
 */
export function queryOptional(req: Request, key: string): string | undefined {
  const val = req.query[key];
  if (val === undefined || val === null) return undefined;
  if (Array.isArray(val)) return val[0] as string | undefined;
  return val as string;
}
