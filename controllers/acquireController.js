const InputData = require('../models/InputData');
const { fetchKunna, calculateDates, ALIAS } = require('../services/kunnaService');

async function doAcquire(req, res) {
    try {
        // 1. Calcular fechas
        const { targetDate, timeStart, timeEnd } = calculateDates();
        console.log(`[ACQUIRE] Target: ${targetDate.toISOString()}`);
        
        // 2. Llamar a Kunna API
        const data = await fetchKunna(timeStart, timeEnd);

        // 3. Procesar datos (Buscamos la columna 'value')
        let valueIndex = data.columns.indexOf("value");
        if (valueIndex === -1) valueIndex = 2; // Fallback

        // Extraemos los 3 valores de consumo (dailyValues)
        const values = data.values.map(row => row[valueIndex]); 
        const daysUsed = data.values.map(row => row[0]); 

        // --- ESTA ES LA PARTE QUE TE FALTA ---
        // Construimos el array 'features' de 7 elementos.
        
        const tDate = new Date(targetDate);
        
        // Extraemos componentes numéricos de la fecha objetivo
        const f_hour = tDate.getUTCHours();      // Hora
        const f_dow  = tDate.getUTCDay();        // Día de la semana
        const f_month= tDate.getUTCMonth() + 1;  // Mes
        const f_day  = tDate.getUTCDate();       // Día del mes

        // Concatenamos: [Valor1, Valor2, Valor3, Hora, DiaSem, Mes, DiaMes]
        const features = [...values, f_hour, f_dow, f_month, f_day];
        // -------------------------------------

        // 4. Guardar en MongoDB
        const inputData = await InputData.create({
            features: features,       // <--- ¡IMPORTANTE! Pasamos el array calculado
            dailyValues: values,
            featureCount: 7,
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