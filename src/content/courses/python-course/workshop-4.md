---
title: 'Workshop 4'
course: 'Python Course'
description: 'Dictionaries, classes and objects, using weather forecasts as the example.'
order: 4
---

We code three short examples together, and after each part you try a lab on weather forecasts. Next week you reuse the `DayForecast` class you build here in a terminal weather app. Extensions are optional.

### Getting started (2 minutes)

- Open [Google Colab](https://colab.research.google.com/) and choose **File > New notebook in Drive**.
- Copy each code block from this page into a new code cell with **+ Code**, fill in any `?`, then click the **play button** to run it. Work from top to bottom.
- Write your predictions and table answers in a text cell with **+ Text**, or on paper.

## Part 1: From lists to dictionaries

### Walkthrough: who got 70 or above? (about 10 minutes)

Type along while we code it on screen. Each comment says what we're about to write.

```python
# 1. Make a list of student names and a list of their marks, in the same order
students = ["Ada", "Ben", "Chloe", "Dan"]
marks = [72, 58, 84, 70]
```

```python
# 2. Loop through the marks and count how many are 70 or above
high_count = 0
for mark in marks:
    if mark >= 70:
        high_count += 1
print(high_count)
```

```python
# 3. Print the name of every student with 70 or above, using the position in both lists
for i in range(len(students)):
    if marks[i] >= 70:
        print(students[i])
```

```python
# 4. Put the counting in a function, count_high_marks(marks), that returns the count
def count_high_marks(marks):
    count = 0
    for mark in marks:
        if mark >= 70:
            count += 1
    return count

print(count_high_marks(marks))
```

```python
# 5. Remove one mark from the marks list only, then run step 3 again. Are the names still right?
marks.pop(1)
for i in range(len(marks)):
    if marks[i] >= 70:
        print(students[i])  # Misaligned! Dan's mark (70) is now paired with Chloe's name.
```

### f-strings

Put `f` before a string and Python replaces anything in `{}` with its value.

```python
day_name = "Friday"
high_temp = 11
low_temp = 4

summary = f"{day_name} will reach a high of {high_temp}°C and a low of {low_temp}°C."
print(summary)
```

### Walkthrough: one dictionary instead of two lists (about 10 minutes)

Two lists only work while their positions line up. A **dictionary** stores each mark under the student's name, so you look it up directly.

```python
# 1. Make a dictionary that maps each student's name to their mark
marks_dict = {"Ada": 72, "Ben": 58, "Chloe": 84, "Dan": 70}
```

```python
# 2. Look up one student's mark by name
print(marks_dict["Ada"])
```

```python
# 3. Loop with .items() and print every student with 70 or above, using an f-string
for name, mark in marks_dict.items():
    if mark >= 70:
        print(f"{name}: {mark}")
```

```python
# 4. Add a new student, change a mark, and remove a student with del
marks_dict["Eve"] = 91
marks_dict["Ben"] = 65
del marks_dict["Dan"]
print(marks_dict)
```

```python
# 5. Look up a name that isn't in the dictionary and read the error
print(marks_dict["Zoe"])
```

### Dictionaries in short

Dictionaries turn up wherever you look something up by name: contacts and phone numbers, items and prices, words and how often they appear. Websites send data as dictionaries too, and next week's weather data arrives as one.

| To do this | Write |
|---|---|
| Make a dictionary | `marks = {"Ada": 72, "Ben": 58}` |
| Look up a value | `marks["Ada"]` |
| Check a key exists | `"Ada" in marks` |
| Change or add a value | `marks["Ben"] = 61` |
| Remove a key | `del marks["Ben"]` |
| Loop over keys and values | `for name, mark in marks.items():` |

Looking up a key that doesn't exist gives a **`KeyError`**. Dictionaries always use square brackets, never `marks.Ada`.

## Lab 1: Dictionaries

### 1. Predict, run, explain (7 minutes)

`forecast = {"day": "Friday", "high": 11, "low": 4, "rain_chance": 60}`

Predict each value, then run the cells and record the results.

| Expression | Predicted value | Observed value |
|---|---|---|
| `forecast["low"]` | | |
| `forecast["high"] - forecast["low"]` | | |
| `"low" in forecast` | | |
| `4 in forecast` | | |
| `f"{forecast['day']}: {forecast['high']}°C"` | | |

```python
forecast = {"day": "Friday", "high": 11, "low": 4, "rain_chance": 60}
forecast["low"]
```

```python
forecast["high"] - forecast["low"]
```

```python
"low" in forecast
```

```python
4 in forecast
```

```python
f"{forecast['day']}: {forecast['high']}°C"
```

<details>
<summary>Answer</summary>

| Expression | Predicted value | Observed value |
|---|---|---|
| `forecast["low"]` | `4` | `4` |
| `forecast["high"] - forecast["low"]` | `7` | `7` |
| `"low" in forecast` | `True` | `True` |
| `4 in forecast` | `False` | `False` |
| `f"{forecast['day']}: {forecast['high']}°C"` | `Friday: 11°C` | `Friday: 11°C` |

`in` checks the keys, not the values, so `4 in forecast` is `False` even though `4` is one of the values.

</details>

Fill in the `?` with the right keys. Inside an f-string, put single quotes round each key, like `forecast['day']`. Expect:

`Friday: high of 11°C, low of 4°C, 60% chance of rain`

<details>
<summary>Hint</summary>

Look at the key names in `forecast`.

</details>

```python
forecast = {"day": "Friday", "high": 11, "low": 4, "rain_chance": 60}

report = f"{forecast['?']}: high of {forecast['?']}°C, low of {forecast['?']}°C, {forecast['?']}% chance of rain"

expected = "Friday: high of 11°C, low of 4°C, 60% chance of rain"
print(report)
print("Correct:", report == expected)
```

<details>
<summary>Answer</summary>

```python
report = f"{forecast['day']}: high of {forecast['high']}°C, low of {forecast['low']}°C, {forecast['rain_chance']}% chance of rain"
```

</details>

### 2. Update the forecast (5 minutes)

Friday's forecast has changed. Fill in the `?` to:

1. Set `"high"` to **14**.
2. Lower `"rain_chance"` by **20**.
3. Add `"uv_index"` with the value **2**.

```python
forecast = {"day": "Friday", "high": 11, "low": 4, "rain_chance": 60}

# 1. Update "high" to 14
forecast[?] = ?

# 2. Subtract 20 from the current "rain_chance"
forecast[?] = ?

# 3. Add a new key "uv_index" with value 2
?

expected = {"day": "Friday", "high": 14, "low": 4, "rain_chance": 40, "uv_index": 2}
print(forecast)
print("Correct:", forecast == expected)
```

<details>
<summary>Answer</summary>

Assigning to a key changes its value. Assigning to a key that doesn't exist yet adds it.

```python
forecast["high"] = 14
forecast["rain_chance"] = forecast["rain_chance"] - 20
forecast["uv_index"] = 2
```

</details>

### 3. Find the wet hours (6 minutes)

`hourly_rain` maps times to the chance of rain. Fill in the `?` to add every hour with a chance of **50 or more** to `wet_hours`. Expect `['12:00 (65%)', '15:00 (80%)']`.

<details>
<summary>Hint</summary>

Which loop variable holds the number to compare with 50?

</details>

```python
hourly_rain = {"09:00": 20, "12:00": 65, "15:00": 80, "18:00": 30}
wet_hours = []

for hour, chance in hourly_rain.?:
    if ?:
        wet_hours.append(f"{?} ({?}%)")

expected = ["12:00 (65%)", "15:00 (80%)"]
print("Wet hours:", wet_hours)
print("Correct:", wet_hours == expected)
```

<details>
<summary>Answer</summary>

`.items()` gives each key and value together. Compare `chance` with 50, and build the text from both.

```python
for hour, chance in hourly_rain.items():
    if chance >= 50:
        wet_hours.append(f"{hour} ({chance}%)")
```

</details>

### Extension A: Fix two bugs

Run each cell and read the last line of its error. Fill in the table, then fix the code. Expect **60** and **11**.

| Bug | Error type | Cause | What I changed |
|---|---|---|---|
| Rain chance | | | |
| High | | | |

<details>
<summary>Hint</summary>

Compare the key in the first error with the keys in `forecast`, letter by letter. How does the table above look up a value?

</details>

```python
forecast = {"day": "Friday", "high": 11, "low": 4, "rain_chance": 60}
print(forecast["rian_chance"])
```

```python
forecast = {"day": "Friday", "high": 11, "low": 4, "rain_chance": 60}
print(forecast.high)
```

<details>
<summary>Answer</summary>

| Bug | Error type | Cause | What I changed |
|---|---|---|---|
| Rain chance | `KeyError` | The key is misspelt as `"rian_chance"` | Changed it to `forecast["rain_chance"]` |
| High | `AttributeError` | Dictionaries don't use a dot to look up values | Changed it to `forecast["high"]` |

</details>

## Part 2: From dictionaries to classes

### Walkthrough: a `Student` class (about 15 minutes)

Now each student has a name, university, course, year of study and mark. One dictionary per student works, but you type the same five keys every time, and a typo in a key goes unnoticed until something breaks. The functions that use a student also live separately from the student's data.

A **class** fixes this. It's a template for making students, and each student made from it is an **object** with the same attributes and its own methods.

```python
# 1. Make two student dictionaries with name, university, course, year and mark
s1 = {"name": "Ada", "university": "Warwick", "course": "Computer Science", "year": 1, "mark": 72}
s2 = {"name": "Ben", "university": "Warwick", "course": "Data Science", "year": 2, "mark": 58}
```

```python
# 2. Write a function is_passing(student) that takes one of those dictionaries
def is_passing(student):
    return student["mark"] >= 40

print(is_passing(s1), is_passing(s2))
```

```python
# 3. Write a Student class whose __init__ stores the five values on self
class Student:
    def __init__(self, name, university, course, year, mark):
        self.name = name
        self.university = university
        self.course = course
        self.year = year
        self.mark = mark
```

```python
# 4. Make two Student objects and read their attributes with a dot
ada = Student("Ada", "Warwick", "Computer Science", 1, 72)
ben = Student("Ben", "Warwick", "Data Science", 2, 58)
print(ada.name, ada.mark)
print(ben.name, ben.mark)
```

```python
# 5. Add an is_passing method to the class, the way .append() belongs to lists, and call it on each student
class Student:
    def __init__(self, name, university, course, year, mark):
        self.name = name
        self.university = university
        self.course = course
        self.year = year
        self.mark = mark

    def is_passing(self):
        return self.mark >= 40

ada = Student("Ada", "Warwick", "Computer Science", 1, 72)
ben = Student("Ben", "Warwick", "Data Science", 2, 58)
print(ada.is_passing())
print(ben.is_passing())
```

```python
# 6. Put the students in a list and loop through it, printing who is passing
students_list = [ada, ben]
for s in students_list:
    if s.is_passing():
        print(f"{s.name} is passing ({s.mark})")
```

### Classes: common questions

| Question | Answer |
|---|---|
| What's the difference between a class and an object? | The class is the template, like `Student`. An object is one thing made from it, like `ada = Student(...)`. |
| Why does `Student` start with a capital letter? | It's the naming convention for classes. Variables and functions stay lowercase. |
| What is `__init__`? | The method Python runs automatically when you make a new object. It sets the starting attributes. It has two underscores on each side. |
| What is `self`? | The object itself. Python passes it in for you, so you write it in every `def` but never when you call a method. |
| Why `self.mark = mark`? | The right side is the value you passed in. The left side stores it on the object so it's still there later. |
| Attribute or method? | An attribute is a stored value, read with no brackets: `ada.mark`. A method is a function, called with brackets: `ada.is_passing()`. |
| How is this like a dictionary? | Each object is like one dictionary with fixed keys, plus its own functions. `student["mark"]` becomes `ada.mark`. |
| Where are classes used? | Everywhere in Python. Lists, strings and dictionaries are all classes, which is why they have methods like `.append()` and `.items()`. Libraries hand you objects too. |

## Lab 2: Classes and objects

You can start here without finishing Lab 1. Run this cell to make two `DayForecast` objects.

```python
class DayForecast:
    def __init__(self, day, high, low, rain_chance):
        self.day = day
        self.high = high
        self.low = low
        self.rain_chance = rain_chance

# Create two separate objects from the DayForecast class
friday = DayForecast("Friday", 11, 4, 60)
saturday = DayForecast("Saturday", 16, 8, 10)

# Look up attributes on each object using dot notation
print(friday.day, "high:", friday.high)
print(saturday.day, "high:", saturday.high)
```

### 4. Predict, run, explain (6 minutes)

Using `friday` and `saturday` from above, predict each value, then run the cells.

| Expression | Predicted value | Observed value |
|---|---|---|
| `friday.low` | | |
| `saturday.high - friday.high` | | |
| `friday.rain_chance >= 50` | | |
| `saturday.high < 12` | | |

<details>
<summary>Answer</summary>

| Expression | Predicted value | Observed value |
|---|---|---|
| `friday.low` | `4` | `4` |
| `saturday.high - friday.high` | `5` | `5` |
| `friday.rain_chance >= 50` | `True` | `True` |
| `saturday.high < 12` | `False` | `False` |

</details>

Fill in the `?` to make two more forecasts:

- `sunday`: **"Sunday"**, high **9**, low **2**, rain **80**
- `monday`: **"Monday"**, high **15**, low **7**, rain **20**

<details>
<summary>Hint</summary>

Python fills in `self` for you. Pass the other four values in the order `__init__` lists them.

</details>

```python
sunday = DayForecast(?)
monday = ?

print("Correct Sunday:", sunday.day == "Sunday" and sunday.high == 9 and sunday.low == 2 and sunday.rain_chance == 80)
print("Correct Monday:", monday.day == "Monday" and monday.high == 15 and monday.low == 7 and monday.rain_chance == 20)
```

<details>
<summary>Answer</summary>

```python
sunday = DayForecast("Sunday", 9, 2, 80)
monday = DayForecast("Monday", 15, 7, 20)
```

</details>

### 5. Build `DayForecast` (12 minutes)

Next week's app needs these methods. Fill in the `?` so that:

1. `__init__` stores all four values on `self`.
2. `describe()` returns text like `Friday: 11°C / 4°C (60% rain)`.
3. `needs_coat()` returns `True` if the high is below **12** or the rain chance is **50 or more**, and `False` otherwise.

Expect every check to print `True`.

<details>
<summary>Hint</summary>

Every attribute lives on `self`. Sunday has exactly 50% rain: which comparison catches that?

</details>

```python
class DayForecast:
    def __init__(self, day, high, low, rain_chance):
        self.day = day
        ?
        ?
        ?

    def describe(self):
        return f"{?}: {?}°C / {?}°C ({?}% rain)"

    def needs_coat(self):
        if ?:
            return True
        else:
            return False

friday = DayForecast("Friday", 11, 4, 60)
saturday = DayForecast("Saturday", 16, 8, 10)
sunday = DayForecast("Sunday", 14, 6, 50)

print("Correct describe:", friday.describe() == "Friday: 11°C / 4°C (60% rain)")
print("Correct Friday coat (Expected True):", friday.needs_coat() == True)
print("Correct Saturday coat (Expected False):", saturday.needs_coat() == False)
print("Correct Sunday coat at 50% boundary (Expected True):", sunday.needs_coat() == True)
```

<details>
<summary>Answer</summary>

Every value is stored on `self`, and every method reads it back from `self`. Use `>=` so that exactly 50% rain still needs a coat.

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
```

</details>

### 6. Write your own method (8 minutes)

Write a method `is_warm()` inside the class. It returns `True` if the high is **15 or more**, and `False` otherwise. This time there are no `?` to fill in: write the whole method yourself. Expect `Correct: True`.

<details>
<summary>Hint</summary>

Copy the shape of `needs_coat`: a `def` line that takes `self`, then a comparison on `self.high`. Sunday is exactly 15.

</details>

```python
# Add is_warm to your DayForecast class from task 5, then run this cell
friday = DayForecast("Friday", 11, 4, 60)
saturday = DayForecast("Saturday", 16, 8, 10)
sunday = DayForecast("Sunday", 15, 6, 50)

print("Correct:", friday.is_warm() == False and saturday.is_warm() == True and sunday.is_warm() == True)
```

<details>
<summary>Answer</summary>

Add this method inside the class. A comparison is already `True` or `False`, so you can return it directly.

```python
    def is_warm(self):
        return self.high >= 15
```

</details>

### Lab 2 check (1 minute)

If you edit a class, objects you made earlier keep the old version. For a fresh check, choose **Runtime > Restart session**, then run your cells in order from the top.

### Extension B: Fix `clothing_advice`

A method can call another method on the same object. The `clothing_advice` method below has two bugs. Run the cell, read the error, fix it, and run it again. Expect `Correct: True`.

<details>
<summary>Hint</summary>

Compare the `def clothing_advice` line with `def describe`. Then ask: how does `needs_coat()` know which forecast to check?

</details>

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

    # Fix the two bugs in this method:
    def clothing_advice():
        if needs_coat():
            return f"{self.day}: Bring a coat"
        else:
            return f"{self.day}: No coat needed"

friday = DayForecast("Friday", 11, 4, 60)
saturday = DayForecast("Saturday", 16, 8, 10)

print("Correct:", (friday.clothing_advice() == "Friday: Bring a coat"
                   and saturday.clothing_advice() == "Saturday: No coat needed"))
```

<details>
<summary>Answer</summary>

Every method needs `self` as its first parameter, and calls another method on the same object with `self.`.

```python
    def clothing_advice(self):
        if self.needs_coat():
            return f"{self.day}: Bring a coat"
        else:
            return f"{self.day}: No coat needed"
```

</details>

### Extension C: Change the object

Methods can also change attributes. Fill in the `?` so `update_rain` sets the rain chance but keeps it between **0** and **100**.

<details>
<summary>Hint</summary>

`new_chance` is the value passed in. The value stored on the object is `self.rain_chance`.

</details>

```python
# Add this method to your DayForecast class
    def update_rain(self, new_chance):
        if new_chance < 0:
            ? = 0
        elif new_chance > 100:
            ? = 100
        else:
            ? = ?
```

```python
saturday = DayForecast("Saturday", 16, 8, 10)
saturday.update_rain(65)
check_1 = (saturday.rain_chance == 65 and saturday.needs_coat() == True)

saturday.update_rain(-15)
check_2 = (saturday.rain_chance == 0)

saturday.update_rain(140)
check_3 = (saturday.rain_chance == 100)

print("Correct:", check_1 and check_2 and check_3)
```

<details>
<summary>Answer</summary>

```python
    def update_rain(self, new_chance):
        if new_chance < 0:
            self.rain_chance = 0
        elif new_chance > 100:
            self.rain_chance = 100
        else:
            self.rain_chance = new_chance
```

</details>

### Extension D: A week of forecasts

Next week's app stores a forecast as a list of `DayForecast` objects. Fill in the `?` to collect each day's `describe()` text and find the warmest day. Expect `Warmest day: Wednesday (17°C)`.

<details>
<summary>Hint</summary>

Each time round the loop, `forecast` is one `DayForecast`. When its high beats `highest_temp`, update both variables.

</details>

```python
week = [
    DayForecast("Monday", 10, 3, 70),
    DayForecast("Tuesday", 14, 6, 20),
    DayForecast("Wednesday", 17, 9, 15),
    DayForecast("Thursday", 12, 5, 55),
    DayForecast("Friday", 11, 4, 60)
]

forecast_summaries = []  # The description of each day
warmest_day = week[0].day  # Start by assuming Monday is the warmest
highest_temp = week[0].high

for forecast in week:
    forecast_summaries.append(?)
    if ?:
        highest_temp = ?
        warmest_day = ?

print(f"Warmest day: {warmest_day} ({highest_temp}°C)")
print("Correct:", warmest_day == "Wednesday" and highest_temp == 17 and len(forecast_summaries) == 5)
```

<details>
<summary>Answer</summary>

```python
for forecast in week:
    forecast_summaries.append(forecast.describe())
    if forecast.high > highest_temp:
        highest_temp = forecast.high
        warmest_day = forecast.day
```

</details>

### Extension E: Make `print` work

`print(friday)` shows something like `<__main__.DayForecast object at 0x...>`. Python calls `__str__` when you print an object and shows the text it returns. Fill in the `?` so `__str__` returns `describe()`. Expect `Friday: 11°C / 4°C (60% rain)`.

<details>
<summary>Hint</summary>

How does `clothing_advice` call another method on the same object?

</details>

```python
# Add this method to your DayForecast class
    def __str__(self):
        return ?
```

```python
friday = DayForecast("Friday", 11, 4, 60)
print(friday)
print("Correct:", str(friday) == "Friday: 11°C / 4°C (60% rain)")
```

<details>
<summary>Answer</summary>

```python
    def __str__(self):
        return self.describe()
```

</details>
