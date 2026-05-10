import mongoose from "mongoose";

/**
 * Conectar a MongoDB (Mongoose 8+)
 */
const conectarDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI ?? "mongodb://localhost:27017/devjobs";
    
    await mongoose.connect(mongoUri);
    mongoose.set("strictQuery", true);
    
    console.log("✅ Base de datos conectada");
    
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error);
    process.exit(1);
  }
};

export default conectarDB;