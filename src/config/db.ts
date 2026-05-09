import mongoose from "mongoose";

/**
 * Conectar a MongoDB
 * @en Connect to MongoDB
 */
const conectarDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI ?? "mongodb://localhost:27017/devjobs";
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log("Base de datos conectada | Database connected");
    
    // Manejar eventos de conexión
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });
    
    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });
    
  } catch (error) {
    console.log("Error al conectar a MongoDB:", error);
    process.exit(1);
  }
};

export default conectarDB;