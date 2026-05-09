import mongoose from "mongoose";
const { Schema, Document, Types } = mongoose;
import slug from "slug";
import shortid from "shortid";
import type { IVacante } from "../types/vacante.js";

/**
 * Interfaz del documento Vacante
 * @en Vacante mongoose document interface
 */
export interface IVacanteDocument extends Omit<IVacante, "autor" | "candidatos">, Document {
  autor: Types.ObjectId;
  candidatos: Array<{
    nombre: string;
    email: string;
    cv: string;
  }>;
  /** Generate URL slug from title / Generar slug URL desde el título */
  preSave: (next: mongoose.HookNextFunction) => Promise<void>;
}

/**
 * Esquema de Mongoose para Vacantes
 * @en Mongoose schema for job vacancies
 */
const vacantesSchema = new Schema<IVacanteDocument>(
  {
    titulo: {
      type: String,
      required: "El nombre de la vacante es obligatorio | Job title is required",
      trim: true,
    },
    empresa: {
      type: String,
      trim: true,
    },
    ubicacion: {
      type: String,
      trim: true,
      required: "La ubicación es obligatoria | Location is required",
    },
    salario: {
      type: String,
      default: 0,
      trim: true,
    },
    contrato: {
      type: String,
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
    },
    url: {
      type: String,
      lowercase: true,
    },
    skills: [
      {
        type: String,
      },
    ],
    candidatos: [
      {
        nombre: String,
        email: String,
        cv: String,
      },
    ],
    autor: {
      type: Schema.Types.ObjectId,
      ref: "Usuarios",
      required: "El autor es obligatorio | Author is required",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/**
 * Middleware para crear URL antes de guardar
 * @en Middleware to create URL before saving
 */
vacantesSchema.pre("save", async function (next): Promise<void> {
  // crear la url / create the url
  const url = slug(this.titulo);
  this.url = `${url}-${shortid.generate()}`;
  next();
});

/**
 * Crear índice de texto para búsqueda
 * @en Create text index for search
 */
vacantesSchema.index({ titulo: "text" });

/**
 * Validar formato de URL
 * @en Validate URL format
 */
const validarURL = (url: string): boolean => {
  const regex = /^[a-zA-Z0-9-]+$/;
  return regex.test(url);
};

vacantesSchema.path("url").validate(validarURL, "URL no válida | Invalid URL");

/**
 * Virtual para nombre completo (empresa - título)
 * @en Virtual for full name (company - title)
 */
vacantesSchema.virtual("nombreCompleto").get(function (): string {
  return `${this.empresa} - ${this.titulo}`;
});

/**
 * Exportar el modelo de Vacante
 * @en Export Vacante model
 */
const Vacante = mongoose.model<IVacanteDocument>("Vacante", vacantesSchema);

export default Vacante;