import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import mongoose from "mongoose";
import type { IUsuarioDocument } from "../models/Usuarios";

const Passport = passport as any;

Passport.serializeUser((user: any, done: any): void => {
  done(null, user._id);
});

Passport.deserializeUser(async (id: mongoose.Types.ObjectId, done: any): Promise<void> => {
  try {
    const Usuario = (await import("../models/Usuarios.js")).default;
    const usuario = await Usuario.findById(id);
    done(null, usuario);
  } catch (error) {
    done(error, null);
  }
});

Passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email: string, password: string, done: any): Promise<void> => {
      try {
        const Usuario = (await import("../models/Usuarios.js")).default;
        const usuario = await Usuario.findOne({ email });
        if (!usuario) return done(null, false, { message: "Usuario no encontrado" });
        const isMatch = await usuario.compararPassword(password);
        if (!isMatch) return done(null, false, { message: "Password incorrecto" });
        return done(null, usuario);
      } catch (error) {
        return done(error);
      }
    }
  )
);

export default Passport;