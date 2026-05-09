import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";
import type { IUsuario } from "../types/usuario.js";

/**
 * Interfaz del documento Usuario
 * @en Usuario mongoose document interface
 */
export interface IUsuarioDocument extends IUsuario, Document {
  /** Comparar password ingresada con el hash guardado / Compare input password with stored hash */
  compararPassword: (password: string) => Promise<boolean>;
}

/**
 * Esquema de Mongoose para Usuarios
 * @en Mongoose schema for users
 */
const usuariosSchema = new Schema<IUsuarioDocument>(
  {
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    token: {
      type: String,
    },
    expira: {
      type: Date,
    },
    imagen: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/**
 * Middleware para hashear passwords antes de guardar
 * @en Middleware to hash passwords before saving
 */
usuariosSchema.pre("save", async function (next): Promise<void> {
  // si el password ya está hasheado / if password is already hashed
  if (!this.isModified("password")) {
    return next();
  }
  // si no está hasheado, hashearlo / if not hashed, hash it
  try {
    const hash = await bcrypt.hash(this.password, 12);
    this.password = hash;
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Middleware post-save para manejar errores de duplicado
 * @en Post-save middleware to handle duplicate errors
 */
usuariosSchema.post("save", (error, _doc, next): void => {
  if (error.name === "MongoError" && error.code === 11000) {
    next(new Error("Ese correo ya está registrado | That email is already registered"));
  } else {
    next(error);
  }
});

/**
 * Métodos del esquema / Schema methods
 */
usuariosSchema.methods.compararPassword = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

/**
 * Exportar el modelo de Usuario
 * @en Export Usuario model
 */
const Usuario = mongoose.model<IUsuarioDocument>("Usuarios", usuariosSchema);

export default Usuario;