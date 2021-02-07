# Pool Controller

This is a work in progress, mainly for my own fun and pool (Jandy heater, Pentair pump, 2 actuators).

I have learned a lot (and borrowed) some ideas from https://github.com/tagyoureit/nodejs-poolController.

To be frank I started making this quite modular, but the current state is somewhat hacked together for my specific setup.

The frontend is Angular, the backend is Nest. The built frontend code is served up by Nest.

State is stored in `server/state.json`. I didn't feel a database was necessary at this scale.

# My Setup

https://imgur.com/a/OipIwoF

## Pool Parts
1. Pentair Intelliflo Variable Speed Pump
2. Jandy JXi 400k BTU Heater
3. 2x PE24VA Intermatic actuators
4. Pentair 520272 Thermistor

## Tech Parts
1. Raspberry Pi 4B
2. USB to RS485 (https://www.amazon.com/gp/product/B081MB6PN2)
3. Wi-Fi Adapter and external antenna (https://www.amazon.com/gp/product/B00JDVRCI0 + https://www.amazon.com/gp/product/B08PCDDG8J) 
4. Breadboard, 10k ohm resistor, Adafruit MCP3008, connected to Pi's SPI interface
5. 8 channel 5v relay

## Wiring
1. Pump is wired using RS485 (2 wire) to the USB adapter
2. Heater is wired using 3 wires (common, spa, pool) to the relay. The relay simply bridges either the pool or spa to common to activate the respective mode. This requires 2 relays, and should be connected to normally open.
3. The actuators are wired to the breadboard and 24V AC adapter. The actuator has 3 wires - a common, and 2 power legs. Depending on which is powered the motor will rotate that direction. One leg is connected to the relay's normally open and the other leg connected to normally closed. I have pool connected to normally closed so if the pi loses power then the relay will close and the actuators will return to the pool mode.

## Temperature Graph
I use Grafana, Influx DB to record the temperature. I have this running on a separate server and simply iframe it in.

# How to run

## Install node modules:

```bash
cd client
npm install

cd server
npm install
```

## Start it up

You will want to use PM2 or some other 

```bash
npm start
```
