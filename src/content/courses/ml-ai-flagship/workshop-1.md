---
title: 'Workshop 1'
course: 'ML/AI Flagship Course'
description: 'Models, loss and learning: predict house prices, then choose how flexible a model should be.'
date: 2026-10-15
order: 1
authors: ['jan-lindroos']
---

Follow along with the [slides](https://molab.marimo.io/notebooks/nb_dK3fGU6auLMzoccLPisLZb/app), then work through the lab below.

## Lab 1: Predict house prices

### Getting started (2 minutes)

- Open the [lab notebook in Colab](https://colab.research.google.com/github/WarwickAI/intro-to-ml/blob/main/workshop1/ml_lab.ipynb) and save your own copy.
- Click the **play button** beside a code cell to run it. Work from top to bottom.
- Double-click text to edit an answer. Click outside when done.

The first cell loads four libraries:

| Library | What it does |
|---|---|
| `pandas`, shortened to `pd` | Stores data as a table called a **DataFrame**, like a spreadsheet |
| `numpy`, shortened to `np` | Does maths on a whole column of numbers at once |
| `matplotlib.pyplot`, shortened to `plt` | Draws graphs |
| `sklearn` (scikit-learn) | Ready-made machine learning models and tools |

It then loads 20,640 neighbourhoods from the 1990 California census into a table called `housing`.

| Column | Meaning |
|---|---|
| `MedInc` | Median household income, in tens of thousands of dollars (`3` means \$30,000) |
| `MedHouseVal` | Median house value, in hundreds of thousands of dollars (`2` means \$200,000) |
| Other columns | House age, rooms, population and location |

```python
import matplotlib.pyplot as plt  # Draws graphs.
import numpy as np  # Does maths on many numbers at once.
import pandas as pd  # Stores data in tables.
from sklearn.datasets import fetch_california_housing
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeRegressor

housing = fetch_california_housing(as_frame=True).frame  # Download the data as a table.
housing.head()  # Show the first five rows.
```

### 1. Look before you fit (3 minutes)

Predict: do richer neighbourhoods have more expensive houses?

| Code | What it does |
|---|---|
| `housing.sample(2000, random_state=0)` | Picks 2,000 random rows. `random_state` makes it pick the same rows every time |
| `sample["MedInc"]` | Selects one column of a table |
| `plt.scatter(x, y, s=5)` | Draws one dot for each pair of values. `s` sets the dot size |

Replace each `...` to plot income against house value.

```python
sample = housing.sample(2000, random_state=0)

incomes = sample["MedInc"]
values = ...  # Select the MedHouseVal column.

plt.scatter(incomes, values, s=5)
plt.xlabel("Median income ($10,000s)")
plt.ylabel(...)  # Label the y-axis.
plt.show()
```

<details>
<summary>Answer</summary>

```python
sample = housing.sample(2000, random_state=0)

incomes = sample["MedInc"]
values = sample["MedHouseVal"]

plt.scatter(incomes, values, s=5)
plt.xlabel("Median income ($10,000s)")
plt.ylabel("Median house value ($100,000s)")
plt.show()
```

</details>

Was your prediction right? Why is there a flat line of points at the top of the graph?

<details>
<summary>Answer</summary>

Higher incomes go with higher house values, but the points are widely spread.

The flat line at 5 appears because the census recorded every value above \$500,000 as \$500,000. Real data often has quirks like this.

</details>

### 2. Fit a model and predict (5 minutes)

Train the model as in the flat-price demo. The [`LinearRegression` documentation](https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LinearRegression.html) lists its methods: `fit` trains the model, and `predict` uses it on new inputs.

| Code | What it does |
|---|---|
| `housing[["MedInc"]]` | Selects a column as a one-column table. Models take their inputs as a table, because there can be several input columns |
| `housing["MedHouseVal"]` | Selects a single column. Outputs are one column |
| `pd.DataFrame({"MedInc": [3, 8]})` | Makes a new table with a `MedInc` column holding 3 and 8 |

Replace each `...`. Expect predictions of about **1.70** and **3.79** (\$170,000 and \$379,000).

```python
inputs = housing[["MedInc"]]
outputs = housing["MedHouseVal"]

model = LinearRegression()
# Fit the model here.

new_neighbourhoods = pd.DataFrame({"MedInc": [3, 8]})
model.predict(...)  # Predict values for the new neighbourhoods.
```

<details>
<summary>Answer</summary>

```python
inputs = housing[["MedInc"]]
outputs = housing["MedHouseVal"]

model = LinearRegression()
model.fit(inputs, outputs)

new_neighbourhoods = pd.DataFrame({"MedInc": [3, 8]})
model.predict(new_neighbourhoods)
```

</details>

Run the cell below to draw the model’s line over your sample. The model learnt two parameters: a slope and an intercept. What do they mean in words?

```python
line_ends = pd.DataFrame({"MedInc": [0, 15]})  # Predict at both ends of the x-axis.
plt.scatter(incomes, values, s=5)
plt.plot(line_ends["MedInc"], model.predict(line_ends), color="black")  # Join the two predictions.
plt.xlabel("Median income ($10,000s)")
plt.ylabel("Median house value ($100,000s)")
plt.show()
print("slope:", model.coef_[0], "intercept:", model.intercept_)
```

<details>
<summary>Answer</summary>

The slope is about 0.42: each extra \$10,000 of income adds about \$42,000 to the predicted house value. The intercept, about 0.45, is the prediction for an income of zero.

</details>

### 3. Measure the loss (4 minutes)

NumPy and pandas do arithmetic on whole columns at once.

| Code | What it does |
|---|---|
| `actual - predicted` | Subtracts each pair of values, giving one error per neighbourhood |
| `errors ** 2` | Squares every value |
| `np.mean(x)` | Averages all the values |
| `actual.mean()` | Averages a column |
| `np.full(n, value)` | Makes `n` copies of `value` |

1. Complete the MSE calculation. Expect about **0.70**. The next line checks it with scikit-learn.
2. A **baseline** model always predicts the average house value. Calculate its MSE. Expect about **1.33**.

```python
actual = outputs
predicted = model.predict(inputs)

errors = actual - predicted
mse = ...  # Square the errors, then take the mean.
print(mse)
print(mean_squared_error(actual, predicted))
```

```python
baseline = np.full(len(actual), actual.mean())  # The average, once per neighbourhood.
mean_squared_error(..., ...)  # Compare the actual values with the baseline.
```

<details>
<summary>Answer</summary>

```python
actual = outputs
predicted = model.predict(inputs)

errors = actual - predicted
mse = np.mean(errors ** 2)
print(mse)
print(mean_squared_error(actual, predicted))
```

```python
baseline = np.full(len(actual), actual.mean())  # The average, once per neighbourhood.
mean_squared_error(actual, baseline)
```

</details>

### 4. Give the model more inputs (3 minutes)

`housing.drop(columns="MedHouseVal")` makes a copy of the table without the `MedHouseVal` column. That leaves all 8 input columns.

Fit a new model on every input and calculate its MSE. Expect about **0.52**.

```python
all_inputs = housing.drop(columns="MedHouseVal")

big_model = LinearRegression()
...  # Fit big_model on all_inputs and actual.
mean_squared_error(actual, ...)  # Predict with big_model.
```

<details>
<summary>Answer</summary>

```python
all_inputs = housing.drop(columns="MedHouseVal")

big_model = LinearRegression()
big_model.fit(all_inputs, actual)
mean_squared_error(actual, big_model.predict(all_inputs))
```

</details>

The loss fell. Does that prove the new model will predict better for neighbourhoods it has not seen?

<details>
<summary>Answer</summary>

Not yet. We measured the loss on the same data the model trained on. A more flexible model can lower this loss by fitting noise, so we need data the model has not seen. The second half covers this.

</details>

### Lab 1 check (1 minute)

Explain in one sentence each:

- What a loss function measures.
- Why we compare a model against a simple baseline.

<details>
<summary>Answer</summary>

- A loss function turns a model’s errors into one number: lower means more accurate predictions.
- A baseline shows whether the model learnt anything useful. An MSE of 0.70 only means something next to the baseline’s 1.33.

</details>

### Extension A: Errors in dollars

MSE is in squared units, which are hard to picture. Calculate the mean absolute error with `mean_absolute_error`, which works like `mean_squared_error`. Expect about **0.63**. What is that in dollars?

```python
mean_absolute_error(..., ...)
```

<details>
<summary>Answer</summary>

```python
mean_absolute_error(actual, predicted)
```

The MAE is about 0.63, so a typical prediction is about \$63,000 away from the true value. The model halves the baseline’s MSE, but it still makes large errors.

</details>

### Extension B: Train the model yourself

`LinearRegression` solves for the best slope and intercept directly. Neural networks cannot do this, so they use **gradient descent**: start with a guess, then take many small downhill steps.

`.to_numpy()` turns a column into a NumPy array: a plain list of numbers that supports fast maths.

Fill in the two update lines. After 1,000 steps, expect a slope of about **0.42**, an intercept of about **0.44** and an MSE of about **0.70**, close to `LinearRegression`.

Then try a learning rate of `0.1`. What happens, and why?

```python
x = housing["MedInc"].to_numpy()
y = housing["MedHouseVal"].to_numpy()
slope, intercept = 0.0, 0.0
learning_rate = 0.01

for step in range(1000):
    error = slope * x + intercept - y  # Forward pass, then compare with the answers.
    slope_gradient = 2 * np.mean(error * x)
    intercept_gradient = 2 * np.mean(error)
    slope = ...  # Step slope downhill.
    intercept = ...  # Step intercept downhill.

print(slope, intercept, np.mean((slope * x + intercept - y) ** 2))
```

<details>
<summary>Answer</summary>

```python
x = housing["MedInc"].to_numpy()
y = housing["MedHouseVal"].to_numpy()
slope, intercept = 0.0, 0.0
learning_rate = 0.01

for step in range(1000):
    error = slope * x + intercept - y  # Forward pass, then compare with the answers.
    slope_gradient = 2 * np.mean(error * x)
    intercept_gradient = 2 * np.mean(error)
    slope = slope - learning_rate * slope_gradient
    intercept = intercept - learning_rate * intercept_gradient

print(slope, intercept, np.mean((slope * x + intercept - y) ** 2))
```

With a learning rate of `0.1`, each step overshoots the minimum by more than the last. The parameters and the loss grow until they overflow to `nan`.

</details>

## Take-home: Find the sweet spot (about 15 minutes)

You will choose how flexible a model should be, using validation data.

A **decision tree** predicts by asking a series of yes-or-no questions, such as “Is `MedInc` above 5?”. `max_depth` limits how many questions it can ask in a row. A deeper tree is more flexible.

### T1. Split the data three ways (3 minutes)

`train_test_split(table, test_size=0.3, random_state=0)` shuffles the rows, then splits them into two tables. `test_size=0.3` puts 30% of the rows in the second table.

Split `rest` in half to make the validation and test sets. Expect **14,448**, **3,096** and **3,096** rows.

```python
train, rest = train_test_split(housing, test_size=0.3, random_state=0)
val, test = ...  # Split rest in half.

input_columns = housing.columns.drop("MedHouseVal")  # The names of the 8 input columns.
print(len(train), len(val), len(test))  # len counts the rows.
```

<details>
<summary>Answer</summary>

```python
train, rest = train_test_split(housing, test_size=0.3, random_state=0)
val, test = train_test_split(rest, test_size=0.5, random_state=0)

input_columns = housing.columns.drop("MedHouseVal")  # The names of the 8 input columns.
print(len(train), len(val), len(test))  # len counts the rows.
```

</details>

### T2. Train trees of increasing depth (5 minutes)

`train[input_columns]` selects the input columns from the training table.

The loop trains one tree for each depth from 1 to 20 and records its training MSE. Complete the line that records the validation MSE, then run the cell to plot both.

Predict before you run: what will each line look like?

```python
depths = range(1, 21)  # 1, 2, ..., 20
train_losses = []
val_losses = []
for depth in depths:
    tree = DecisionTreeRegressor(max_depth=depth, random_state=0)
    tree.fit(train[input_columns], train["MedHouseVal"])
    train_losses.append(mean_squared_error(train["MedHouseVal"], tree.predict(train[input_columns])))
    val_losses.append(...)  # The same, for the validation set.

plt.plot(depths, train_losses, marker="o", label="Training")
plt.plot(depths, val_losses, marker="o", label="Validation")
plt.xlabel("Tree depth")
plt.ylabel("MSE")
plt.legend()
plt.show()
```

<details>
<summary>Answer</summary>

```python
depths = range(1, 21)  # 1, 2, ..., 20
train_losses = []
val_losses = []
for depth in depths:
    tree = DecisionTreeRegressor(max_depth=depth, random_state=0)
    tree.fit(train[input_columns], train["MedHouseVal"])
    train_losses.append(mean_squared_error(train["MedHouseVal"], tree.predict(train[input_columns])))
    val_losses.append(mean_squared_error(val["MedHouseVal"], tree.predict(val[input_columns])))

plt.plot(depths, train_losses, marker="o", label="Training")
plt.plot(depths, val_losses, marker="o", label="Validation")
plt.xlabel("Tree depth")
plt.ylabel("MSE")
plt.legend()
plt.show()
```

</details>

Which depths underfit? Which overfit? How can you tell from the two lines?

<details>
<summary>Answer</summary>

Shallow trees (depth 1 to about 5) underfit: both losses are high. Deep trees (from about 12) overfit: the training loss falls towards 0, but the validation loss rises again. A depth-20 tree almost memorises the training set.

</details>

### T3. Choose a depth, then test it once (3 minutes)

`np.argmin(val_losses)` gives the position of the smallest value in the list.

The cell picks the depth with the lowest validation MSE. Expect depth **9**, with a validation MSE of about **0.43**. Complete the last line to calculate its MSE on the **test** set. Do this only once, at the end.

```python
best_position = np.argmin(val_losses)
best_depth = depths[best_position]
print("best depth:", best_depth, "validation MSE:", val_losses[best_position])

best_tree = DecisionTreeRegressor(max_depth=best_depth, random_state=0)
best_tree.fit(train[input_columns], train["MedHouseVal"])
...  # Calculate the MSE on the test set.
```

<details>
<summary>Answer</summary>

```python
best_position = np.argmin(val_losses)
best_depth = depths[best_position]
print("best depth:", best_depth, "validation MSE:", val_losses[best_position])

best_tree = DecisionTreeRegressor(max_depth=best_depth, random_state=0)
best_tree.fit(train[input_columns], train["MedHouseVal"])
mean_squared_error(test["MedHouseVal"], best_tree.predict(test[input_columns]))
```

The test MSE is about 0.43, close to the validation MSE. That suggests our choice holds up on new data.

</details>

Why should you not use the test set to choose the depth?

<details>
<summary>Answer</summary>

If we chose the depth using the test set, we would pick the depth that happens to suit those particular examples. The test score would then look better than the model really is.

</details>

### Open-ended: Beat 0.40

Can you get the **validation** MSE below **0.40**? Keep the test set for one final check.

Start from the cell below, and change the model or its settings. Ideas to try:

- Other tree settings, such as `min_samples_leaf`, the smallest number of examples allowed in each final group.
- Other models, such as `RandomForestRegressor` from `sklearn.ensemble`. Read its documentation first.

Record what you tried:

| Model and settings | Training MSE | Validation MSE |
|---|---|---|
| `DecisionTreeRegressor(max_depth=9)` | | |

```python
from sklearn.ensemble import RandomForestRegressor

candidate = DecisionTreeRegressor(max_depth=9, random_state=0)  # Change the model or its settings.
candidate.fit(train[input_columns], train["MedHouseVal"])
print("training MSE:", mean_squared_error(train["MedHouseVal"], candidate.predict(train[input_columns])))
print("validation MSE:", mean_squared_error(val["MedHouseVal"], candidate.predict(val[input_columns])))
```

<details>
<summary>Answer</summary>

There are many good answers. Two models from `sklearn.ensemble` combine many trees and beat 0.40 with their default settings. A random forest reaches about 0.28, and gradient boosting reaches about 0.23. A single tree with no depth limit and `min_samples_leaf=10` also reaches about 0.39: each leaf must average at least 10 neighbourhoods, which stops it memorising single examples.

```python
from sklearn.ensemble import HistGradientBoostingRegressor, RandomForestRegressor

for candidate in [RandomForestRegressor(random_state=0, n_jobs=-1), HistGradientBoostingRegressor(random_state=0)]:
    candidate.fit(train[input_columns], train["MedHouseVal"])
    print(type(candidate).__name__)
    print("training MSE:", mean_squared_error(train["MedHouseVal"], candidate.predict(train[input_columns])))
    print("validation MSE:", mean_squared_error(val["MedHouseVal"], candidate.predict(val[input_columns])))
```

The random forest’s training MSE (0.04) is far below its validation MSE. That gap shows some overfitting, but we still choose by the lowest validation loss: no other model here does better on new data.

</details>
