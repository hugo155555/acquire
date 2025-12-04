const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InputDataSchema = new Schema({
    // Los datos crudos recibidos de la API
    dailyValues: { type: [Number], required: true }, 
    
    // Metadatos de Kunna (según captura persistencia.docx)
    kunnaMeta: {
        alias: String,
        name: String,
        daysUsed: [String] // Array de fechas en string
    },
    
    // Metadatos de la petición
    fetchMeta: {
        timeStart: Date,
        timeEnd: Date,
        source: { type: String, default: "acquire" }
    },

    // Fecha objetivo de predicción
    targetDate: { type: Date, required: true },
    
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InputData', InputDataSchema);