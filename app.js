import express from "express";
import mongoose from "mongoose";
import exphbs from "express-handlebars"

import productsRouter from "./src/routes/productsRouter.js";
import cartsRouter from "./src/routes/cartsRouter.js";
import viewsRouter from "./src/routes/viewsRouter.js";

const app = express();
const PORT = 8080;

// Middleware para parsear JSON y datos de formulario
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de Handlebars como motor de plantillas
app.engine("handlebars", exphbs.engine({
    defaultLayout: 'main',
    helpers: {
    eq: function(a, b) {
      return a === b;
    }
  },
  runtimeOptions: {
        allowProtoPropertiesByDefault: true  // Desactiva la restricción para propiedades heredadas
    }
}));
app.set("view engine", "handlebars");
app.set("views","src/views");

// Conexión a MongoDB
const MONGO_URL = "mongodb://localhost:27017/ecommerce";
mongoose
  .connect(MONGO_URL)
  .then(() => console.log("Conexión a MongoDB exitosa"))
  .catch((err) => console.error("Error conectando a MongoDB:", err));

// Configuración de routers
app.use("/api/products", productsRouter); // Para manejar productos
app.use("/api/carts", cartsRouter); // Para manejar carritos
app.use("/", viewsRouter); // Para las vistas de Handlebars

// Servidor escuchando
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
