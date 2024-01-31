#!/bin/bash

# Define the output file
OUTPUT_FILE="cpu_temps.txt"

# Start an infinite loop
while true
do
    # Read the CPU temperature
    CPU_TEMP=$(vcgencmd measure_temp | egrep -o '[0-9]*\.[0-9]*')

    # Get the current date and time
    TIMESTAMP=$(date)

    # Write the temperature and timestamp to the output file
    echo "$TIMESTAMP - CPU Temperature: $CPU_TEMP°C" >> $OUTPUT_FILE

    # Wait for 30 seconds
    sleep 30
done