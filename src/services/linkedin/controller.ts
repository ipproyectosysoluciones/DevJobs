/**
 * @fileoverview Controlador del servicio de LinkedIn
 * @module services/linkedin/controller
 */

import type { Request, Response } from 'express';
import crypto from 'crypto';
import LinkedInProfile from '../../models/LinkedInProfile.js';
import type { 
  LinkedInProfile as LinkedInProfileType,
  LinkedInJob,
  OAuthTokenResponse 
} from './types.js';
import type { AuthenticatedRequest } from '../auth/middleware.js';

/**
 * Genera la URL de autorización de LinkedIn
 */
export function getAuthorizationUrl(_req: Request, res: Response): void {
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

  res.json({ authorizationUrl: authUrl.toString(), state });
}

/**
 * Maneja el callback de OAuth de LinkedIn
 */
export async function handleCallback(req: Request, res: Response): Promise<void> {
  try {
    const { code, error } = req.query;

    if (error) {
      res.status(400).json({ error: 'Authorization failed', message: error });
      return;
    }

    if (!code || typeof code !== 'string') {
      res.status(400).json({
        error: 'Código de autorización faltante',
        message: 'Authorization code missing',
      });
      return;
    }

    const tokenResponse = await exchangeCodeForToken(code);
    if (!tokenResponse) {
      res.status(500).json({ error: 'Error al obtener tokens', message: 'Failed to obtain access token' });
      return;
    }

    const profile = await getLinkedInProfile(tokenResponse.access_token);
    if (!profile) {
      res.status(500).json({ error: 'Error al obtener perfil', message: 'Failed to obtain user profile' });
      return;
    }

    const user = (req as unknown as AuthenticatedRequest).user;
    if (user) {
      await LinkedInProfile.findOneAndUpdate(
        { userId: user.userId },
        {
          userId: user.userId,
          linkedInId: profile.id,
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          profile: profile as unknown as Record<string, unknown>,
          connectedAt: new Date(),
          lastSyncedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/profile?linkedin=success`);
  } catch (error) {
    console.error('Error en LinkedIn callback:', error);
    res.status(500).json({ error: 'Error interno del servidor', message: 'Internal server error' });
  }
}

/**
 * Obtiene el perfil de LinkedIn del usuario actual
 */
export async function getLinkedProfile(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as unknown as AuthenticatedRequest).user;

    if (!user) {
      res.status(401).json({ error: 'No autenticado', message: 'Not authenticated' });
      return;
    }

    const userData = await LinkedInProfile.findOne({ userId: user.userId }).lean();

    if (!userData) {
      res.status(404).json({ error: 'Perfil de LinkedIn no encontrado', message: 'LinkedIn profile not found' });
      return;
    }

    const response = {
      id: userData.linkedInId,
      firstName: (userData.profile?.localizedFirstName as string) || '',
      lastName: (userData.profile?.localizedLastName as string) || '',
      profilePicture: (userData.profile?.profilePicture as string) || '',
      email: (userData.profile?.email as string) || '',
      headline: (userData.profile?.headline as string) || '',
      connected: true,
      lastSync: userData.lastSyncedAt?.toISOString() || '',
    } satisfies Record<string, unknown>;

    res.json(response);
  } catch (error) {
    console.error('Error en getLinkedProfile:', error);
    res.status(500).json({ error: 'Error interno del servidor', message: 'Internal server error' });
  }
}

/**
 * Sincroniza los datos del perfil de LinkedIn
 */
export async function syncProfile(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as unknown as AuthenticatedRequest).user;
    if (!user) {
      res.status(401).json({ error: 'No autenticado', message: 'Not authenticated' });
      return;
    }

    const userData = await LinkedInProfile.findOne({ userId: user.userId });
    if (!userData) {
      res.status(404).json({ error: 'Perfil no encontrado', message: 'Profile not found' });
      return;
    }

    const profile = await getLinkedInProfile(userData.accessToken);
    if (profile) {
      userData.profile = profile as unknown as Record<string, unknown>;
      userData.lastSyncedAt = new Date();
      await userData.save();
    }

    res.json({ message: 'Perfil sincronizado', lastSync: userData.lastSyncedAt });
  } catch (error) {
    console.error('Error en syncProfile:', error);
    res.status(500).json({ error: 'Error interno del servidor', message: 'Internal server error' });
  }
}

/**
 * Desvincula la cuenta de LinkedIn
 */
export async function disconnect(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as unknown as AuthenticatedRequest).user;
    if (!user) {
      res.status(401).json({ error: 'No autenticado', message: 'Not authenticated' });
      return;
    }

    await LinkedInProfile.deleteOne({ userId: user.userId });
    res.json({ message: 'Cuenta de LinkedIn desvinculada' });
  } catch (error) {
    console.error('Error en disconnect:', error);
    res.status(500).json({ error: 'Error interno del servidor', message: 'Internal server error' });
  }
}

/**
 * Busca empleos en LinkedIn (simulado)
 */
export async function searchJobs(req: Request, res: Response): Promise<void> {
  const { keyword, location, limit = '10' } = req.query;
  
  const mockJobs: LinkedInJob[] = Array.from({ length: Math.min(parseInt(limit as string), 10) }, (_, i) => ({
    id: `linkedin_job_${i + 1}`,
    title: `${keyword || 'Software'} Developer ${i + 1}`,
    company: `Company ${i + 1}`,
    location: (location as string) || 'Remote',
    description: `Description for job ${i + 1}`,
    postUrl: `https://www.linkedin.com/jobs/view/${i + 1}`,
    postedDate: new Date(Date.now() - i * 86400000).toISOString(),
  }));

  res.json({ jobs: mockJobs, total: mockJobs.length });
}

/**
 * Obtiene detalle de un empleo de LinkedIn (simulado)
 */
export async function getJobDetails(req: Request, res: Response): Promise<void> {
  const jobId = req.params.jobId as string;

  const job: LinkedInJob = {
    id: jobId,
    title: 'Software Developer',
    company: 'Tech Corp',
    location: 'Remote',
    description: 'Full description of the position with requirements and benefits.',
    postUrl: `https://www.linkedin.com/jobs/view/${jobId}`,
    postedDate: new Date().toISOString(),
  };

  res.json(job);
}

// LinkedIn API helpers (sin cambios - usan HTTP externo)
async function exchangeCodeForToken(code: string): Promise<OAuthTokenResponse | null> {
  try {
    const { default: axios } = await import('axios');
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const redirectUri = process.env.LINKEDIN_CALLBACK_URL || 'http://localhost:3000/api/linkedin/callback';

    if (!clientId || !clientSecret) return null;

    const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
      params: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    return response.data;
  } catch {
    return null;
  }
}

async function getLinkedInProfile(accessToken: string): Promise<LinkedInProfileType | null> {
  try {
    const { default: axios } = await import('axios');
    const [profileResponse, emailResponse] = await Promise.all([
      axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    ]);

    return {
      id: profileResponse.data.sub,
      localizedFirstName: profileResponse.data.given_name,
      localizedLastName: profileResponse.data.family_name,
      email: emailResponse.data?.elements?.[0]?.['handle~']?.emailAddress || '',
    } as unknown as LinkedInProfileType;
  } catch {
    return null;
  }
}

export default {
  getAuthorizationUrl,
  handleCallback,
  getLinkedProfile,
  syncProfile,
  disconnect,
  searchJobs,
  getJobDetails,
};
