'''
    This file is used to process the raw location data from locations.txt
    into something actually readable (yay)


    This all may seem like gibberish at first. First I need to run this program & see if the resulting
    json file is correct

    ONLY use is to turn "locations.txt" into the readable "formatted_locations.json"

'''

# Python script to format raw data into JSON format matching `locations.txt`

import re
import json

# Function to parse raw data into a dictionary
def parse_raw_data(raw_data):
    entries = re.split(r'\n\d+\t', raw_data.strip())  # Split by numeric indices
    formatted_locations = []

    for entry in entries:
        lines = entry.strip().split("\n")
        location = {}
        for line in lines:
            if "\t" in line:
                key, value = line.split("\t", 1)
                key = key.strip()
                value = value.strip().strip('"')
                if key in ["lat", "lng"]:
                    value = float(value)  # Convert lat/lng to float
                elif key in ["catId", "mapId", "id", "mrkId"]:
                    value = int(value)  # Convert IDs to integers
                elif value == "":
                    value = None  # Replace empty strings with None
                location[key] = value
        formatted_locations.append({
            "catId": location.get("catId"),
            "lat": location.get("lat"),
            "lng": location.get("lng"),
            "mapId": location.get("mapId"),
            "id": location.get("id"),
            "mrkId": location.get("mrkId"),
            "name": location.get("name"),
            "favorited": False,
            "visibility": False
        })

    return formatted_locations

# Main function to read the file and process it
def process_file(file_path):
    try:
        # Read the raw data from the file
        with open(file_path, 'r') as file:
            raw_data = file.read()

        # Parse the raw data into the desired format
        formatted_locations = parse_raw_data(raw_data)

        # Convert the data to JSON format and save it to a file
        formatted_json = json.dumps(formatted_locations, indent=4)
        output_file = "formatted_locations.json"
        with open(output_file, 'w') as json_file:
            json_file.write(formatted_json)

        print(f"Formatted data has been saved to {output_file}")
    except Exception as e:
        print(f"An error occurred: {e}")

# Specify the input file
input_file = "locations.txt"

# Run the processing function
process_file(input_file)

