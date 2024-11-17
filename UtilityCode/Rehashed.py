# Authors: Ryan and Jacob

import requests
from bs4 import BeautifulSoup
import json
import base64
import time

# Base URL for the directory
base_url = "https://www.sc.edu/study/colleges_schools/engineering_and_computing/faculty-staff/"
url = "https://www.sc.edu"

# Function to fetch and parse HTML content
def get_soup(url):
    response = requests.get(url)
    response.raise_for_status()
    return BeautifulSoup(response.text, 'html.parser')

# Function to encode an image from a URL to Base64
def encode_image_to_base64(image_url):
    try:
        response = requests.get(image_url)
        response.raise_for_status()
        return base64.b64encode(response.content).decode('utf-8')
    except Exception as e:
        print(f"Error encoding image {image_url}: {e}")
        return ""

# Function to extract profile links from the directory page
def extract_profile_links(soup):
    links = []
    for a_tag in soup.select('a[href^="/study/colleges_schools/engineering_and_computing/faculty-staff/"]'):
        href = a_tag.get('href')
        if href and href.endswith('.php'):
            links.append(base_url + href.split('/')[-1])
    return links

# Function to extract data from a faculty profile page
def extract_profile_data(profile_url):
    soup = get_soup(profile_url)
    profile_data = {
        "facOrStaff": "Faculty",  # Assuming Faculty unless specified otherwise
        "name": "",
        "title": "",
        "secTitle": "",
        "phone": "",
        "email": "",
        "keywords": "",
        "tags": "",
        "department": "",
        "college": "College of Engineering and Computing",  # Fixed value
        "image": "",
        "website": "",
        "office": "",
        "officeHours": {
            "monday": "",
            "tuesday": "",
            "wednesday": "",
            "thursday": "",
            "friday": ""
        }
    }

    # Extract the relevant section
    section = soup.find('section', class_='column grid_6')
    if section:
        profile_data["name"] = section.find('h1').get_text(strip=True) if section.find('h1') else ""
        title_div = section.find('div', class_='title')
        if title_div:
            profile_data["title"] = title_div.get_text(strip=True)

        for p_tag in section.find_all('p'):
            text = p_tag.get_text(strip=True)
            if "Phone:" in text:
                profile_data["phone"] = text.replace("Phone:", "").strip()
            elif "Email:" in text:
                email_link = p_tag.find('a', href=True)
                profile_data["email"] = email_link.get_text(strip=True) if email_link else ""
            elif "Office:" in text:
                profile_data["office"] = text.replace("Office:", "").strip()
            elif "Keywords:" in text:
                profile_data["keywords"] = text.replace("Keywords:", "").strip()
            elif "Tags:" in text:
                profile_data["tags"] = text.replace("Tags:", "").strip()

    # Extract image URL and encode to Base64
    image_tag = soup.find('img', {'src': True})
    if image_tag:
        image_url = url + image_tag['src']
        profile_data["image"] = encode_image_to_base64(image_url)

    # Extract office information (if present)
    office_section = soup.find('div', class_='office-info')
    if office_section:
        profile_data["office"] = office_section.get_text(strip=True)

    return profile_data

# Main script to scrape and save data
def main():
    all_profiles = []
    profile = 0

    while True:
        print(f"Processing directory page {profile}...")
        directory_url = f"{base_url}index.php"
        soup = get_soup(directory_url)

        # Extract profile links
        profile_links = extract_profile_links(soup)
        if not profile_links:
            break

        # Scrape data from each profile
        for link in profile_links:
            profile += 1
            print(f"Fetching profile: {link} profile: {profile}")
            try:
                profile_data = extract_profile_data(link)
                all_profiles.append(profile_data)
            except Exception as e:
                print(f"Error fetching profile {link}: {e}")
            time.sleep(0.1)  # Respectful delay to avoid overloading the server

        break

    # Save to JSON file
    output_file = "faculty_profiles.json"
    with open(output_file, "w") as json_file:
        json.dump(all_profiles, json_file, indent=4)

    print(f"Data successfully saved to {output_file}")

if __name__ == "__main__":
    main()
