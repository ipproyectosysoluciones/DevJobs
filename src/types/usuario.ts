/**
 * Interfaz de usuario
 * @en User interface
 */
export interface IUsuario {
  /** Nombre completo / Full name */
  nombre: string;
  /** Email único / Unique email */
  email: string;
  /** Password hasheado / Hashed password */
  password: string;
  /** URL de imagen de perfil (opcional) / Profile image URL */
  imagen?: string;
  /** Token para reset de password (opcional) */
  token?: string;
  /** Fecha de expiración del token (opcional) */
  expira?: Date;
}

/**
 * Tipo para crear un nuevo usuario
 * @en Type for creating a new user
 */
export type IUsuarioCreate = Omit<IUsuario, "token" | "expira">;

/**
 * Tipo para actualizar usuario
 * @en Type for updating user
 */
export type IUsuarioUpdate = Partial<IUsuarioCreate>;

/**
 * Tipo para datos públicos del usuario
 * @en Type for public user data
 */
export interface IUsuarioPublic {
  nombre: string;
  email: string;
  imagen?: string;
}