import requests
from bs4 import BeautifulSoup
import json
import time

# Base URL for the Locations
# base_url = "https://api.concept3d.com/categories/9492?map=744&children=&key=0001085cc708b9cef47080f064612ca5"

#           Chloe To-Do:
#               -   Get all locations in, & give them all favorite & visibility variables

#       For the PoC, I'm just going to ONLY get the categories/locations from the map site

"""
#       Ok so all the api links:
#       Academic Buildings:     https://api.concept3d.com/categories/9492?map=744&children=&key=0001085cc708b9cef47080f064612ca5
#       Administrative:         https://api.concept3d.com/categories/23396?map=744&children&key=0001085cc708b9cef47080f064612ca5
#       Colleges & Schools:     https://api.concept3d.com/categories/24560,24561,24901,24902,24903,24904,24905,24906,24907,24908,24909,24910,24911,24912,24913,24914,59489,59490,59491,59492,59493?map=744&batch&children&key=0001085cc708b9cef47080f064612ca5
#       Housing:                
#       Dining:                 https://api.concept3d.com/categories/21041?map=744&children&key=0001085cc708b9cef47080f064612ca5
#       Athletics:              
#       Parking:                https://api.concept3d.com/categories/9495,21045,21046,21047,21048,21049,21050,21779,21780,23393,24585,43763,61610,69645,69646,23401,25584,25585,25586,25589,25592,25594,25630,25631,72924,21035?map=744&batch&children&key=0001085cc708b9cef47080f064612ca5
#       Transportation:         https://api.concept3d.com/categories/24365,9823,22077,22078,23398,23399,23400,24275,24276,24366,24537,24538,24559,24874,50733,50735,50921,51005,51006,56433,9495,21045,21046,21047,21048,21049,21050,21779,21780,23393,24585,43763,61610,69645,69646,23401,25584,25585,25586,25589,25592,25594,25630,25631,72924?map=744&batch&children&key=0001085cc708b9cef47080f064612ca5
#       Services:               https://api.concept3d.com/categories/35654,25885,35857,51966,56969,57179,63444,66992?map=744&batch&children&key=0001085cc708b9cef47080f064612ca5
#       Accessibility:          https://api.concept3d.com/categories/21040,23390,23392,67764,67765?map=744&batch&children&key=0001085cc708b9cef47080f064612ca5


#       Other:
#       https://api.concept3d.com/categories/24365,9823,22077,22078,23398,23399,23400,24275,24276,24366,24537,24538,24559,24874,50733,50735,50921,51005,51006,56433,9495,21045,21046,21047,21048,21049,21050,21779,21780,23393,24585,43763,61610,69645,69646,23401,25584,25585,25586,25589,25592,25594,25630,25631,72924?map=744&batch&children&key=0001085cc708b9cef47080f064612ca5
#       https://api.concept3d.com/categories/9495,21045,21046,21047,21048,21049,21050,21779,21780,23393,24585,43763,61610,69645,69646,23401,25584,25585,25586,25589,25592,25594,25630,25631,72924,21035?map=744&batch&children&key=0001085cc708b9cef47080f064612ca5



#       IN THEORY this link should have everything all in one
#       https://api.concept3d.com/categories/23396,21041,24197,9497,24199,24560,24561,24901,24902,24903,24904,24905,24906,24907,24908,24909,24910,24911,24912,24913,24914,59489,59490,59491,59492,59493,9492,21035,9495,21045,21046,21047,21048,21049,21050,21779,21780,23393,24585,43763,61610,69645,69646?map=744&batch&children&key=0001085cc708b9cef47080f064612ca5
"""
#
#
#
'''
        Location data & what they're called in locations.txt:

        catId:      Category ID (ie. Administrative, Dining, etc.) ID for which category the location should fall under
        lat:        Latitude
        lng:        Longitude
        mapId:      ID used to determine which pin type will appear on the map
        id:         Location ID. Unique for each possible location.
        mrkId:      Unsure
        name:       Address (USE THIS FOR SEARCHING)

        NEW:
        favorited:  T/F value to determine if it should be listed under favorited Locations
        visibility: T/F value to determine if it should currently be visible

        catId, lat, lng, mapId, id, mrkId, name, favorited, visibility
'''


# import requests
# import json 
#res = requests.get('https://api.concept3d.com/categories/9492?map=744&children=&key=0001085cc708b9cef47080f064612ca5')
#response = json.loads(res.text)

#print(response.text)



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
        elif key == "id":
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


'''
        For Chloe because her memory is Very Bad

        npx expo start

        Open Android Studio
        npx expo run:android --variant release

        To commit:
        git pull
        git add .
        git commit -m "Message"
        git push            (git push origin chloe-branch) when working in branch

        Merging:
        go to main: git checkout main
        merge branch: git merge (branch-name)


        Chloe To-Do
        index.js:
        -   Go in & edit search to instead account for the locations collection on firestore
        -   search should be able to look thru loc data in firestore & search by title
    
'''
