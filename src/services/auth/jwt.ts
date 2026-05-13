/**
 * @fileoverview Servicio de JWT para autenticación
 * @fileoverview JWT service for authentication
 * @module services/auth/jwt
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import type { JWTConfig, TokenPayload, TokenValidationResult } from './types.js';

/**
 * Clase para manejar operaciones con JWT
 * @class JWTService
 * @description Gestiona la creación y validación de tokens JWT
 */
class JWTService {
  private config: JWTConfig;
  private secret: string;

  /**
   * Constructor del servicio JWT
   * @constructor
   * @param {JWTConfig} config - Configuración del JWT
   */
  constructor(config: JWTConfig) {
    this.config = config;
    // En producción, usar variables de entorno
    this.secret = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
  }

  /**
   * Genera un token JWT
   * @method generateToken
   * @description Crea un nuevo token JWT con los datos del usuario
   * @param {TokenPayload} payload - Datos a incluir en el token
   * @returns {string} Token JWT generado
   * 
   * @example
   * const token = jwtService.generateToken({
   *   userId: '123',
   *   email: 'user@example.com',
   *   role: 'job_seeker',
   *   permissions: ['jobs:read']
   * });
   */
  generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
    const options: jwt.SignOptions = {
      algorithm: this.config.algorithm,
      expiresIn: this.config.expiresIn as jwt.SignOptions['expiresIn'],
      issuer: this.config.issuer,
      audience: this.config.audience,
    };

    return jwt.sign(payload, this.secret, options);
  }

  /**
   * Valida un token JWT
   * @method validateToken
   * @description Verifica la validez de un token JWT
   * @param {string} token - Token a validar
   * @returns {TokenValidationResult} Resultado de la validación
   * 
   * @example
   * const result = jwtService.validateToken(token);
   * if (result.valid) {
   *   console.log('Usuario:', result.payload?.userId);
   * }
   */
  validateToken(token: string): TokenValidationResult {
    try {
      const decoded = jwt.verify(token, this.secret, {
        algorithms: [this.config.algorithm],
        issuer: this.config.issuer,
        audience: this.config.audience,
      }) as TokenPayload;

      return {
        valid: true,
        payload: decoded,
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Token inválido',
      };
    }
  }

  /**
   * Decodifica un token sin verificar la firma
   * @method decodeToken
   * @description Decodifica el payload de un token sin verificar
   * @param {string} token - Token a decodificar
   * @returns {TokenPayload | null} Payload decodificado o null
   */
  decodeToken(token: string): TokenPayload | null {
    const decoded = jwt.decode(token);
    return decoded as TokenPayload | null;
  }

  /**
   * Refresca un token JWT
   * @method refreshToken
   * @description Genera un nuevo token a partir de uno existente
   * @param {string} token - Token actual
   * @returns {TokenValidationResult} Nuevo token o error
   */
  refreshToken(token: string): TokenValidationResult {
    const validation = this.validateToken(token);
    
    if (!validation.valid || !validation.payload) {
      return {
        valid: false,
        error: 'Token inválido para refresh',
      };
    }

    const { iat, exp, ...payload } = validation.payload;
    
    // Verificar si el token está próximo a expirar (menos de 1 hora)
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = (validation.payload.exp || 0) - now;
    
    if (timeLeft > 3600) {
      return {
        valid: false,
        error: 'Token aún no necesita refresh',
      };
    }

    return {
      valid: true,
      payload: {
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400, // 24 horas
      } as TokenPayload,
    };
  }
}

/**
 * Configuración default del JWT
 * @constant DEFAULT_JWT_CONFIG
 */
const DEFAULT_JWT_CONFIG: JWTConfig = {
  algorithm: 'HS256',
  expiresIn: '24h',
  issuer: 'devjobs-api',
  audience: 'devjobs-app',
};

// Instancia singleton del servicio
let jwtServiceInstance: JWTService | null = null;

/**
 * Obtiene la instancia singleton del servicio JWT
 * @function getJWTService
 * @description Retorna la instancia singleton del servicio
 * @param {JWTConfig} [config] - Configuración opcional
 * @returns {JWTService} Instancia del servicio
 */
export function getJWTService(config?: JWTConfig): JWTService {
  if (!jwtServiceInstance) {
    jwtServiceInstance = new JWTService(config || DEFAULT_JWT_CONFIG);
  }
  return jwtServiceInstance;
}

export default JWTService;
