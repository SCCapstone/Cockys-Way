import requests
from bs4 import BeautifulSoup
import json
import time

# Base URL for the Locations
# base_url = "https://api.concept3d.com/categories/9492?map=744&children=&key=0001085cc708b9cef47080f064612ca5"

#           Chloe To-Do:
#               -   Get all locations in, & give them all favorite & visibility variables

# import requests
# import json 
res = requests.get('https://api.concept3d.com/categories/9492?map=744&children=&key=0001085cc708b9cef47080f064612ca5')
response = json.loads(res.text)

print(response.text)



