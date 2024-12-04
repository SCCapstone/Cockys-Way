import json
import random
from datetime import datetime, timedelta
from sys import argv

# Function to generate a random time slot
def generate_random_time_slot():
    start_hour = random.randint(9, 15)  # Random hour between 9 AM and 3 PM (to ensure 1.5 hours fit within 9-5)
    start_minute = random.choice([0, 30])  # Randomly choose 0 or 30 minutes
    start_time = datetime.strptime(f"{start_hour}:{start_minute}", "%H:%M")
    end_time = start_time + timedelta(hours=1, minutes=30)
    return start_time.strftime("%I:%M %p"), end_time.strftime("%I:%M %p")

# Function to randomly choose 2 days of the week
def choose_random_days():
    days = ["monday", "tuesday", "wednesday", "thursday", "friday"]
    return random.sample(days, 2)

# Process each file in the input list
file_names = argv[1].split(',')  # Read comma-separated file names from the command line

for file_name in file_names:
    try:
        # Load the JSON data
        with open(file_name.strip(), 'r') as file:
            data = json.load(file)

        # Update each entry in the JSON data
        for entry in data:
            office_hours = entry.get('officeHours', {})
            random_days = choose_random_days()
            for day in random_days:
                start_time, end_time = generate_random_time_slot()
                office_hours[day] = f"{start_time}-{end_time}"
            entry['officeHours'] = office_hours

        # Save the updated JSON data
        with open(file_name.strip(), 'w') as file:
            json.dump(data, file, indent=4)

        print(f"Office hours successfully added to {file_name.strip()}.")
    except Exception as e:
        print(f"Error processing file {file_name.strip()}: {e}")
