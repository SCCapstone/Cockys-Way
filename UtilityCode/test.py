import json
import os

# File paths
input_file = "locations.txt"
output_file = "locations.json"

# Parse the content of the file
locations = []
with open(input_file, "r") as file:
    lines = file.readlines()
    current_location = {}
    
    for line in lines:
        # Skip empty lines or lines without a tab character
        if "\t" not in line.strip():
            continue
        
        # Extract key-value pairs
        key, value = line.strip().split("\t", 1)
        if key == "lat" or key == "lng":
            current_location[key] = float(value)
        elif key == "id" or key == "catId":
            current_location[key] = int(value)
        elif key == "name":
            current_location[key] = value.strip('"')
        
        # If we reach the end of a location block, append it
        if "iconSize" in line and current_location:
            if all(k in current_location for k in ["lat", "lng", "id", "name"]):
                locations.append(current_location)
            current_location = {}

# Save to JSON file
if not os.path.exists(output_file):
    with open(output_file, "w") as json_file:
        json.dump(locations, json_file, indent=4)
    print(f"Data successfully written to {output_file}")
else:
    print(f"{output_file} already exists.")
