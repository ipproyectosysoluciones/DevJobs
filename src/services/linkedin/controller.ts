/**
 * @fileoverview Controlador del servicio de LinkedIn
 * @fileoverview LinkedIn service controller
 * @module services/linkedin/controller
 */

import type { Request, Response } from 'express';
import type { 
  LinkedInProfile, 
  LinkedInJob,
  LinkedInUserData,
  OAuthTokenResponse 
} from './types.js';

// Base de datos en memoria (en producción, usar MongoDB)
const linkedinUsers: Map<string, LinkedInUserData> = new Map();

/**
 * Genera la URL de autorización de LinkedIn
 * @function getAuthorizationUrl
 * @description Genera la URL para iniciar OAuth con LinkedIn
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export function getAuthorizationUrl(req: Request, res: Response): void {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = process.env.LINKEDIN_CALLBACK_URL || 'http://localhost:3000/api/linkedin/callback';
  
  if (!clientId) {
    res.status(500).json({
      error: 'LinkedIn no configurado',
      message: 'LinkedIn client ID not configured',
    });
    return;
  }

  const scopes = ['openid', 'profile', 'email', 'r_liteprofile', 'r_emailaddress'];
  const state = crypto.randomUUID();
  
  const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', scopes.join(' '));
  authUrl.searchParams.set('state', state);

  res.json({
    authorizationUrl: authUrl.toString(),
    state,
  });
}

/**
 * Maneja el callback de OAuth de LinkedIn
 * @function handleCallback
 * @description Procesa el código de autorización y obtiene tokens
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {Promise<void>}
 */
export async function handleCallback(req: Request, res: Response): Promise<void> {
  try {
    const { code, state, error } = req.query;

    if (error) {
      res.status(400).json({
        error: 'Authorization failed',
        message: error,
      });
      return;
    }

    if (!code || typeof code !== 'string') {
      res.status(400).json({
        error: 'Código de autorización faltante',
        message: 'Authorization code missing',
      });
      return;
    }

    // Intercambiar código por tokens
    const tokenResponse = await exchangeCodeForToken(code);
    
    if (!tokenResponse) {
      res.status(500).json({
        error: 'Error al obtener tokens',
        message: 'Failed to obtain access token',
      });
      return;
    }

    // Obtener perfil del usuario
    const profile = await getLinkedInProfile(tokenResponse.access_token);
    
    if (!profile) {
      res.status(500).json({
        error: 'Error al obtener perfil',
        message: 'Failed to obtain user profile',
      });
      return;
    }

    // Guardar datos del usuario (en producción, guardar en DB)
    const user = (req as any).user;
    if (user) {
      const userData: LinkedInUserData = {
        userId: user.userId,
        profile,
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000),
        lastSyncAt: new Date(),
      };
      linkedinUsers.set(user.userId, userData);
    }

    // Redireccionar al frontend con éxito
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/profile?linkedin=success`);
  } catch (error) {
    console.error('Error en LinkedIn callback:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Internal server error',
    });
  }
}

/**
 * Obtiene el perfil de LinkedIn del usuario actual
 * @function getProfile
 * @description Retorna el perfil de LinkedIn vinculado
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export function getProfile(req: Request, res: Response): void {
  const user = (req as any).user;

  if (!user) {
    res.status(401).json({
      error: 'No autenticado',
      message: 'Not authenticated',
    });
    return;
  }

  const userData = linkedinUsers.get(user.userId);

  if (!userData) {
    res.status(404).json({
      error: 'Perfil de LinkedIn no encontrado',
      message: 'LinkedIn profile not found',
    });
    return;
  }

  res.json(userData.profile);
}

/**
 * Sincroniza el perfil de LinkedIn
 * @function syncProfile
 * @description Actualiza los datos del perfil de LinkedIn
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {Promise<void>}
 */
export async function syncProfile(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({
        error: 'No autenticado',
        message: 'Not authenticated',
      });
      return;
    }

    const userData = linkedinUsers.get(user.userId);

    if (!userData) {
      res.status(404).json({
        error: 'Perfil de LinkedIn no encontrado',
        message: 'LinkedIn profile not found',
      });
      return;
    }

    // Actualizar perfil
    const profile = await getLinkedInProfile(userData.accessToken);
    
    if (!profile) {
      res.status(500).json({
        error: 'Error al sincronizar perfil',
        message: 'Failed to sync profile',
      });
      return;
    }

    userData.profile = profile;
    userData.lastSyncAt = new Date();
    linkedinUsers.set(user.userId, userData);

    res.json({
      message: 'Perfil sincronizado correctamente',
      profile,
    });
  } catch (error) {
    console.error('Error en syncProfile:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Internal server error',
    });
  }
}

/**
 * Desvincula la cuenta de LinkedIn
 * @function disconnect
 * @description Desvincula el perfil de LinkedIn del usuario
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export function disconnect(req: Request, res: Response): void {
  const user = (req as any).user;

  if (!user) {
    res.status(401).json({
      error: 'No autenticado',
      message: 'Not authenticated',
    });
    return;
  }

  linkedinUsers.delete(user.userId);

  res.json({
    message: 'Cuenta de LinkedIn desvinculada',
  });
}

/**
 * Busca empleos en LinkedIn
 * @function searchJobs
 * @description Busca empleos en LinkedIn
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {Promise<void>}
 */
export async function searchJobs(req: Request, res: Response): Promise<void> {
  try {
    const { keyword, location, limit = 10 } = req.query;

    // En producción, esto调用 LinkedIn Jobs API
    // Por ahora, retornamos datos simulados
    const jobs: LinkedInJob[] = [
      {
        id: 'li_1',
        title: keyword ? `${keyword} Developer` : 'Senior Developer',
        description: 'Exciting opportunity for an experienced developer',
        company: 'Tech Corp',
        companyLogoUrl: 'https://example.com/logo.png',
        location: location as string || 'Madrid, Spain',
        jobType: 'Full-time',
        experienceLevel: 'Senior',
        postUrl: 'https://linkedin.com/jobs/view/123',
        postedDate: new Date().toISOString(),
      },
      {
        id: 'li_2',
        title: 'Frontend Engineer',
        description: 'Join our frontend team',
        company: 'Startup Inc',
        location: 'Remote',
        jobType: 'Full-time',
        experienceLevel: 'Mid-Senior',
        postUrl: 'https://linkedin.com/jobs/view/456',
        postedDate: new Date().toISOString(),
      },
    ];

    res.json(jobs.slice(0, parseInt(limit as string) || 10));
  } catch (error) {
    console.error('Error en searchJobs:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Internal server error',
    });
  }
}

/**
 * Obtiene los detalles de un empleo de LinkedIn
 * @function getJobDetails
 * @description Retorna detalles de un empleo específico
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @returns {void}
 */
export function getJobDetails(req: Request, res: Response): void {
  const { jobId } = req.params;

  // Simular datos del empleo
  const job: LinkedInJob = {
    id: jobId,
    title: 'Senior Developer',
    description: 'We are looking for a senior developer to join our team. You will be working on exciting projects and collaborating with a talented team.',
    company: 'Tech Corp',
    companyLogoUrl: 'https://example.com/logo.png',
    location: 'Madrid, Spain',
    jobType: 'Full-time',
    experienceLevel: 'Senior',
    postUrl: `https://linkedin.com/jobs/view/${jobId}`,
    postedDate: new Date().toISOString(),
  };

  res.json(job);
}

/**
 * Intercambia código por token de acceso
 * @function exchangeCodeForToken
 * @description Intercambia el código de autorización por tokens
 * @param {string} code - Código de autorización
 * @returns {Promise<OAuthTokenResponse | null>} Token de acceso
 */
async function exchangeCodeForToken(code: string): Promise<OAuthTokenResponse | null> {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = process.env.LINKEDIN_CALLBACK_URL || 'http://localhost:3000/api/linkedin/callback';

  if (!clientId || !clientSecret) {
    console.error('LinkedIn credentials not configured');
    return null;
  }

  try {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) {
      console.error('Token exchange failed:', await response.text());
      return null;
    }

    return await response.json() as OAuthTokenResponse;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    return null;
  }
}

/**
 * Obtiene el perfil de LinkedIn
 * @function getLinkedInProfile
 * @description Obtiene los datos del perfil del usuario
 * @param {string} accessToken - Token de acceso
 * @returns {Promise<LinkedInProfile | null>} Perfil de LinkedIn
 */
async function getLinkedInProfile(accessToken: string): Promise<LinkedInProfile | null> {
  try {
    // LinkedIn OpenID Connect endpoint
    const response = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch LinkedIn profile:', await response.text());
      return null;
    }

    const data = await response.json();

    return {
      id: data.sub,
      firstName: data.given_name,
      lastName: data.family_name,
      formattedName: data.name,
      email: data.email,
      profileUrl: `https://www.linkedin.com/in/${data.sub}`,
      pictureUrl: data.picture,
    };
  } catch (error) {
    console.error('Error fetching LinkedIn profile:', error);
    return null;
  }
}

export default {
  getAuthorizationUrl,
  handleCallback,
  getProfile,
  syncProfile,
  disconnect,
  searchJobs,
  getJobDetails,
};
