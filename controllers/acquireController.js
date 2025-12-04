const InputData = require('../models/InputData');
const { fetchKunna, calculateDates, ALIAS } = require('../services/kunnaService');

async function doAcquire(req, res) {
    try {
        // 1. Calcular fechas
        const { targetDate, timeStart, timeEnd } = calculateDates();

        console.log(`[ACQUIRE] Iniciando adquisición para Target: ${targetDate.toISOString()}`);
        
        // 2. Llamar a Kunna API
        const data = await fetchKunna(timeStart, timeEnd);

        // --- ZONA DE DEPURACIÓN ---
        console.log("Columnas recibidas de Kunna:", data.columns);
        console.log("Primera fila de datos:", data.values[0]); 
        // --------------------------

        // 3. Procesar datos (Buscamos la columna 'value' dinámicamente)
        // Buscamos en qué posición está la columna llamada "value"
        let valueIndex = data.columns.indexOf("value");
        
        // Si no la encuentra por nombre, probamos el índice 2 (suele ser: timestamp, alias, value)
        if (valueIndex === -1) {
            console.log("No se encontró columna 'value', probando índice 2...");
            valueIndex = 2; 
        }

        const values = data.values.map(row => row[valueIndex]); 
        const daysUsed = data.values.map(row => row[0]); // El timestamp suele ser la 0

        // 4. Guardar en MongoDB
        const inputData = await InputData.create({
            dailyValues: values,
            kunnaMeta: {
                alias: ALIAS,
                name: "1d",
                daysUsed: daysUsed
            },
            fetchMeta: {
                timeStart,
                timeEnd,
                source: "acquire"
            },
            targetDate: targetDate
        });

        res.status(201).json({
            message: "Data acquired and stored",
            id: inputData._id,
            data: inputData
        });

    } catch (err) {
        console.error("Error en /acquire:", err);
        res.status(500).json({ error: err.message });
    }
}

module.exports = { doAcquire };