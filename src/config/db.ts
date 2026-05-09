import mongoose from "mongoose";

/**
 * Conectar a MongoDB
 * @en Connect to MongoDB
 */
const conectarDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI ?? "mongodb://localhost:27017/devjobs", {
      // biome-ignore lint/style/noNonNullAssertion: Configuración deprecation de mongoose
      useNewUrlParser: true,
      // biome-ignore lint/style/noNonNullAssertion:
      useUnifiedTopology: true,
      // biome-ignore lint/style/noNonNullAssertion:
      useFindAndModify: false,
      // biome-ignore lint/style/noNonNullAssertion:
      useCreateIndex: true,
    });
    console.log("Base de datos conectada | Database connected");
  } catch (error) {
    console.log("Error | Error:", error);
    process.exit(1);
  }
};

export default conectarDB;