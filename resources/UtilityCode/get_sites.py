import requests
from bs4 import BeautifulSoup
import json
import time

# Base URL for the faculty directory
base_url = "https://www.sc.edu/study/colleges_schools/pharmacy/faculty-staff/"

# Function to fetch and parse a page
def get_soup(url):
    response = requests.get(url)
    response.raise_for_status()
    return BeautifulSoup(response.text, 'html.parser')

# Function to extract profile links from the directory page
def extract_profile_links(soup):
    links = []
    for a_tag in soup.select('a[href^="/study/colleges_schools/pharmacy/faculty-staff/"]'):
        href = a_tag.get('href')
        if href and href.endswith('.php'):
            links.append(base_url + href.split('/')[-1])
    return links

# Function to extract data from a faculty profile page
def extract_profile_data(profile_url):
    soup = get_soup(profile_url)
    profile_data = {'Profile URL': profile_url}
    table = soup.find('table', {'role': 'presentation'})
    if table:
        for row in table.find_all('tr'):
            cols = row.find_all('td')
            if len(cols) == 2:
                key = cols[0].get_text(strip=True).replace(':', '')
                value = cols[1].get_text(strip=True)
                profile_data[key] = value
    return profile_data

# Main script to scrape data from all faculty profiles
def main():
    all_profiles = []
    profile = 0

    while True:
        print(f"Processing directory page {profile}...")
        directory_url = f"{base_url}index.php"
        soup = get_soup(directory_url)

        # Extract profile links from the current directory page
        profile_links = extract_profile_links(soup)
        if not profile_links:  # Break if no more profiles are found
            break

        # Scrape each profile
        for link in profile_links:
            profile += 1
            print(f"Fetching profile: {link} profile {profile}")
            try:
                profile_data = extract_profile_data(link)
                all_profiles.append(profile_data)
            except Exception as e:
                print(f"Error fetching profile {link}: {e}")
            time.sleep(0.3)  # Respectful delay

        break

    # Save the data to a JSON file
    output_file = "sites.json"
    with open(output_file, "w") as json_file:
        json.dump(all_profiles, json_file, indent=4)

    print(f"Data has been successfully saved to {output_file}")

if __name__ == "__main__":
    main()
