const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InputDataSchema = new Schema({
    features: { type: [Number], required: true },
    featureCount: {type: Number, default: 7},
    scalerVersion: {type: String, default: "v1"},

    dailyValues: { type: [Number], required: true }, 
    
    // Metadatos de Kunna
    kunnaMeta: {
        alias: String,
        name: String,
        daysUsed: [String] 
    },
    
    // Metadatos de la descarga
    fetchMeta: {
        timeStart: Date,
        timeEnd: Date,
        source: { type: String, default: "acquire" }
    },

    // Fecha objetivo
    targetDate: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InputData', InputDataSchema);