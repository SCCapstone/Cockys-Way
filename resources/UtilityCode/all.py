import requests
from bs4 import BeautifulSoup
import json
import re

i = 0

# URL of the webpage containing the table
url = 'https://www.sc.edu/study/colleges_schools/pharmacy/faculty-staff/'
response = requests.get(url)

# Parse the page content
soup = BeautifulSoup(response.text, 'html.parser')

# Find the table (you may need to specify the correct table if there are multiple)
table = soup.find('table')

# Initialize a list to hold the extracted data
table_data = []

# Extract column headers from the <thead> (assuming the headers are in the <thead>)
headers = []
thead = table.find('thead')
if thead:
    header_cells = thead.find_all('th')
    for header in header_cells:
        headers.append(header.text.strip().lower())

# Extract each row from the table (starting from the second row, assuming the first row is the header)
rows = table.find_all('tr')[1:]

for row in rows:
    # Find all cells (td) in the row
    cols = row.find_all('td')
    
    # Initialize a dictionary to store the row data paired with headers
    row_data = {}
    
    # Extract the text from each cell and pair it with the header
    for idx, col in enumerate(cols):
        # Clean up any unwanted tags like <span> within the cell
        for span in col.find_all('span'):
            span.decompose()

        # Ensure that the number of columns in the row matches the number of headers
        if idx < len(headers):
            # Clean the cell text
            cell_text = col.text.strip()

            # Add the header-title as the key and the cell content as the value
            header_title = headers[idx]
            row_data[header_title] = cell_text

    row_data['college'] = "College of Pharmacy"
    row_data['image'] = ""
    row_data['office'] = ""
    row_data['officeHours'] = {
        "monday": "",
        "tuesday": "",
        "wednesday": "",
        "thursday": "",
        "friday": ""
    }

    # Only add rows that have data (not empty)
    table_data.append(row_data)
    i += 1
    print(i)

# Print out the first few rows of extracted data for debugging
# print("Extracted Data:", table_data[:5])

# Specify the output JSON file name
output_file = 'table_data.json'

# Write the extracted data to a JSON file
with open(output_file, 'w') as json_file:
    json.dump(table_data, json_file, indent=4)

print(f"Data has been successfully extracted and saved to {output_file}")

