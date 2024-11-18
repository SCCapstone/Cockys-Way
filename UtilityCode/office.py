import requests
from bs4 import BeautifulSoup
import json

def get_office_location(website_url):
    # Send a request to the website
    response = requests.get(website_url)
    
    # Check if the request was successful
    if response.status_code != 200:
        print(f"Failed to retrieve {website_url}")
        return None
    
    # Parse the HTML content of the page
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Find all <tr> tags on the page
    rows = soup.find_all('tr')
    
    # Loop through each row to find office location
    for row in rows:
        # Get all <td> tags in the row
        cells = row.find_all('td')
        
        # Check if there are two <td> tags and if the first contains 'office'
        if len(cells) == 2 and 'office' in cells[0].text.lower():
            return cells[1].text.strip()  # Return the office location text

    # Return None if no office location found
    return None

def update_json_with_office(json_file):
    # Load the existing JSON data
    with open(json_file, 'r') as f:
        data = json.load(f)
    
    # Check if the data is a list (no need for .get() in this case)
    if isinstance(data, list):
        for faculty in data:
            website = faculty.get('website')
            
            if website:
                office_location = get_office_location(website)
                if office_location:
                    faculty['office'] = office_location
                    print(f"Updated office for {faculty['name']}: {office_location}")
                else:
                    print(f"Office not found for {faculty['name']}")
                    faculty['office'] = ''
    
    # Save the updated JSON data back to the file
    with open(json_file, 'w') as f:
        json.dump(data, f, indent=4)

# Replace with your actual JSON file path
json_file = 'social-work.json'
update_json_with_office(json_file)