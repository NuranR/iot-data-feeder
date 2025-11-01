const { Gpio } = require('pigpio');
const axios = require('axios');

const SENSOR_PIN = 17;
const LOG_INTERVAL_MS = 10000; 
const BLOCKCHAIN_API_URL = 'http://localhost:3001/transact';
const SENSOR_ID = 'pi-moisture-sensor-01'; 

// Initialize the Sensor
const sensorPin = new Gpio(SENSOR_PIN, {
    mode: Gpio.INPUT,
    pullUpDown: Gpio.PUD_UP,
});

console.log('Sensor gateway started.');

const sendSensorTransaction = async () => {
    try {
        const level = sensorPin.digitalRead(); // Read the current sensor state
        const status = (level === 0) ? 'wet' : 'dry'; // Determine status
        const timestamp = new Date().toISOString();

        const transactionData = {
            sensor_id: SENSOR_ID,
            reading: {
                type: "moisture",
                value: status, // The value is the string "wet" or "dry"
                unit: "state"
            },
            metadata: {
                timestamp: timestamp,
                gatewayId: "raspberry-pi-3"
            }
        };

        await axios.post(BLOCKCHAIN_API_URL, transactionData);

        console.log(`[${new Date().toLocaleTimeString()}] Transaction sent successfully! Status: ${status}`);

    } catch (error) {
        console.error(`[${new Date().toLocaleTimeString()}] Failed to send transaction:`, error.message);
    }
};

setInterval(sendSensorTransaction, LOG_INTERVAL_MS);

// Graceful exit on CTRL+C
process.on('SIGINT', () => {
    console.log('\nExiting program.');
    process.exit();
});
