import { Types } from "mongoose";

/**
 * Interfaz de candidato a vacante
 * @en Candidate interface for job vacancy
 */
export interface ICandidato {
  nombre: string;
  email: string;
  cv: string;
}

/**
 * Interfaz de vacante de trabajo
 * @en Job vacancy interface
 */
export interface IVacante {
  /** Título de la vacante / Job title */
  titulo: string;
  /** Nombre de la empresa / Company name */
  empresa: string;
  /** Ubicación de la vacante / Location */
  ubicacion: string;
  /** Salario offered (opcional) */
  salario?: string;
  /** Tipo de contrato / Contract type */
  contrato?: string;
  /** Descripción del puesto / Job description */
  descripcion?: string;
  /** URL slug única / Unique slug URL */
  url: string;
  /** Skills requeridos / Required skills */
  skills: string[];
  /** Candidatos aplicados / Applied candidates */
  candidatos: ICandidato[];
  /** ID del autor de la vacante / Author ID */
  autor: Types.ObjectId;
}

/**
 * Tipo para crear una nueva vacante
 * @en Type for creating a new vacancy
 */
export type IVacanteCreate = Omit<IVacante, "url" | "candidatos">;

/**
 * Tipo para actualizar una vacante
 * @en Type for updating a vacancy
 */
export type IVacanteUpdate = Partial<IVacanteCreate>;