import json

# Load the faculty profiles JSON data
with open('images.json', 'r') as faculty_file:
    faculty_profiles = json.load(faculty_file)

# Load the CEC JSON data
with open('table_data.json', 'r') as cec_file:
    cec_data = json.load(cec_file)

# Ensure both lists have the same length
if len(faculty_profiles) != len(cec_data):
    raise ValueError("The number of entries in faculty_profiles.json and cec.json do not match.")

# Update the 'image' attribute in cec.json with data from faculty_profiles.json
for faculty_profile, cec_entry in zip(faculty_profiles, cec_data):
    cec_entry['image'] = faculty_profile['image']

# Save the updated CEC JSON data
with open('table_data.json', 'w') as updated_cec_file:
    json.dump(cec_data, updated_cec_file, indent=4)

print("Images have been successfully moved to the respective attributes in cec.json.")