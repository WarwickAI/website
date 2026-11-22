---
title: 'Workshop 5'
course: 'Python Course'
description: 'APIs and requests: build a menu app that gets the real 5-day weather forecast for campus.'
date: 2026-11-18
authors: ['ian-gitau']
---

Today you build a menu app that gets the real 5-day forecast for campus. We make our first API call together, then you write the app one function at a time, reusing the `DayForecast` class from last week. Stretch tasks are optional.

Weather data by [Open-Meteo.com](https://open-meteo.com/).

### Getting started

- Open [Google Colab](https://colab.research.google.com/) and choose **File > New notebook in Drive**.
- Copy each code block from this page into a new code cell with **+ Code**, then click the **play button** to run it. Work from top to bottom.
- Have a go yourself before you open an answer.

## Setup

Run these three cells. The last one is `DayForecast` from last week: run it, or paste in your own version.

```python
import requests

FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"

CAMPUS_LATITUDE = 52.38
CAMPUS_LONGITUDE = -1.56

# If the weather service gives you an error, change this to True
USE_SAMPLE_DATA = False
```

```python
# Saved forecast data (run this, no need to read it)
# A real response from Open-Meteo, saved on 19 Nov 2026
SAMPLE_FORECAST = {
    "latitude": 52.377945,
    "longitude": -1.557373,
    "timezone": "Europe/London",
    "daily_units": {
        "time": "iso8601",
        "temperature_2m_max": "°C",
        "temperature_2m_min": "°C",
        "precipitation_probability_max": "%",
        "weather_code": "wmo code",
    },
    "daily": {
        "time": ["2026-11-19", "2026-11-20", "2026-11-21", "2026-11-22", "2026-11-23"],
        "temperature_2m_max": [8.6, 7.0, 6.2, 7.3, 7.7],
        "temperature_2m_min": [6.4, 1.3, -1.6, 3.7, 2.7],
        "precipitation_probability_max": [100, 18, 0, 24, 24],
        "weather_code": [61, 53, 45, 3, 61],
    },
}
```

```python
class DayForecast:
    def __init__(self, day, high, low, rain_chance):
        self.day = day
        self.high = high
        self.low = low
        self.rain_chance = rain_chance

    def describe(self):
        return f"{self.day}: {self.high}°C / {self.low}°C ({self.rain_chance}% rain)"

    def needs_coat(self):
        if self.high < 12 or self.rain_chance >= 50:
            return True
        else:
            return False

    def is_warm(self):
        if self.high >= 15:
            return True
        else:
            return False
```

## What is an API?

An **API** (application programming interface) lets one program ask another program for data or a service. We use APIs to get things we can't make ourselves. We don't own any weather stations, but Open-Meteo does, and its API lets us ask for their forecasts.

### Think of a restaurant

- **You, the customer,** are our code. You want food, but you can't walk into the kitchen.
- **The menu** is the API docs. It lists what you can order and how to ask for it.
- **The waiter** is the API. It takes your order, passes it to the kitchen in a way the kitchen understands, and brings your food back.
- **The chef** is the server. It has the ingredients (the weather data) and makes your order.
- **The food** is the response: data you can use straight away.

You never need to know how the kitchen works. You only need to know how to order.

| In the restaurant | In our code |
|---|---|
| Reading the menu | Reading the Open-Meteo docs |
| Your order: what you want, and how much | `params`: where, which daily stats, how many days |
| Giving your order to the waiter | `requests.get(FORECAST_URL, params=params)` |
| The waiter says "coming right up" | `response.status_code` is `200` |
| The waiter says "we don't serve that" | An error status, such as `400` for a misspelled stat |
| The food arrives, ready to eat | `response.json()` gives us a dictionary |

## Walkthrough: your first API call (about 20 minutes)

Type along. Each step says what we need and what to look for.

Docs: [Open-Meteo forecast API](https://open-meteo.com/en/docs)

### 1. Ask the forecast API for campus weather with `requests.get()`

`params` is a dictionary of parameters that we give to `requests.get()` to get the data we want.

**Task:** look through the docs to find out which parameter lets you collect the following daily stats:

- `temperature_2m_max`
- `temperature_2m_min`
- `precipitation_probability_max`
- `weather_code`

We need to give the request the latitude, the longitude and the number of forecast days as well.

<details>
<summary>Answer</summary>

```python
params = {
    "latitude": CAMPUS_LATITUDE,
    "longitude": CAMPUS_LONGITUDE,
    "daily": "temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code",
    "timezone": "Europe/London",
    "forecast_days": 5,
}
response = requests.get(FORECAST_URL, params=params)
```

</details>

### 2. Check the request worked with the status code

Every response comes with a status code. `200` means it worked.

**Task:** print the status code stored on `response`.

<details>
<summary>Answer</summary>

```python
print(response.status_code)
```

</details>

### 3. Turn the response into a dictionary with `.json()`

The API sends its data back as JSON. `.json()` turns it into a Python dictionary.

**Task:** call `.json()` on `response` and store the result in `data`.

<details>
<summary>Answer</summary>

```python
data = response.json()
```

</details>

### 4. Explore what came back

`data` is a dictionary, and `data["daily"]` is another dictionary inside it.

**Task:** print the keys of `data`, then the keys of `data["daily"]`.

<details>
<summary>Answer</summary>

```python
print(data.keys())
print(data["daily"].keys())
```

</details>

### 5. Look at the daily data

Each key in `data["daily"]` holds a list with one value per day.

**Task:** print the list of dates and the list of highs. What do these lists remind you of from last week?

<details>
<summary>Answer</summary>

```python
print(data["daily"]["time"])
print(data["daily"]["temperature_2m_max"])

# Lists that line up by position, like last week's names and marks
```

</details>

### 6. Make a `DayForecast` for the first day

We need the date, high, low and rain chance for the first day. Each one is at position `[0]` of its own list in `daily`.

**Task:** fill in `DayForecast(...)` using position `[0]` of each list, then print its `describe()`.

<details>
<summary>Answer</summary>

```python
daily = data["daily"]
first_day = DayForecast(
    daily["time"][0],
    daily["temperature_2m_max"][0],
    daily["temperature_2m_min"][0],
    daily["precipitation_probability_max"][0],
)
print(first_day.describe())
```

</details>

### 7. Put it all in a function, `get_forecast(latitude, longitude)`

It sends the request, makes a `DayForecast` for every day, and returns them in a list.

**Task:** reuse your code from steps 1 to 6, but loop over every position instead of only `[0]`.

<details>
<summary>Answer</summary>

```python
def get_forecast(latitude, longitude):
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code",
        "timezone": "Europe/London",
        "forecast_days": 5,
    }
    response = requests.get(FORECAST_URL, params=params)
    daily = response.json()["daily"]

    week = []
    for i in range(len(daily["time"])):
        day = DayForecast(
            daily["time"][i],
            daily["temperature_2m_max"][i],
            daily["temperature_2m_min"][i],
            daily["precipitation_probability_max"][i],
        )
        week.append(day)
    return week

week = get_forecast(CAMPUS_LATITUDE, CAMPUS_LONGITUDE)
print(len(week), "days")
```

</details>

If the weather service gives you an error, set `USE_SAMPLE_DATA = True` in the setup cell at the top, run it, then run the backup cell below.

```python
#Backup: run this if your get_forecast isn't working
def get_forecast(latitude, longitude):
    if USE_SAMPLE_DATA:
        daily = SAMPLE_FORECAST["daily"]
    else:
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "daily": "temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code",
            "timezone": "Europe/London",
            "forecast_days": 5,
        }
        response = requests.get(FORECAST_URL, params=params)
        daily = response.json()["daily"]

    week = []
    for i in range(len(daily["time"])):
        day = DayForecast(
            daily["time"][i],
            daily["temperature_2m_max"][i],
            daily["temperature_2m_min"][i],
            daily["precipitation_probability_max"][i],
        )
        week.append(day)
    return week
```

## Build the app

Write the body of each function under its comments. Test it on `test_week` first, then on the real `week`.

Run this cell first.

```python
# Fixed test data, so you know what to expect
test_week = [
    DayForecast("Mon", 10, 3, 70),
    DayForecast("Tue", 14, 6, 20),
    DayForecast("Wed", 17, 9, 15),
    DayForecast("Thu", 12, 5, 55),
    DayForecast("Fri", 11, 4, 60),
]

dry_week = [
    DayForecast("Sat", 15, 8, 10),
    DayForecast("Sun", 13, 7, 30),
]

# The real forecast
week = get_forecast(CAMPUS_LATITUDE, CAMPUS_LONGITUDE)
```

### 1. Show the week (10 minutes)

```python
def show_week(week):
    # Print describe() for every day in week
```

Expect:

```
Mon: 10°C / 3°C (70% rain)
Tue: 14°C / 6°C (20% rain)
Wed: 17°C / 9°C (15% rain)
Thu: 12°C / 5°C (55% rain)
Fri: 11°C / 4°C (60% rain)
```

```python
show_week(test_week)
```

```python
show_week(week)
```

<details>
<summary>Answer</summary>

```python
def show_week(week):
    # Print describe() for every day in week
    for day in week:
        print(day.describe())
```

</details>

### 2. Which days need a coat? (15 minutes)

```python
def show_coat_days(week):
    # Print "Bring a coat on:", then each day that needs a coat, indented with two spaces.
    # If no day needs a coat, print "No coat needed this week." instead.
```

Expect:

```
Bring a coat on:
  Mon
  Thu
  Fri
No coat needed this week.
```

```python
show_coat_days(test_week)
show_coat_days(dry_week)
```

```python
show_coat_days(week)
```

<details>
<summary>Answer</summary>

```python
def show_coat_days(week):
    # Print "Bring a coat on:", then each day that needs a coat, indented with two spaces.
    # If no day needs a coat, print "No coat needed this week." instead.
    coat_days = []
    for day in week:
        if day.needs_coat():
            coat_days.append(day.day)

    if len(coat_days) == 0:
        print("No coat needed this week.")
    else:
        print("Bring a coat on:")
        for day_name in coat_days:
            print(f"  {day_name}")
```

</details>

### 3. Warmest day (15 minutes)

```python
def show_warmest_day(week):
    # Find the day with the highest high and print it like: Warmest day: Wed (17°C)
    # If that day is_warm(), also print "That counts as warm!"
```

Expect:

```
Warmest day: Wed (17°C)
That counts as warm!
```

```python
show_warmest_day(test_week)
```

```python
show_warmest_day(week)
```

<details>
<summary>Answer</summary>

```python
def show_warmest_day(week):
    # Find the day with the highest high and print it like: Warmest day: Wed (17°C)
    # If that day is_warm(), also print "That counts as warm!"
    warmest = week[0]
    for day in week:
        if day.high > warmest.high:
            warmest = day

    print(f"Warmest day: {warmest.day} ({warmest.high}°C)")
    if warmest.is_warm():
        print("That counts as warm!")
```

</details>

### 4. The menu (20 minutes)

Fill in the `?` so each option calls the right function, and `q` ends the loop. Try every option, then quit with `q`.

If the cell won't stop, press the stop button beside it.

```python
def run_app():
    week = get_forecast(CAMPUS_LATITUDE, CAMPUS_LONGITUDE)

    running = True
    while running:
        print()
        print("=== Campus weather ===")
        print("1  Show the week")
        print("2  Which days need a coat?")
        print("3  Warmest day")
        print("q  Quit")

        choice = input("Choose an option: ")

        if choice == "1":
            ?
        elif choice == "2":
            ?
        elif choice == "3":
            ?
        elif choice == "q":
            print("Bye!")
            running = ?
        else:
            print("Please type 1, 2, 3 or q.")

run_app()
```

<details>
<summary>Answer</summary>

```python
def run_app():
    week = get_forecast(CAMPUS_LATITUDE, CAMPUS_LONGITUDE)

    running = True
    while running:
        print()
        print("=== Campus weather ===")
        print("1  Show the week")
        print("2  Which days need a coat?")
        print("3  Warmest day")
        print("q  Quit")

        choice = input("Choose an option: ")

        if choice == "1":
            show_week(week)
        elif choice == "2":
            show_coat_days(week)
        elif choice == "3":
            show_warmest_day(week)
        elif choice == "q":
            print("Bye!")
            running = False
        else:
            print("Please type 1, 2, 3 or q.")

run_app()
```

</details>

## Tidy your code (15 minutes)

```python
# Messy but working. What would you change?
def f(w):
    x = []
    for d in w:
        if d.high < 12 or d.rain_chance >= 50:
            x.append(d.day)
    if len(x) == 0:
        print("No coat needed this week.")
    else:
        print("Bring a coat on:")
        for d in x:
            print(d)

f(test_week)
```

<details>
<summary>Answer</summary>

Same output, clearer names, and the coat rule lives in one place.

```python
def show_coat_days(week):
    coat_days = []
    for day in week:
        if day.needs_coat():
            coat_days.append(day.day)

    if len(coat_days) == 0:
        print("No coat needed this week.")
    else:
        print("Bring a coat on:")
        for day_name in coat_days:
            print(f"  {day_name}")

show_coat_days(test_week)
```

</details>

Go through your notebook and tick off each one:

- [ ] Every name says what it holds. No `x`, `d` or `data2`.
- [ ] Each function does one job.
- [ ] The URLs and coordinates are only in the setup cell.
- [ ] Anything that confused you has a short comment.
- [ ] Add a text cell at the top saying what the notebook does and how to run it.

Then choose **Runtime > Restart session and run all**. When the menu asks, type `q`.

## Stretch tasks

### Stretch A: Search for a city

Docs: [Open-Meteo geocoding API](https://open-meteo.com/en/docs/geocoding-api)

```python
def find_place(name):
    # Ask the geocoding API for the place called name (send "name" and "count": 1).
    # Return the first result, or None if nothing matched.
```

Expect Coventry's details, then `None`.

```python
place = find_place("Coventry")
print(place["name"], place["country"], place["latitude"], place["longitude"])

print(find_place("Nowhereville"))
```

<details>
<summary>Answer</summary>

```python
def find_place(name):
    # Ask the geocoding API for the place called name (send "name" and "count": 1).
    # Return the first result, or None if nothing matched.
    params = {"name": name, "count": 1}
    response = requests.get(GEOCODING_URL, params=params)
    data = response.json()

    if "results" in data:
        return data["results"][0]
    else:
        return None
```

</details>

Now add option `4` to your menu: ask for a city with `input()`, call `find_place`, then get that place's forecast.

<details>
<summary>Answer</summary>

```python
def run_app():
    place_name = "Campus"
    week = get_forecast(CAMPUS_LATITUDE, CAMPUS_LONGITUDE)

    running = True
    while running:
        print()
        print(f"=== {place_name} weather ===")
        print("1  Show the week")
        print("2  Which days need a coat?")
        print("3  Warmest day")
        print("4  Change place")
        print("q  Quit")

        choice = input("Choose an option: ")

        if choice == "1":
            show_week(week)
        elif choice == "2":
            show_coat_days(week)
        elif choice == "3":
            show_warmest_day(week)
        elif choice == "4":
            search = input("Type a city or town: ")
            place = find_place(search)
            if place is None:
                print(f"Couldn't find {search}.")
            else:
                place_name = place["name"]
                week = get_forecast(place["latitude"], place["longitude"])
        elif choice == "q":
            print("Bye!")
            running = False
        else:
            print("Please type 1, 2, 3, 4 or q.")

run_app()
```

</details>

### Stretch B: Weather in words

The API sends each day's weather as a number. Write `code_to_words`.

```python
WEATHER_WORDS = {
    0: "Clear sky",
    1: "Mostly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Freezing fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    56: "Light freezing drizzle",
    57: "Freezing drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Freezing rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Showers",
    81: "Heavy showers",
    82: "Violent showers",
    85: "Snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with heavy hail",
}

def code_to_words(code):
    # Return the words for code, or "Unknown weather" if code isn't in WEATHER_WORDS
```

```python
print("Correct:", code_to_words(61) == "Light rain")
print("Correct:", code_to_words(999) == "Unknown weather")
```

<details>
<summary>Answer</summary>

```python
def code_to_words(code):
    # Return the words for code, or "Unknown weather" if code isn't in WEATHER_WORDS
    if code in WEATHER_WORDS:
        return WEATHER_WORDS[code]
    else:
        return "Unknown weather"
```

</details>

Now print the words for each day of the real forecast. Any `Unknown weather`? Find the full list of codes in the forecast docs and add the missing ones to `WEATHER_WORDS`.

<details>
<summary>Answer</summary>

```python
if USE_SAMPLE_DATA:
    daily = SAMPLE_FORECAST["daily"]
else:
    params = {
        "latitude": CAMPUS_LATITUDE,
        "longitude": CAMPUS_LONGITUDE,
        "daily": "weather_code",
        "timezone": "Europe/London",
        "forecast_days": 5,
    }
    daily = requests.get(FORECAST_URL, params=params).json()["daily"]

for i in range(len(daily["time"])):
    print(f"{daily['time'][i]}: {code_to_words(daily['weather_code'][i])}")
```

</details>
