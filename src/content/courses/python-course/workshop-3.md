---
title: 'Workshop 3'
course: 'Python Course'
description: 'Project ideas that use values, decisions, lists, loops and functions.'
order: 3
---

This week you build something of your own. Pick one idea below, or bring your own. Start small, get it working, then add to it. Write your code in a new notebook in [Google Colab](https://colab.research.google.com/).

## Guess the number

Python picks a random number from 1 to 100. The player keeps guessing, and each time you print **too high** or **too low** until they get it.

- Use `random.randint(1, 100)` to pick the number, `input()` to read a guess and `int()` to convert it.
- Use a `while` loop that runs until the guess is right.
- **Stretch:** count the guesses, and put the game in a function so the player can play again.

## To-do list

A menu that lets the user add a task, remove a task, show all tasks or quit.

- Store the tasks in a list, and use `append` and `remove`.
- Use a `while` loop for the menu and `if`/`elif` to choose what to do.
- **Stretch:** write one function per menu option, and number the tasks when you show them.

## Sentence stats

The user types a sentence and you print facts about it: how many words, the longest word and the average word length.

- Use `split()` to turn the sentence into a list of words, then loop over it.
- Write each fact as a function that takes the list and returns the answer.
- **Stretch:** count how many words start with each letter, or print the sentence backwards word by word.
