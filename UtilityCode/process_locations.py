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
    #   Parse raw data into json
    entries = re.split(r'\n\d+\t', raw_data.strip(), flags=re.MULTILINE)  # Split by numeric indices
    # added flags multiline
    formatted_locations = []

    for entry in entries:
        # Create a dictionary for the current location
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

                # Add to location directory
                location[key] = value

        # Build the location object       
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
        """
        final_location = {
            "catId": location.get("catId"),
            "lat": location.get("lat"),
            "lng": location.get("lng"),
            "mapId": location.get("mapId"),
            "id": location.get("id"),
            "mrkId": location.get("mrkId"),
            "name": location.get("name"),
            "favorited": False,  # Default value
            "visibility": False  # Default value
        }


        # Add the location only if not all values are null
        if any(value is not None for value in final_location.values()):
            formatted_locations.append(final_location)
        """
    return formatted_locations

"""
def merge_split_entries(file_path):

    #Combine entries in formatted_locations.json where data does not overlap,
    #using the 'id' field as the primary key for merging.

    try:
        # Read the JSON file
        with open(file_path, 'r') as json_file:
            locations = json.load(json_file)

        # Dictionary to store merged entries by 'id'
        merged_entries = {}

        for location in locations:
            # Use 'id' as the key for merging; fall back to 'mrkId' if 'id' is null
            key = location.get("id") or location.get("mrkId")

            if key is not None:
                if key not in merged_entries:
                    # Initialize the entry if not already present
                    merged_entries[key] = location
                else:
                    # Merge non-overlapping fields
                    for field, value in location.items():
                        if merged_entries[key].get(field) is None and value is not None:
                            merged_entries[key][field] = value

        # Extract the merged entries into a list
        merged_locations = list(merged_entries.values())

        # Overwrite the JSON file with the merged data
        with open(file_path, 'w') as json_file:
            json.dump(merged_locations, json_file, indent=4)

        print(f"Entries have been merged and saved back to {file_path}")
    except Exception as e:
        print(f"An error occurred while merging entries: {e}")
"""



def merge_every_two_entries(file_path):
    """
    Merge every two entries in formatted_locations.json into a single entry,
    ignoring entries where 'lat' is 0.0.
    """
    try:
        # Read the JSON file
        with open(file_path, 'r') as json_file:
            locations = json.load(json_file)

        # Filter out entries where 'lat' is 0.0
        valid_locations = [location for location in locations if location.get("lat") != 0.0]

        merged_locations = []
        for i in range(0, len(valid_locations), 2):
            if i + 1 < len(valid_locations):
                # Merge two consecutive entries
                merged_entry = {}
                for key in set(valid_locations[i].keys()).union(valid_locations[i + 1].keys()):
                    value1 = valid_locations[i].get(key)
                    value2 = valid_locations[i + 1].get(key)
                    merged_entry[key] = value1 if value1 is not None else value2
                merged_locations.append(merged_entry)
            else:
                # If odd number of entries, add the last one as is
                merged_locations.append(valid_locations[i])

        # Remove entries where both 'catId' and 'name' are null
        filtered_merged_locations = [
            location for location in merged_locations
            if not (location.get("catId") is None and location.get("lat") is None and location.get("lng") is None and location.get("mapId") is None and location.get("id") is None and location.get("mrkId") is None and location.get("name") is None)
        ]

        # Overwrite the JSON file with the merged data
        with open(file_path, 'w') as json_file:
            #json.dump(merged_locations, json_file, indent=4)
            json.dump(filtered_merged_locations, json_file, indent=4)

        print(f"Entries have been merged in pairs and saved back to {file_path}")
    except Exception as e:
        print(f"An error occurred while merging entries: {e}")




def reorder_keys(file_path):
    """
    Reorder the keys in each entry of formatted_locations.json to match the specified order.
    """
    try:
        # Read the JSON file
        with open(file_path, 'r') as json_file:
            locations = json.load(json_file)

        # Desired key order
        key_order = [
            "catId", "lat", "lng", "mapId", "id", "mrkId", "name", "visibility", "favorited"
        ]

        # Reorder keys for each location
        reordered_locations = [
            {key: location.get(key) for key in key_order} for location in locations
        ]

        # Overwrite the JSON file with the reordered data
        with open(file_path, 'w') as json_file:
            json.dump(reordered_locations, json_file, indent=4)

        print(f"Keys have been reordered and saved back to {file_path}")
    except Exception as e:
        print(f"An error occurred while reordering keys: {e}")








#   SHOULD be able to remove nulls
def remove_null_entries(file_path):
    """
    Remove entries from formatted_locations.json where both 'catId' and 'name' are null.
    """
    try:
        # Read the JSON file
        with open(file_path, 'r') as json_file:
            locations = json.load(json_file)

        # Filter out entries where both 'catId' and 'name' are null
        filtered_locations = [
            location for location in locations 
            if not (location.get("catId") is None and location.get("name") is None)        #   OLD
            #if not (location.get("catId") is None and location.get("name") is None and location.get("lat") is 0.0)
            #if not (location.get("catId") is None and location.get("lat") is None and location.get("lng") is None and location.get("mapId") is None and location.get("id") is None and location.get("mrkId") is None and location.get("name") is None and location.get("lat") is 0.0)
            #   Added to remove lat 0.0 entries to remove Category definitions. Since PinFilter has that info already, we dont need it here too
        ]

        # Overwrite the JSON file with the filtered data
        with open(file_path, 'w') as json_file:
            json.dump(filtered_locations, json_file, indent=4)

        print(f"Filtered entries saved back to {file_path}")
    except Exception as e:
        print(f"An error occurred while filtering entries: {e}")


# Main function to read the file and process it
def process_file(file_path):
    try:
        # Read the raw data from the file
        with open(file_path, 'r') as file:
            raw_data = file.read()

        # Parse the raw data into the desired format
        formatted_locations = parse_raw_data(raw_data)

        # Convert the data to JSON format and save it to a file
        # formatted_json = json.dumps(formatted_locations, indent=4)    # OLD
        output_file = "formatted_locations.json"
        with open(output_file, 'w') as json_file:
            # json_file.write(formatted_json)                           OLD
            json.dump(formatted_locations, json_file, indent=4)

        print(f"Formatted data has been saved to {output_file}")

        # Remove entries with both 'catId' and 'name' as null
        remove_null_entries(output_file)

        # Merge split entries
        #merge_split_entries(output_file)

        # Merge every two entries
        #merge_every_two_entries(output_file)
        # ok this ends up making the order ugly and also bringing back null entries?

        # Reorder keys
 #       reorder_keys(output_file)
 #       remove_null_entries(output_file)

    except Exception as e:
        print(f"An error occurred: {e}")

# Specify the input file
input_file = "locations.txt"

# Run the processing function
process_file(input_file)

