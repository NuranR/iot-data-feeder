const dht = require('pigpio-dht');
const axios = require('axios');

const SENSOR_PIN = 4;
const SENSOR_TYPE = 11; // 11 for DHT11
const LOG_INTERVAL_MS = 10000; // 10 seconds
const BLOCKCHAIN_API_URL = 'http://localhost:3001/transact';
const SENSOR_ID = 'pi-dht11-sensor-01';

const dhtSensor = dht(SENSOR_PIN, SENSOR_TYPE);

console.log('DHT11 Sensor gateway started.');

const sendSensorTransaction = () => {
    dhtSensor.read(); // Trigger a new reading
};

dhtSensor.on('result', async (data) => {
    const timestamp = new Date().toISOString();

    // Construct the transaction body
    const transactionData = {
        sensor_id: SENSOR_ID,
        reading: {
            type: "temperature",
            value: data.temperature,
            unit: "C"
        },
        metadata: {
            humidity: data.humidity,
            timestamp: timestamp,
            gatewayId: "raspberry-pi-3"
        }
    };

    console.log(`[${new Date().toLocaleTimeString()}] Attempting to send transaction:`);
    console.log(JSON.stringify(transactionData, null, 2)); // Pretty-print the JSON

    // Send the POST request
    try {
        await axios.post(BLOCKCHAIN_API_URL, transactionData);
        console.log(`[${new Date().toLocaleTimeString()}] Transaction sent! Temp: ${data.temperature}°C, Hum: ${data.humidity}%`);
    } catch (error) {
        console.error(`[${new Date().toLocaleTimeString()}] Failed to send transaction:`, error.message);
    }
});

// Handle Errors
dhtSensor.on('badChecksum', () => {
    console.warn(`[${new Date().toLocaleTimeString()}] Bad checksum from DHT11, retrying...`);
});

// Start the Loop
setInterval(sendSensorTransaction, LOG_INTERVAL_MS);

// Graceful exit on CTRL+C
process.on('SIGINT', () => {
    console.log('\nExiting program.');
    process.exit();
});
