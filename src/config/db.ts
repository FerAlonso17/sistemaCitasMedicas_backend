import mongoose from "mongoose";
import colors from "colors";

export const connectDB = async () => {
    const DB_URL = "mongodb://127.0.0.1:27017/local"; // Coloca aquí la URL de tu base de datos

    try {
        const { connection } = await mongoose.connect(DB_URL);
        const url = `${connection.host}:${connection.port}`;
        console.log(colors.magenta.bold(`MongoDB conectado en ${url}`));
    } catch (error) {
        console.log(colors.red.bold(`Error al conectar a MongoDB: ${error.message}`));
        // Manejar el error sin detener el proceso
    }
};
