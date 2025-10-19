const { Gpio } = require('pigpio');

// Use GPIO 17 (physical pin 11)
const sensorPin = new Gpio(17, {
    mode: Gpio.INPUT,
    pullUpDown: Gpio.PUD_UP, // Use an internal pull-up resistor
});

const LOG_INTERVAL_MS = 1000;

console.log('Soil Moisture Sensor is active.');

setInterval(() => {
    const level = sensorPin.digitalRead(); // Actively read the pin's current state
    const timestamp = new Date().toLocaleTimeString();

    if (level === 0) {
        console.log(`[${timestamp}] Status: Wet!`);
    } else {
        console.log(`[${timestamp}] Status: Dry`);
    }
}, LOG_INTERVAL_MS);


// gracefully exit on CTRL+C
process.on('SIGINT', () => {
    console.log('\nExiting program.');
    process.exit();
});
