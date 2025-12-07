'use strict';
const InputData= require('../models/InputData')
const KUNNA_URL = "https://openapi.kunna.es/data/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjM2NDEwNjB9.ixb4O5Jgk-e_oPMSsycpD7A_iGVqIl4Ijl2a_kLrT94";
const ALIAS = "6339651";

async function fetchKunna(timeStart, timeEnd) {
    const url = KUNNA_URL;
    const headers = {
        "Content-Type": "application/json"
    };

    const body = {
        time_start: timeStart.toISOString(),
        time_end: timeEnd.toISOString(),
        filters: [
            { filter: "name", values: ["1d"] },
            { filter: "alias", values: [ALIAS] }
        ],
        limit: 100,
        count: false,
        order: "DESC"
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`KUNNA_BAD_STATUS:${response.status}`);
        }

        const json = await response.json();
        const result = json.result;

        if (!result || !Array.isArray(result.columns) || !Array.isArray(result.values)) {
            throw new Error("KUNNA_INVALID_RESULT");
        }
        
        return result; // { columns, values }
    } catch (error) {
        console.error("Error fetching Kunna:", error);
        throw error;
    }
}

function calculateDates() {
    const now = new Date();
    let targetDate = new Date(now);

    // Lógica de targetDate.docx:
    // "Definimos si son más de las 23, predecimos mañana, sino predecimos hoy"
    if (now.getHours() >= 23) {
       targetDate.setDate(targetDate.getDate() + 1);
    }
    
    // Ajustamos la hora objetivo (por ejemplo a las 22:00 UTC)
    targetDate.setUTCHours(22, 0, 0, 0);

    // "Time_end = target date -1"
    const timeEnd = new Date(targetDate);
    timeEnd.setDate(timeEnd.getDate() - 1);

    // "Time_start = time_end – 3"
    const timeStart = new Date(timeEnd);
    timeStart.setDate(timeStart.getDate() - 3);

    return { targetDate, timeStart, timeEnd };
}

module.exports = { fetchKunna, calculateDates, ALIAS };