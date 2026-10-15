---
title: 'Workshop 1'
course: 'WAI x UWCS x CodeSoc Python Course'
description: 'Values, conversion, decisions and debugging, using event bookings as the example.'
date: 2026-10-15
order: 1
authors: ['jan-lindroos', 'shaana-amarawickrama', 'tanvi-patnayukuni']
---

Follow along with the [slides](https://molab.marimo.io/notebooks/nb_gkSnEuamD8ZeFmazDS2JsC/app), then work through the lab below.

Two 20-minute labs on event bookings. Extensions are optional.

## Lab 1: Values and conversion

### Getting started (2 minutes)

- Open the [lab notebook in Colab](https://colab.research.google.com/github/WarwickAI/xsoc-python/blob/main/workshop1/python_lab.ipynb) and save your own copy.
- Click the **play button** beside a code cell to run it. Work from top to bottom.
- Double-click text to edit an answer. Click outside when done.

Try the cell below.

```python
greeting = "Ready to book!"
greeting
```

### 1. Predict, run, explain (3 minutes)

Predict each value and type: **string (text)**, **integer** or **float (decimal number)**. Then run the cells and record the results.

| Expression | Predicted value | Predicted type | Observed value |
|---|---|---|---|
| `"6" + "0"` | | | |
| `6 + 0` | | | |
| `60 - 25` | | | |
| `2.50 * 2` | | | |

```python
"6" + "0"
```

```python
6 + 0
```

```python
60 - 25
```

```python
2.50 * 2
```

<details>
<summary>Answer</summary>

| Expression | Predicted value | Predicted type | Observed value |
|---|---|---|---|
| `"6" + "0"` | `"60"` | string | `'60'` |
| `6 + 0` | `6` | integer | `6` |
| `60 - 25` | `35` | integer | `35` |
| `2.50 * 2` | `5.0` | float | `5.0` |

</details>

`type(value)` returns `str` for text, `int` for integers or `float` for decimal numbers. Use it to check your predictions.

Why do `"6" + "0"` and `6 + 0` differ?

```python
type("6" + "0")
```

<details>
<summary>Answer</summary>

`"6" + "0"` joins text to make `"60"`. `6 + 0` adds numbers to give `6`.

</details>

### 2. Plan an event (7 minutes)

There are **60 seats**, **25 bookings** and tickets cost **£2.50**.

1. Set `capacity`, `booked` and `ticket_price` in the first cell.
2. Calculate `spaces` and `income` in the next cell.
3. Run both. Expect **35** spaces and **62.5** in income (£62.50).

```python
# Define capacity, booked and ticket_price here.
```

```python
# Calculate spaces and income here.

print(spaces)
print(income)
```

<details>
<summary>Answer</summary>

```python
capacity = 60
booked = 25
ticket_price = 2.50
```

```python
spaces = capacity - booked
income = booked * ticket_price
print(spaces)
print(income)
```

</details>

Predict the results for **30 bookings**. Set `booked = 30` and run only that cell, then the cell below.

Why are the results unchanged? Rerun the calculation cell to update them.

Restore `booked = 25` and rerun both cells before continuing.

```python
print(spaces)
print(income)
```

<details>
<summary>Answer</summary>

With 30 bookings, expect **30 spaces** and **£75.00**.

`spaces` and `income` keep their old values until you rerun the calculations.

</details>

### 3. Read a sign-up form (5 minutes)

The form gives `"25"` bookings. One more person books.

Convert `booked_text` with `int`, add one and store it as `booked`. Calculate and display `spaces` too. Expect **26 bookings** and **34 spaces**.

```python
capacity = 60
booked_text = "25"
# Update booked, calculate spaces, and display both.
```

<details>
<summary>Answer</summary>

```python
capacity = 60
booked_text = "25"
booked = int(booked_text) + 1
spaces = capacity - booked
print(booked)
print(spaces)
```

</details>

Predict `booked_text + "1"`, then run it. Why is the result wrong for counting bookings?

```python
booked_text + "1"
```

<details>
<summary>Answer</summary>

`booked_text + "1"` joins strings to give `"251"`. Convert to an integer before adding one to get `26`.

</details>

### Lab 1 check (1 minute)

Explain why you need to:

- Rerun calculations after changing `booked`.
- Convert form text before adding one.

<details>
<summary>Answer</summary>

- Calculations must run again to use the new value of `booked`.
- `int` converts text so you can add one numerically.

</details>

### Extension A: A price from the form

Convert `"2.50"` with `float`. Calculate `income` for the **26 bookings** from task 3. Expect **65.0** (£65.00).

Why would `int` fail here?

```python
price_text = "2.50"
# Use booked from task 3 to calculate income.
```

<details>
<summary>Answer</summary>

```python
price_text = "2.50"
income = booked * float(price_text)
income
```

`float("2.50")` gives `2.5`. For 26 tickets, income is `65.0`.

`int("2.50")` raises a `ValueError` because the text contains a decimal point.

</details>

## Lab 2: Decisions and debugging

You can start here without finishing Lab 1.

### 4. Choose a message (6 minutes)

Use `if`, `elif` and `else` to set `message`. Assume bookings are non-negative integers.

| Bookings | Message |
|---|---|
| Above capacity | `Waiting list` |
| At capacity | `Full` |
| Below capacity | `Spaces available` |

Predict the messages in the table below. Write your code, then change `booked` to test each count.

```python
capacity = 60
booked = 25
# Choose message here.

print(message)
```

<details>
<summary>Answer</summary>

```python
capacity = 60
booked = 25
if booked > capacity:
    message = "Waiting list"
elif booked == capacity:
    message = "Full"
else:
    message = "Spaces available"
print(message)
```

</details>

| Bookings | Expected message | Actual message |
|---|---|---|
| 25 | | |
| 60 | | |
| 61 | | |

Why is testing exactly 60 important?

<details>
<summary>Answer</summary>

| Bookings | Expected message | Actual message |
|---|---|---|
| 25 | Spaces available | Spaces available |
| 60 | Full | Full |
| 61 | Waiting list | Waiting list |

Testing 60 checks equality. Using `>=` in the first branch would wrongly give `Waiting list`.

</details>

### 5. Fix two bugs (5 minutes)

Run each cell and read the last line of its error. Fill in the table, then fix and rerun the code. Expect **34 spaces** and **26 bookings**.

```python
capacity = 60
booked_text = "26"
capacity - booked_text
```

```python
booking_count = 26
booking_cout
```

| Bug | Error type | Cause | What I changed |
|---|---|---|---|
| Subtraction | | | |
| Booking count | | | |

<details>
<summary>Answer</summary>

```python
capacity = 60
booked_text = "26"
capacity - int(booked_text)
```

```python
booking_count = 26
booking_count
```

| Bug | Error type | Cause | What I changed |
|---|---|---|---|
| Subtraction | `TypeError` | Subtracting a string from an integer | Converted `booked_text` with `int` before subtracting |
| Booking count | `NameError` | `booking_cout` has not been defined | Corrected the spelling to `booking_count` |

</details>

### 6. Use the documentation (5 minutes)

Find the occupancy percentage for **25 bookings** in a **60-seat** room.

1. Calculate `percentage = booked / capacity * 100`.
2. Read the [documentation for `round`](https://docs.python.org/3/library/functions.html#round). Round to one decimal place and store it as `occupancy`.
3. Display the result. Expect **41.7**.

```python
capacity = 60
booked = 25
# Calculate percentage, then occupancy.
```

<details>
<summary>Answer</summary>

```python
capacity = 60
booked = 25
percentage = booked / capacity * 100
occupancy = round(percentage, 1)
print(occupancy)
print(round(percentage))
```

</details>

Compare `round(percentage, 1)` with `round(percentage)`. What changes?

Optional: test **30** and **60** bookings. Expect **50.0** and **100.0** to one decimal place.

<details>
<summary>Answer</summary>

The second input, `ndigits`, controls decimal places. `round(percentage, 1)` gives the float `41.7`. `round(percentage)` gives the integer `42`.

For 30 bookings, the one-decimal result is `50.0`. For 60 bookings, it is `100.0`.

</details>

### Lab 2 check (2 minutes)

Check your three messages, bug fixes and rounded percentage.

For a fresh check, restart the session from Colab’s **Runtime** menu. Use the play buttons to run your completed cells in order. If Lab 1 is unfinished, start at Lab 2.

<details>
<summary>Answer</summary>

- Messages: `Spaces available`, `Full`, `Waiting list`.
- Fixes: convert the text with `int` and correct the variable name.
- `round(percentage, 1)` gives one decimal place.

</details>

### Extension B: Can the whole group fit?

Set `capacity = 60` and `booked = 56`. Use `if` and `else` to set `group_message` to `Booking accepted` if a group fits, or `Not enough spaces` otherwise.

Predict and test `tickets_requested` values of **3**, **4** and **5**. Keep `booked` unchanged.

```python
# Define capacity, booked and tickets_requested, then choose group_message.
```

Why should a request for exactly four tickets be accepted?

<details>
<summary>Answer</summary>

```python
capacity = 60
booked = 56
tickets_requested = 4
spaces = capacity - booked
if tickets_requested <= spaces:
    group_message = "Booking accepted"
else:
    group_message = "Not enough spaces"
print(group_message)
```

Requests for **3** and **4** tickets give `Booking accepted`. **5** gives `Not enough spaces`.

Four tickets fill the remaining spaces exactly, so use `<=`.

</details>

### Extension C: A bug without an error message

Change `>` to `>=` in task 4. Which test catches the mistake? Try it, then restore `>`.

<details>
<summary>Answer</summary>

At **60 bookings**, `>=` gives `Waiting list` instead of `Full`. The code runs but gives the wrong answer. Restore `>`.

</details>
