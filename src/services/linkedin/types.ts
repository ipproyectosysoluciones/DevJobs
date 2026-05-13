/**
 * @fileoverview Tipos e interfaces para el servicio de LinkedIn
 * @fileoverview Types and interfaces for LinkedIn service
 * @module services/linkedin/types
 */

/**
 * Perfil de LinkedIn
 * @interface LinkedInProfile
 */
export interface LinkedInProfile {
  /** ID único de LinkedIn | LinkedIn unique ID */
  id: string;
  /** Nombre.firstName */
  firstName: string;
  /** Apellido | Last name */
  lastName: string;
  /** Nombre completo | Full name */
  formattedName?: string;
  /** Correo electrónico | Email */
  email?: string;
  /** URL del perfil | Profile URL */
  profileUrl?: string;
  /** Imagen de perfil | Profile picture */
  pictureUrl?: string;
  /** Título profesional | Professional headline */
  headline?: string;
  /** Ubicación | Location */
  location?: string;
  /** Industria | Industry */
  industry?: string;
  /** Resumen | Summary */
  summary?: string;
  /** Experiencia laboral | Work experience */
  experience?: LinkedInExperience[];
  /** Educación | Education */
  education?: LinkedInEducation[];
  /** Habilidades | Skills */
  skills?: string[];
}

/**
 * Experiencia laboral
 * @interface LinkedInExperience
 */
export interface LinkedInExperience {
  /** Título del trabajo | Job title */
  title: string;
  /** Nombre de la empresa | Company name */
  company: string;
  /** URL del logo | Logo URL */
  logoUrl?: string;
  /** Fecha de inicio | Start date */
  startDate?: string;
  /** Fecha de fin | End date */
  endDate?: string;
  /** Descripción | Description */
  description?: string;
  /** Ubicación | Location */
  location?: string;
}

/**
 * Educación
 * @interface LinkedInEducation
 */
export interface LinkedInEducation {
  /** Nombre de la institución | Institution name */
  institutionName: string;
  /** Grado | Degree */
  degree?: string;
  /** Campo de estudio | Field of study */
  fieldOfStudy?: string;
  /** Fecha de inicio | Start date */
  startDate?: string;
  /** Fecha de fin | End date */
  endDate?: string;
}

/**
 * Empleo de LinkedIn
 * @interface LinkedInJob
 */
export interface LinkedInJob {
  /** ID único | Unique ID */
  id: string;
  /** Título | Title */
  title: string;
  /** Descripción | Description */
  description?: string;
  /** Empresa | Company */
  company: string;
  /** URL del logo | Logo URL */
  companyLogoUrl?: string;
  /** Ubicación | Location */
  location?: string;
  /** Tipo de empleo | Job type */
  jobType?: string;
  /** Nivel de experiencia | Experience level */
  experienceLevel?: string;
  /** URL de la publicación | Post URL */
  postUrl?: string;
  /** Fecha de publicación | Posted date */
  postedDate?: string;
}

/**
 * Solicitud de OAuth LinkedIn
 * @interface LinkedInOAuthRequest
 */
export interface LinkedInOAuthRequest {
  /** Código de autorización | Authorization code */
  code: string;
  /** URI de redirección | Redirect URI */
  redirectUri: string;
}

/**
 * Datos del usuario con LinkedIn
 * @interface LinkedInUserData
 */
export interface LinkedInUserData {
  /** ID del usuario en DevJobs | DevJobs user ID */
  userId: string;
  /** Datos del perfil de LinkedIn | LinkedIn profile data */
  profile: LinkedInProfile;
  /** Token de acceso | Access token */
  accessToken: string;
  /** Token de refresco | Refresh token */
  refreshToken?: string;
  /** Fecha de expiración del token | Token expiration date */
  expiresAt?: Date;
  /** Fecha de última sincronización | Last sync date */
  lastSyncAt?: Date;
}

/**
 * Configuración de LinkedIn
 * @interface LinkedInConfig
 */
export interface LinkedInConfig {
  /** Client ID de LinkedIn | LinkedIn Client ID */
  clientId: string;
  /** Client Secret de LinkedIn | LinkedIn Client Secret */
  clientSecret: string;
  /** URI de redirección | Redirect URI */
  redirectUri: string;
  /** Permisos solicitados | Requested scopes */
  scopes: string[];
}

/**
 * Respuesta de token OAuth
 * @interface OAuthTokenResponse
 */
export interface OAuthTokenResponse {
  /** Token de acceso | Access token */
  access_token: string;
  /** Tipo de token | Token type */
  token_type: string;
  /** Tiempo de expiración en segundos | Expiration in seconds */
  expires_in: number;
  /** Token de refresco | Refresh token */
  refresh_token?: string;
  /** Tiempo de expiración del refresh token | Refresh token expiration */
  refresh_token_expires_in?: number;
  /** Ámbito del token | Token scope */
  scope: string;
}

/**
 * Respuesta cruda de la API de LinkedIn (OpenID Connect)
 * @interface LinkedInProfileResponse
 * @description Raw response from LinkedIn's /userinfo endpoint
 */
export interface LinkedInProfileResponse {
  /** ID único del usuario | User unique identifier */
  sub: string;
  /** Nombre/s | Given name(s) */
  given_name: string;
  /** Apellido/s | Family name(s) */
  family_name: string;
  /** Nombre completo | Full name */
  name: string;
  /** Correo electrónico | Email address */
  email?: string;
  /** URL de la imagen de perfil | Profile picture URL */
  picture?: string;
}
