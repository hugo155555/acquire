require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { doAcquire } = require("./controllers/acquireController");

const PORT = process.env.PORT || 3003; // Usaremos el puerto 3003 para Acquire
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/prediction";

const app = express();
app.use(express.json());

// Conexión BD
mongoose.connect(MONGO_URI)
  .then(() => console.log("[ACQUIRE] Conectado a MongoDB"))
  .catch(err => console.error("[ACQUIRE] Error Mongo:", err));

// Rutas
app.post("/acquire", doAcquire);
// Ruta health
app.get("/health", (req, res) => res.send("Acquire Service OK"));

app.listen(PORT, () => {
    console.log(`[ACQUIRE] Servicio escuchando en puerto ${PORT}`);
});