import json
import re
import requests
from bs4 import BeautifulSoup
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_POST
import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def get_csrf(request):
    response = JsonResponse({'detail': 'CSRF cookie set'})
    response['X-CSRFToken'] = get_token(request)
    return response


@require_POST
def login_view(request):
    data = json.loads(request.body)
    username = data.get('username')
    password = data.get('password')

    if username is None or password is None:
        return JsonResponse({'detail': 'Please provide username and password.'}, status=400)

    user = authenticate(username=username, password=password)

    if user is None:
        return JsonResponse({'detail': 'Invalid credentials.'}, status=400)

    login(request, user)
    return JsonResponse({'detail': 'Successfully logged in.'})


def logout_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({'detail': 'You\'re not logged in.'}, status=400)

    logout(request)
    return JsonResponse({'detail': 'Successfully logged out.'})


@ensure_csrf_cookie
def session_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({'isAuthenticated': False})

    return JsonResponse({'isAuthenticated': True})


def whoami_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({'isAuthenticated': False})

    return JsonResponse({'username': request.user.username})
####################################################################################################


def data_view(request):
    URL = "https://coinmarketcap.com/currencies/bitcoin/"
    r = requests.get(URL)

    soup = BeautifulSoup(r.content, 'html5lib')

    # Select the price span using the correct CSS selector
    price_element = soup.select_one("span.sc-d1ede7e3-0.fsQm.base-text")

    if price_element:
        price = price_element.text
        # Use regex to remove the $ symbol and commas
        price_cleaned = re.sub(r'[^\d.]', '', price)

        # Convert the cleaned string to a float
        price_float = float(price_cleaned)

        # Create a dictionary to hold the data
        price_data = {
            "price": price_float
        }

        # Return the data as JSON response
        return JsonResponse(price_data)
    else:
        # Return error message as JSON response
        return JsonResponse({"error": "Price element not found"})


"""
def data_view(request):
    match_url = "https://coinmarketcap.com/currencies/bitcoin/"

    # Set the Chrome driver options
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')

    # Start the Chrome driver
    driver = webdriver.Chrome(options=options)

    try:
        driver.get(match_url)

        # Wait for the price element to be present
        wait = WebDriverWait(driver, 3)
        price_element = wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, 'span.sc-d1ede7e3-0.fsQm.base-text')))

        # Extract the price text
        price = price_element.text

        # Use regex to remove the $ symbol and commas
        price_cleaned = re.sub(r'[^\d.]', '', price)

        # Convert the cleaned string to a float
        price_float = float(price_cleaned)

    except Exception as e:
        # Handle exceptions if the elements are not found
        price_float = str(e)

    finally:
        # Quit the driver
        driver.quit()

    if not request.user.is_authenticated:
        return JsonResponse({'isAuthenticated': False})

    # Return the price data as JSON
    return JsonResponse({'price': price_float})
"""

"""
def get_price(url):
    # Set the Chrome driver options
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')

    # Start the Chrome driver
    driver = webdriver.Chrome(options=options)

    driver.get(url)

    try:
        # Wait for the price element to be present
        wait = WebDriverWait(driver, 3)
        price_element = wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, 'span.sc-d1ede7e3-0.fsQm.base-text')))

        # Extract the price text
        price = price_element.text

        # Use regex to remove the $ symbol and commas
        price_cleaned = re.sub(r'[^\d.]', '', price)

        # Convert the cleaned string to a float
        price_float = float(price_cleaned)

    except Exception as e:
        # Handle exceptions if the elements are not found
        price_float = str(e)

    finally:
        # Quit the driver
        driver.quit()

    # Return the price data as JSON
    return json.dumps({'price': price_float})


def data_view(request):
    match_url = "https://coinmarketcap.com/currencies/bitcoin/"
    result = get_price(match_url)

    if not request.user.is_authenticated:
        return JsonResponse({'isAuthenticated': False})

    # Decode JSON string to dictionary and extract price
    price = json.loads(result)['price']
    return JsonResponse({'price': price})
"""
