const dht = require('pigpio-dht');
const axios = require('axios');

// --- Configuration ---
const SENSOR_PIN = 4; // The GPIO pin we connected to (GPIO 4 = Pin 7)
const SENSOR_TYPE = 11; // 11 for DHT11, 22 for DHT22
const LOG_INTERVAL_MS = 10000; // 10 seconds
const BLOCKCHAIN_API_URL = 'http://localhost:3001/transact';
const SENSOR_ID = 'pi-dht11-sensor-01'; // A unique ID for this sensor

// --- Initialize the Sensor ---
const dhtSensor = dht(SENSOR_PIN, SENSOR_TYPE);

console.log('✅ DHT11 Sensor gateway started.');
console.log(`Will send 2 transactions to ${BLOCKCHAIN_API_URL} every ${LOG_INTERVAL_MS / 1000} seconds.`);

/**
 * Reads the sensor and sends its data as a transaction to the blockchain.
 */
const sendSensorTransaction = () => {
    dhtSensor.read(); // Trigger a new reading
};

// --- Listen for Sensor Data ---
// This block is modified to send two separate transactions
dhtSensor.on('result', async (data) => {
    const timestamp = new Date().toISOString();
    const localTime = new Date().toLocaleTimeString();

    // --- 1. Construct TEMPERATURE Transaction ---
    const tempTransactionData = {
        sensor_id: SENSOR_ID,
        reading: {
            type: "temperature",
            value: data.temperature,
            unit: "C"
        },
        metadata: {
            // Humidity is now its own transaction
            timestamp: timestamp,
            gatewayId: "raspberry-pi-3"
        }
    };

    // --- 2. Construct HUMIDITY Transaction ---
    const humidityTransactionData = {
        sensor_id: SENSOR_ID, // Same sensor
        reading: {
            type: "humidity", // Different type
            value: data.humidity, // Different value
            unit: "%" // Different unit
        },
        metadata: {
            timestamp: timestamp, // Same metadata
            gatewayId: "raspberry-pi-3"
        }
    };

    // --- 3. Send Both Transactions (one after the other) ---
    
    // --- Send Temperature ---
    try {
        console.log(`[${localTime}] Attempting to send TEMPERATURE transaction...`);
        console.log(JSON.stringify(tempTransactionData, null, 2));
        
        await axios.post(BLOCKCHAIN_API_URL, tempTransactionData);
        
        console.log(`[${localTime}] Transaction sent! Temp: ${data.temperature}°C`);
    } catch (error) {
        console.error(`[${localTime}] Failed to send TEMPERATURE transaction:`, error.message);
    }

    // --- Send Humidity ---
    try {
        console.log(`[${localTime}] Attempting to send HUMIDITY transaction...`);
        console.log(JSON.stringify(humidityTransactionData, null, 2));

        await axios.post(BLOCKCHAIN_API_URL, humidityTransactionData);
        
        console.log(`[${localTime}] Transaction sent! Hum: ${data.humidity}%`);
    } catch (error) {
        console.error(`[${localTime}] Failed to send HUMIDITY transaction:`, error.message);
    }
});

// --- Handle Errors ---
dhtSensor.on('badChecksum', () => {
    console.warn(`[${new Date().toLocaleTimeString()}] Bad checksum from DHT11, retrying...`);
});

// --- Start the Loop ---
setInterval(sendSensorTransaction, LOG_INTERVAL_MS);

// Graceful exit on CTRL+C
process.on('SIGINT', () => {
    console.log('\nExiting program.');
    process.exit();
});
