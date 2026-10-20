---
title: 'Workshop 2'
course: 'Python Course'
description: 'Lists, loops and functions.'
date: 2026-10-22
order: 2
authors: ['jan-lindroos', 'max-ambaum', 'sam-turner', 'shaana-amarawickrama', 'tanvi-patnayukuni']
---

Follow along with the [notes](https://colab.research.google.com/drive/1JIrMytFGmJMdmrGIFZbxCLxTLjY_H7aO), then work through the lab below.

Two labs on lists, loops and functions. Extensions are optional.

## Lab 1: Lists and loops

### Getting started

- Open the [lab notebook in Colab](https://colab.research.google.com/drive/14Acf6nVJrSWZDpnnhd2gpwjwck3cFVVY) and save your own copy.
- Click the **play button** beside a code cell to run it. Work from top to bottom.
- Double-click text to edit an answer. Click outside when done.

### Exercise 1

What do you think the outputs from the following expressions will be? Fill in the expected value column, then run each cell and record the observed value.

| Expression | Expected value | Observed value |
|---|---|---|
| `5 in [1, 5]` | | |
| `3 in [1, 5]` | | |
| `["fish", "eggs", "bread"][0]` | | |
| `len(["fish", "eggs", "bread"])` | | |
| `len([])` | | |

```python
print(5 in [1, 5])
```

```python
print(3 in [1, 5])
```

```python
print(["fish", "eggs", "bread"][0])
```

```python
print(len(["fish", "eggs", "bread"]))
```

```python
print(len([]))
```

<details>
<summary>Answer</summary>

| Expression | Expected value | Observed value |
|---|---|---|
| `5 in [1, 5]` | `True` | `True` |
| `3 in [1, 5]` | `False` | `False` |
| `["fish", "eggs", "bread"][0]` | `fish` | `fish` |
| `len(["fish", "eggs", "bread"])` | `3` | `3` |
| `len([])` | `0` | `0` |

`in` checks whether a value is in the list. `[0]` picks the first item, because indexing starts at zero. `len` counts the items, and an empty list has none.

</details>

### Exercise 2

What is the output of the following code?

```python
for i in range(0, 5):
    print(i-1)
```

<details>
<summary>Answer</summary>

`range(0, 5)` gives `0, 1, 2, 3, 4`. Each is printed with one subtracted, so the output is `-1`, `0`, `1`, `2`, `3` on separate lines.

</details>

### Exercise 3

Complete the code (fill in the `?`) below using a loop to build a new list called `result`. For each number in `start_list`:

- If it is less than 3, add it to `result` unchanged.
- Otherwise, add 0 to `result` instead.

Keep the numbers in the same order.

```python
start_list = [1, 2, 3, 2, 1, 5, 3, 2, 1]
result = []

for ? in start_list:
    if ?:
        result.append(?)
    else:
        ?

expected_result = [1, 2, 0, 2, 1, 0, 0, 2, 1]
print(result)
print("Correct:", result == expected_result)
```

<details>
<summary>Answer</summary>

Loop over each `number`, keep it if it is less than 3, and append `0` otherwise.

```python
start_list = [1, 2, 3, 2, 1, 5, 3, 2, 1]
result = []

for number in start_list:
    if number < 3:
        result.append(number)
    else:
        result.append(0)

expected_result = [1, 2, 0, 2, 1, 0, 0, 2, 1]
print(result)
print("Correct:", result == expected_result)
```

</details>

### Extension A: Slicing

Write an expression using list slicing to get `[1, 5, 9]` from the following list.

```python
pi = [3, 1, 4, 1, 5, 9, 2]

# Finish the following expression
print(pi[?:?])
```

<details>
<summary>Answer</summary>

A slice `pi[start:stop]` includes index `start` and stops *before* `stop`. `1` is at index 3 and `9` is at index 5, so use `pi[3:6]`.

```python
pi = [3, 1, 4, 1, 5, 9, 2]

print(pi[3:6])
```

</details>

### Extension B: Words and sentences

Find a way to go from `"Hello my name is Max"` to `["Hello", "my", "name", "is", "Max"]` using string functions (please ask if you are lost here). Once you have done this, try to go backwards using a for loop (from the list to the string).

<details>
<summary>Answer</summary>

`split` breaks a string into a list of words, splitting on spaces by default.

To go backwards with a loop, add each word followed by a space, then use `strip` to remove the trailing space. Python also has a shortcut for this, `" ".join(words)`.

```python
sentence = "Hello my name is Max"
words = sentence.split()
print(words)

rebuilt = ""
for word in words:
    rebuilt = rebuilt + word + " "
rebuilt = rebuilt.strip()
print(rebuilt)
print("Correct:", rebuilt == sentence)

# Without a loop
print(" ".join(words))
```

</details>

### Extension C: Change the list in place

Modify your solution to exercise 3 to not use a `result` list and to operate on `start_list` itself.

<details>
<summary>Answer</summary>

To change the list in place, loop over the *indices* with `range(len(start_list))` and overwrite each item that is 3 or more with `0`.

```python
start_list = [1, 2, 3, 2, 1, 5, 3, 2, 1]

for i in range(len(start_list)):
    if start_list[i] >= 3:
        start_list[i] = 0

expected_result = [1, 2, 0, 2, 1, 0, 0, 2, 1]
print(start_list)
print("Correct:", start_list == expected_result)
```

</details>

## Lab 2: While loops and functions

### Exercise 4

Let's begin by cleaning up some data. The list below needs all of the unlucky `13.0` values removed, without using another list. Fill in the skeleton code to make the while loop clean the list.

<details>
<summary>Hint</summary>

`data.remove(value)` removes the first occurrence of `value` from `data`. If the value appears more than once, you'll need to remove it repeatedly!

</details>

```python
data = [12.5, 8.3, 13.0, 9.1, 21.4, 6.8, 17.2, 13.0, 4.6, 19.5,
        11.2, 7.4, 23.1, 13.0, 10.8, 3.5, 18.9, 14.2, 13.0, 20.3,
        9.6, 22.8, 12.1, 8.9, 13.0, 6.2, 24.7, 11.8, 17.5, 13.0]

while 13.0 ?:
    data.?(13.0)

expected_data = [12.5, 8.3, 9.1, 21.4, 6.8, 17.2, 4.6, 19.5,
                 11.2, 7.4, 23.1, 10.8, 3.5, 18.9, 14.2, 20.3,
                 9.6, 22.8, 12.1, 8.9, 6.2, 24.7, 11.8, 17.5]
print(data)
print("Correct:", data == expected_data)
```

<details>
<summary>Answer</summary>

Keep removing `13.0` for as long as the list still contains it. `remove` only takes out the first occurrence, so the `while` loop repeats until `13.0 in data` is `False`.

```python
while 13.0 in data:
    data.remove(13.0)
```

</details>

### Exercise 5

Fill in the `?` so that the following code never prints anything.

```python
while ?:
    print("You shouldn't be seeing this!")
```

<details>
<summary>Answer</summary>

The loop body only runs while the condition is true, so a condition of `False` means it never runs. Any condition that is always false works, such as `1 > 2`.

```python
while False:
    print("You shouldn't be seeing this!")
```

</details>

### Exercise 6

Write a function that takes in two numbers, `a` and `b`. This function should add them if `a > b`, and subtract `b` from `a` otherwise. It should return this result. Call it `number_modifier`, and check that all of the examples below print `True`.

```python
"""
Put your code here!
"""

print(number_modifier(5, 3) == 8)
print(number_modifier(3, 5) == -2)
print(number_modifier(4, 4) == 0)
print(number_modifier(0, 0) == 0)
print(number_modifier(-2, -5) == -7)
print(number_modifier(-5, -2) == -3)
print(number_modifier(2.5, 1.5) == 4.0)
```

<details>
<summary>Answer</summary>

Use `if a > b` to choose between adding and subtracting, and `return` the result in each branch.

```python
def number_modifier(a, b):
    if a > b:
        return a + b
    else:
        return a - b
```

</details>

### Extension D: Inside and outside a function

What will this code output? Will it even run? What will the final value of `number` be? Once you have answered, run it and see if you were correct.

```python
number = 0
def f(number):
    number += 1
    return number

print(f(5))
print(number)
```

<details>
<summary>Answer</summary>

It runs, and prints `6` then `0`.

Inside `f`, `number` is the *parameter*, a separate local variable that starts as `5`. Adding one makes it `6`, which is returned. The `number = 0` outside the function is never touched, so its final value is still `0`.

</details>

### Extension E: A function for exercise 3

Turn your solution to exercise 3 into a function that takes a list and returns the modified list.

<details>
<summary>Answer</summary>

Wrap the exercise 3 loop in a function. This version builds a new list and returns it, so the original list is left unchanged.

```python
def replace_large(numbers):
    result = []
    for number in numbers:
        if number < 3:
            result.append(number)
        else:
            result.append(0)
    return result

start_list = [1, 2, 3, 2, 1, 5, 3, 2, 1]
expected_result = [1, 2, 0, 2, 1, 0, 0, 2, 1]
print(replace_large(start_list))
print("Correct:", replace_large(start_list) == expected_result)
```

</details>
