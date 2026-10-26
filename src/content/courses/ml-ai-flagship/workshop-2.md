---
title: 'Workshop 2'
course: 'ML/AI Course'
description: 'Regularisation and F1 scores: fight overfitting with Ridge and Lasso, then measure a classifier.'
date: 2026-10-22
order: 2
authors: ['jan-lindroos', 'shaana-amarawickrama', 'tanvi-patnayukuni', 'sam-turner', 'finlay-sanders']
---

Follow along with the [slides](https://drive.google.com/file/d/16GLaZnLhpTrwss1xFVsyGdD2uSWnPzwM/view), then work through the lab below.

## Lab 2: Regularisation and F1 scores

### Getting started

- Open the [lab notebook in Colab](https://colab.research.google.com/drive/1T3nUDnAE5JD4nAeburen1TH9MAwykNq7) and save your own copy.
- Click the **play button** beside a code cell to run it. Work from top to bottom.
- Double-click text to edit an answer. Click outside when done.

The first cell loads four libraries:

| Library | What it does |
|---|---|
| `pandas`, shortened to `pd` | Stores data as a table called a **DataFrame**, like a spreadsheet |
| `numpy`, shortened to `np` | Does maths on a whole list of numbers at once |
| `matplotlib.pyplot`, shortened to `plt` | Draws graphs |
| `sklearn` (scikit-learn) | Ready-made machine learning models and tools |

It then loads a medical dataset that comes with scikit-learn: 442 patients with diabetes, in a table called `diabetes`. The `target` column is how much each patient’s disease progressed after a year (higher is worse). The other 10 columns (`age`, `sex`, `bmi`, `bp`, `s1` to `s6`) are inputs, already rescaled to similar sizes.

```python
import matplotlib.pyplot as plt  # Draws graphs.
import numpy as np  # Does maths on many numbers at once.
import pandas as pd  # Stores data in tables.
from sklearn.datasets import load_diabetes
from sklearn.linear_model import ElasticNet, Lasso, LinearRegression, Ridge
from sklearn.metrics import mean_squared_error
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import PolynomialFeatures, StandardScaler

diabetes = load_diabetes(as_frame=True).frame  # Load the data as a table.
diabetes.head()  # Show the first five rows.
```

### 1. Regularisation by hand

This is the red and blue line example from the slides, a tiny made-up dataset, so the code calls it `toy_x` and `toy_y`. The two training points are $(1, 3)$ and $(2, 5)$.

- **Red line:** slope 2. It hits both points exactly.
- **Blue line:** slope 1. It misses both points slightly, but it is flatter.

Each line gets a **loss** (lower is better) made of two parts:

$$\text{Loss} = \underbrace{\sum (y_{\text{true}} - y_{\text{pred}})^2}_{\text{data fit: how far the line is from the points}} + \underbrace{\lambda \times \text{slope}^2}_{\text{penalty: bigger for steeper lines}}$$

$\lambda$ sets how much we care about the penalty. Replace each `...` to finish `total_loss`.

| Code | What it does |
|---|---|
| `errors ** 2` | Squares every error |
| `np.sum(a)` | Adds up all the values in `a` |
| `slope ** 2` | Squares the slope |
| `lam * a` | Multiplies `a` by lambda |

Expect `0` and `5` at $\lambda = 0$, and `20` and `10` at $\lambda = 5$.

<details>
<summary>Hint</summary>

`np.sum(errors ** 2)` for the data fit, and `lam * slope ** 2` for the penalty.

</details>

```python
toy_x = np.array([1, 2])
toy_y = np.array([3, 5])

def total_loss(slope, lam):
    predictions = slope * toy_x + 1  # The line's predictions (intercept fixed at 1).
    errors = toy_y - predictions  # One error for each training point.
    data_fit = ...  # Square the errors, then add them up.
    penalty = ...  # Lambda times the slope squared.
    return data_fit + penalty

for lam in [0, 1, 2, 5]:
    print("lambda =", lam, "| red loss:", total_loss(2, lam), "| blue loss:", total_loss(1, lam))
```

<details>
<summary>Answer</summary>

```python
toy_x = np.array([1, 2])
toy_y = np.array([3, 5])

def total_loss(slope, lam):
    predictions = slope * toy_x + 1  # The line's predictions (intercept fixed at 1).
    errors = toy_y - predictions  # One error for each training point.
    data_fit = np.sum(errors ** 2)  # Square the errors, then add them up.
    penalty = lam * slope ** 2  # Lambda times the slope squared.
    return data_fit + penalty

for lam in [0, 1, 2, 5]:
    print("lambda =", lam, "| red loss:", total_loss(2, lam), "| blue loss:", total_loss(1, lam))
```

</details>

Complete the sentence using the output above: at $\lambda = 0$ the ___ line has the lower loss, at $\lambda = 5$ the ___ line has the lower loss, so a bigger $\lambda$ favours the ___ line.

<details>
<summary>Answer</summary>

At $\lambda = 0$ the **red** line has the lower loss (0 vs 5), at $\lambda = 5$ the **blue** line has the lower loss (10 vs 20), so a bigger $\lambda$ favours the **blue** (flatter) line.

</details>

Now try every slope from 0 to 3, not just red and blue, and find the best slope for each $\lambda$. There is nothing to fill in: run the cell. The black dot marks the best slope on each curve.

```python
slopes = np.linspace(0, 3, 301)  # 0.00, 0.01, 0.02, ..., 3.00

for lam in [0, 5, 20, 1000]:
    losses = [total_loss(slope, lam) for slope in slopes]
    best_slope = slopes[np.argmin(losses)]  # np.argmin gives the position of the smallest loss.
    print("lambda =", lam, "| best slope:", round(best_slope, 2))
    if lam < 1000:
        plt.plot(slopes, losses, label=f"lambda = {lam}")
        plt.scatter(best_slope, min(losses), color="black", zorder=3)

plt.xlabel("Slope")
plt.ylabel("Total loss")
plt.ylim(0, 40)
plt.legend()
plt.show()
```

The next cell lets the intercept change too, and colours the total loss for every slope and intercept at $\lambda = 0$ and $\lambda = 5$. Darker colours mean a lower loss. Run it.

```python
import numpy as np
import matplotlib.pyplot as plt

# Define the loss function with adjustable intercept and slope
def custom_loss(slope, intercept, lam):
    predictions = slope * toy_x + intercept
    errors = toy_y - predictions
    data_fit = np.sum(errors ** 2)
    penalty = lam * (slope ** 2) # Penalising only the slope (standard regularisation practice)
    return data_fit + penalty

# Create a grid of slopes and intercepts
slopes_grid = np.linspace(-1, 5, 100)
intercepts_grid = np.linspace(-1, 5, 100)
S, I = np.meshgrid(slopes_grid, intercepts_grid)

# Compute loss landscapes
loss_lam_0 = np.vectorize(lambda s, i: custom_loss(s, i, lam=0))(S, I)
loss_lam_5 = np.vectorize(lambda s, i: custom_loss(s, i, lam=5))(S, I)

# Plotting the contours
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# Lambda = 0
cp0 = axes[0].contourf(S, I, loss_lam_0, levels=30, cmap='viridis')
fig.colorbar(cp0, ax=axes[0])
axes[0].set_title('Loss Landscape (lambda = 0)')
axes[0].set_xlabel('Slope')
axes[0].set_ylabel('Intercept')

# Lambda = 5
cp5 = axes[1].contourf(S, I, loss_lam_5, levels=30, cmap='viridis')
fig.colorbar(cp5, ax=axes[1])
axes[1].set_title('Loss Landscape (lambda = 5)')
axes[1].set_xlabel('Slope')
axes[1].set_ylabel('Intercept')

plt.tight_layout()
plt.show()
```

A line that is almost flat and ignores the trend in the data is **underfitting**: it is too simple.

Complete the sentence using the printed best slopes: as $\lambda$ grows, the best slope gets ___ (bigger or smaller), so the line gets ___ (steeper or flatter).

<details>
<summary>Answer</summary>

As $\lambda$ grows, the best slope gets **smaller** (2.0, 1.0, 0.4, 0.01), so the line gets **flatter**. A very large $\lambda$ gives an almost flat line, which underfits. This is the point of regularisation: the penalty pushes towards simpler lines.

</details>

### 2. See overfitting

Now a real dataset. The next cell splits the 442 patients into training, validation and test sets (221, 110 and 111 rows). It also turns the 10 inputs into **65** by adding every pair multiplied together, such as `bmi * bp`. More inputs make the model more flexible, so it can overfit more easily. Run it.

```python
train, rest = train_test_split(diabetes, test_size=0.5, random_state=0)
val, test = train_test_split(rest, test_size=0.5, random_state=0)

input_columns = diabetes.columns.drop("target")  # The names of the 10 input columns.
make_features = PolynomialFeatures(degree=2, include_bias=False)  # Adds the pairs.
scaler = StandardScaler()  # Rescales every input to a similar size.

X_train = scaler.fit_transform(make_features.fit_transform(train[input_columns]))
X_val = scaler.transform(make_features.transform(val[input_columns]))
X_test = scaler.transform(make_features.transform(test[input_columns]))
y_train, y_val, y_test = train["target"], val["target"], test["target"]

print(len(train), len(val), len(test), X_train.shape)  # Rows in each set, then (rows, inputs).
```

Fit an ordinary `LinearRegression` on all 65 inputs and measure its training and validation MSE. The **baseline** always predicts the average training value. Expect about **1884**, **4176** and **5344**. Lower is better.

| Code | What it does |
|---|---|
| `model.fit(X, y)` | Trains the model on inputs `X` and answers `y` |
| `model.predict(X)` | Uses the trained model to predict answers for `X` |

<details>
<summary>Hint</summary>

`plain.fit(X_train, y_train)`, then copy the training MSE line and change `train` to `val` in all three places.

</details>

```python
plain = LinearRegression()
...  # Fit the model here.

plain_train_mse = mean_squared_error(y_train, plain.predict(X_train))
plain_val_mse = ...  # The same, for the validation set.
baseline_mse = mean_squared_error(y_val, np.full(len(y_val), y_train.mean()))

print("training MSE:", round(plain_train_mse), "| validation MSE:", round(plain_val_mse), "| baseline:", round(baseline_mse))
```

<details>
<summary>Answer</summary>

```python
plain = LinearRegression()
plain.fit(X_train, y_train)

plain_train_mse = mean_squared_error(y_train, plain.predict(X_train))
plain_val_mse = mean_squared_error(y_val, plain.predict(X_val))
baseline_mse = mean_squared_error(y_val, np.full(len(y_val), y_train.mean()))

print("training MSE:", round(plain_train_mse), "| validation MSE:", round(plain_val_mse), "| baseline:", round(baseline_mse))
```

</details>

Complete the sentence: the training MSE is ___ (lower or higher) than the validation MSE, so the model is ___ (overfitting or underfitting).

<details>
<summary>Answer</summary>

The training MSE is **lower** than the validation MSE (about 1884 vs 4176), so the model is **overfitting**. With 65 inputs and only 221 training rows it has fitted noise in the training data, so it does much worse on new patients.

</details>

### 3. Ridge: shrink all the weights

`Ridge(alpha=...)` is the L2 penalty from the slides, and `alpha` plays the role of $\lambda$. The loop trains one Ridge model for each `alpha`. Complete the validation MSE, then run the cell to plot both lines.

`np.logspace(-2, 4, 25)` makes 25 values from 0.01 up to 10,000, spaced by multiplying, so small and huge values are covered evenly.

**Predict before you run:** what will each line look like as `alpha` grows?

<details>
<summary>Hint</summary>

Copy the training line above it, and change `y_train` to `y_val` and `X_train` to `X_val`.

</details>

```python
alphas = np.logspace(-2, 4, 25)  # 0.01 ... 10,000
ridge_train = []
ridge_val = []
for alpha in alphas:
    model = Ridge(alpha=alpha)
    model.fit(X_train, y_train)
    ridge_train.append(mean_squared_error(y_train, model.predict(X_train)))
    ridge_val.append(...)  # The same, for the validation set.

plt.plot(alphas, ridge_train, marker="o", label="Training")
plt.plot(alphas, ridge_val, marker="o", label="Validation")
plt.xscale("log")
plt.xlabel("alpha (penalty strength)")
plt.ylabel("MSE")
plt.legend()
plt.show()
```

<details>
<summary>Answer</summary>

```python
alphas = np.logspace(-2, 4, 25)  # 0.01 ... 10,000
ridge_train = []
ridge_val = []
for alpha in alphas:
    model = Ridge(alpha=alpha)
    model.fit(X_train, y_train)
    ridge_train.append(mean_squared_error(y_train, model.predict(X_train)))
    ridge_val.append(mean_squared_error(y_val, model.predict(X_val)))

plt.plot(alphas, ridge_train, marker="o", label="Training")
plt.plot(alphas, ridge_val, marker="o", label="Validation")
plt.xscale("log")
plt.xlabel("alpha (penalty strength)")
plt.ylabel("MSE")
plt.legend()
plt.show()
```

</details>

Complete the sentences: with a small `alpha` (on the left) the training MSE is ___ (low or high) and the validation MSE is ___ (low or high), which is overfitting. With a very large `alpha` (on the right) both are ___ (low or high), which is underfitting.

<details>
<summary>Answer</summary>

With a small `alpha` the training MSE is **low** (about 1900) and the validation MSE is **high** (about 3800 to 4100), which is overfitting. With a very large `alpha` both are **high** and close together, which is underfitting. The best `alpha` is in the middle, around 100, where the validation MSE is lowest.

</details>

### 4. Lasso: switch weights off

`Lasso(alpha=...)` is the L1 penalty from the slides. Complete the loop to count the weights that are **not** zero, then run the cell to plot both graphs.

| Code | What it does |
|---|---|
| `model.coef_` | The weights the model learned, one per input |
| `weights != 0` | Checks every weight at once: `True` if it is not zero |
| `np.sum(a)` | Counts the `True`s in `a` (each `True` counts as 1) |

<details>
<summary>Hint</summary>

`np.sum(model.coef_ != 0)`

</details>

```python
lasso_alphas = np.logspace(-2, 2, 25)  # 0.01 ... 100
lasso_val = []
lasso_nonzero = []
for alpha in lasso_alphas:
    model = Lasso(alpha=alpha, max_iter=20000)  # max_iter gives it enough time to finish.
    model.fit(X_train, y_train)
    lasso_val.append(mean_squared_error(y_val, model.predict(X_val)))
    lasso_nonzero.append(...)  # Count the weights that are not zero.

fig, (left, right) = plt.subplots(1, 2, figsize=(11, 4))
left.plot(lasso_alphas, lasso_val, marker="o")
left.set_xscale("log")
left.set_xlabel("alpha (penalty strength)")
left.set_ylabel("Validation MSE")
right.plot(lasso_alphas, lasso_nonzero, marker="o", color="black")
right.set_xscale("log")
right.set_xlabel("alpha (penalty strength)")
right.set_ylabel("Weights that are not zero")
plt.tight_layout()
plt.show()
```

<details>
<summary>Answer</summary>

```python
lasso_alphas = np.logspace(-2, 2, 25)  # 0.01 ... 100
lasso_val = []
lasso_nonzero = []
for alpha in lasso_alphas:
    model = Lasso(alpha=alpha, max_iter=20000)  # max_iter gives it enough time to finish.
    model.fit(X_train, y_train)
    lasso_val.append(mean_squared_error(y_val, model.predict(X_val)))
    lasso_nonzero.append(np.sum(model.coef_ != 0))

fig, (left, right) = plt.subplots(1, 2, figsize=(11, 4))
left.plot(lasso_alphas, lasso_val, marker="o")
left.set_xscale("log")
left.set_xlabel("alpha (penalty strength)")
left.set_ylabel("Validation MSE")
right.plot(lasso_alphas, lasso_nonzero, marker="o", color="black")
right.set_xscale("log")
right.set_xlabel("alpha (penalty strength)")
right.set_ylabel("Weights that are not zero")
plt.tight_layout()
plt.show()
```

</details>

Look at the right-hand graph and complete the sentence: as `alpha` grows, the number of non-zero weights gets ___ (bigger or smaller) until it reaches ___, and the model then predicts the ___ for every patient.

<details>
<summary>Answer</summary>

As `alpha` grows, the number of non-zero weights gets **smaller** (from about 60 of 65) until it reaches **0**, and the model then predicts the **average** (the training average) for every patient. Lasso switches weights off by setting them to exactly zero, so it chooses features. On the left graph, the validation MSE rises to about 5300, the baseline from Section 2.

</details>

### 5. F1 scores

We use measurements from breast cancer samples to predict whether a tumour is malignant or benign. We treat malignant as the positive class.

A model can make two types of mistakes:

- **False negative:** a malignant tumour is predicted to be benign.
- **False positive:** a benign tumour is predicted to be malignant.

```python
import numpy as np
import pandas as pd

from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report
)

# Load the dataset.
data = load_breast_cancer(as_frame=True)

X = data.data  # The measurements of each tumour, one column per feature.
y = data.target  # The TRUE labels: 0 = malignant, 1 = benign.

# Show the first five rows.
X.head()
```

Each row represents one sample, and each column in `X` represents a feature, such as the radius, texture, perimeter or area of a tumour.

1. What is the difference between `X` and `y`?
2. How will the model label malignant and benign tumours? What will `y_pred` (the predicted labels) look like?

<details>
<summary>Answer</summary>

1. `X` holds the inputs: 30 measurements for each of the 569 samples. `y` holds the answers: the true label of each sample, 0 for malignant and 1 for benign.
2. The model learns from the measurements to predict a label for each tumour. `y_pred` looks like `y`: one 0 or 1 for each test sample.

</details>

Replace each `...`:

1. Make the test set 25% of the data.
2. Train the model. What does it need to learn from?
3. Predict the labels. What does it predict from?

Expect **426** training samples and **143** test samples.

```python
# Split the data into training and testing sets.
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=...,
    random_state=42,
    stratify=y  # Keeps the same mix of malignant and benign in both sets.
)

C = 0.001  # C is the inverse of regularisation strength.

# Train a logistic regression classifier.
model = LogisticRegression(C=C, max_iter=5000)
model.fit(..., ...)

# Predict the test labels.
y_pred = model.predict(...)  # The PREDICTED labels, also just 0s and 1s.

print("Number of training samples:", len(X_train))
print("Number of test samples:", len(X_test))
```

<details>
<summary>Answer</summary>

```python
# Split the data into training and testing sets.
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.25,
    random_state=42,
    stratify=y  # Keeps the same mix of malignant and benign in both sets.
)

C = 0.001  # C is the inverse of regularisation strength.

# Train a logistic regression classifier.
model = LogisticRegression(C=C, max_iter=5000)
model.fit(X_train, y_train)

# Predict the test labels.
y_pred = model.predict(X_test)  # The PREDICTED labels, also just 0s and 1s.

print("Number of training samples:", len(X_train))
print("Number of test samples:", len(X_test))
```

</details>

What are `X_train`, `X_test`, `y_train` and `y_test`, and how do they differ?

<details>
<summary>Answer</summary>

`X_train` and `y_train` are the measurements and true labels the model learns from (75% of the samples). `X_test` and `y_test` are held back, so we can check the model on tumours it has not seen. The `X`s are inputs and the `y`s are labels.

</details>

Complete the F1 score line. `f1_score` works like `precision_score`. Expect an accuracy of **0.944**, a precision of **0.959**, a recall of **0.887** and an F1 score of **0.922**.

```python
# Calculate evaluation metrics.
accuracy = accuracy_score(y_test, y_pred)

precision = precision_score(
    y_test, y_pred, pos_label=0
)  # Malignant has label 0, so we set pos_label=0.

recall = recall_score(y_test, y_pred, pos_label=0)

f1 = ...(..., ..., pos_label=0)

print(f"Accuracy:  {accuracy:.3f}")
print(f"Precision: {precision:.3f}")
print(f"Recall:    {recall:.3f}")
print(f"F1 score:  {f1:.3f}")
```

<details>
<summary>Answer</summary>

```python
f1 = f1_score(y_test, y_pred, pos_label=0)
```

</details>

Now change the value of `C`, rerun both cells and see how the F1 score changes. Try really extreme values: when precision or recall is 0, the F1 score becomes 0 too.

<details>
<summary>Answer</summary>

A smaller `C` means a stronger penalty. At `C = 1e-9` the model predicts benign for every tumour. It finds no malignant tumours, so recall is 0 and the F1 score is 0. scikit-learn also warns that precision is undefined, because there are no positive predictions, and sets it to 0. Accuracy is still about 0.63, because most tumours are benign, which is why accuracy alone can mislead.

A larger `C`, such as `10000`, means a weaker penalty and gives an F1 score of about 0.97.

</details>
