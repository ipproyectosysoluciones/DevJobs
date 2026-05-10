import mongoose, { Schema, model, type Document, type Types } from "mongoose";
import slug from "slug";
import shortid from "shortid";

/**
 * Interfaz de candidato
 */
interface ICandidato {
  nombre: string;
  email: string;
  cv: string;
}

/**
 * Interfaz del documento Vacante
 */
export interface IVacanteDocument extends Document {
  titulo: string;
  empresa: string;
  ubicacion: string;
  salario?: string;
  contrato?: string;
  descripcion?: string;
  url: string;
  skills: string[];
  candidatos: ICandidato[];
  autor: Types.ObjectId;
  nombreCompleto: string;
}

/**
 * Esquema de Mongoose para Vacantes
 */
const vacantesSchema = new Schema<IVacanteDocument>(
  {
    titulo: {
      type: String,
      required: [true, "El nombre de la vacante es obligatorio"],
      trim: true,
    },
    empresa: {
      type: String,
      trim: true,
    },
    ubicacion: {
      type: String,
      trim: true,
      required: [true, "La ubicación es obligatoria"],
    },
    salario: {
      type: String,
      default: "0",
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
      required: [true, "El autor es obligatorio"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/**
 * Middleware para crear URL antes de guardar
 */
vacantesSchema.pre("save", async function () {
  const doc = this as unknown as IVacanteDocument;
  const url = slug(doc.titulo);
  doc.url = `${url}-${shortid.generate()}`;
});

/**
 * Crear índice de texto para búsqueda
 */
vacantesSchema.index({ titulo: "text" });

/**
 * Validar formato de URL
 */
const validarURL = (url: string): boolean => {
  const regex = /^[a-zA-Z0-9-]+$/;
  return regex.test(url);
};

vacantesSchema.path("url").validate(validarURL, "URL no válida");

/**
 * Virtual para nombre completo (empresa - título)
 */
vacantesSchema.virtual("nombreCompleto").get(function (): string {
  const doc = this as unknown as IVacanteDocument;
  return `${doc.empresa} - ${doc.titulo}`;
});

/**
 * Exportar el modelo de Vacante
 */
const Vacante = model<IVacanteDocument>("Vacante", vacantesSchema);

export default Vacante;