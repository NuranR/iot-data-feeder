# Use a modern Debian-based Node image
FROM node:20-bookworm-slim

# Install dependencies, including the one for Python's distutils
RUN apt-get update && \
    apt-get install -y build-essential python3 python3-setuptools wget unzip

# Download and install the pigpio C library manually
RUN wget https://github.com/joan2937/pigpio/archive/master.zip && \
    unzip master.zip && \
    cd pigpio-master && \
    make && \
    make install && \
    cd .. && \
    rm -rf pigpio-master master.zip

# Set the working directory
WORKDIR /usr/src/app

# Copy package files and install the Node.js wrapper
COPY package*.json ./
RUN npm install

# Copy the rest of your application code
COPY . .

# Start the pigpio daemon and then execute the Node.js script
CMD [ "sh", "-c", "pigpiod && exec node index.js" ]
