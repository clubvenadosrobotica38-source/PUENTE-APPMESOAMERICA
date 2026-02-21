const express = require("express");
const tmImage = require("@teachablemachine/image");
const { Canvas, Image } = require("canvas");
const axios = require("axios");
const app = express();

app.use(express.json());

// --- CONFIGURACIÓN ---
// REEMPLAZA ESTE LINK CON EL TUYO DE TEACHABLE MACHINE
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/88ZU8b-nk/"; 
// ---------------------

let model;

// Cargar el modelo al iniciar
async function loadModel() {
  model = await tmImage.load(MODEL_URL + "model.json", MODEL_URL + "metadata.json");
  console.log("Modelo de Mesoamérica cargado!");
}
loadModel();

app.post("/clasificar", async (req, res) => {
  try {
    const { imagenUrl } = req.body;
    
    // Descargar la imagen de AppSheet
    const response = await axios.get(imagenUrl, { responseType: 'arraybuffer' });
    const img = new Image();
    img.src = Buffer.from(response.data);

    // Crear un canvas para que la IA lea la imagen
    const canvas = new Canvas(img.width, img.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    // Predecir
    const prediction = await model.predict(canvas);
    
    // Ordenar para obtener el resultado más alto
    prediction.sort((a, b) => b.probability - a.probability);
    
    res.json({
      cultura: prediction[0].className,
      confianza: (prediction[0].probability * 100).toFixed(2) + "%"
    });
    
  } catch (error) {
    res.status(500).send("Error procesando imagen: " + error.message);
  }
});

app.listen(3000, () => console.log("Puente activo en puerto 3000"));
