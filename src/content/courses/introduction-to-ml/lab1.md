---
title: 'Lab 1'
course: 'Introduction to Machine Learning'
description: "Part 1 of Introduction to Machine Learning"
date: 2026-02-03
---

# **WAI Intro to ML** - Session 1 Lab
🖋️ *Written by Jan and Laura from [Warwick AI](https://warwick.ai)*

# Section 1 - Linear Regression

Doctors often need to predict how a patient's condition will develop over time. For someone newly diagnosed with diabetes, will their condition progress slowly or rapidly? In this section, we'll explore how we can use real data to make predictions like this.

### Exercise 1.1

To introduce these concepts, we'll use scikit-learn. Let's start by looking at a real dataset of simple measurements that would be available at diagnosis. Run the cells below.


```python
from sklearn.datasets import load_diabetes

diabetes = load_diabetes(as_frame=True)
diabetes['data']
```

If you are curious you can read more about this dataset and see what the indicators s1-s6 relate to [here](https://scikit-learn.org/stable/datasets/toy_dataset.html#diabetes-dataset).

### Exercise 1.2

We call data like this, or any data from which we make predictions, features. And the thing we are trying to predict (in our case, disease progression) is called the target. In code, we often use these shorthand variable names:

```
X = <the features we want to use>
y = <the target>

# NOTE: capitals denote matrices (multiple columns), lower case vectors (one column)
```

 In this case, BMI is the most predictive feature, so we'll focus on it first. Finish the first cell (watch out for case sensitivity).


```python
# to_frame() makes it matrix-like, which is expected by scitkit-learn
X = diabetes['data']['bmi'].to_frame()
y = diabetes['target']
```

We can now visualise the data we have.


```python
import matplotlib.pyplot as plt

plt.scatter(X, y, alpha=0.5)
plt.xlabel('BMI (normalised)')
plt.ylabel('Disease progression')
plt.show()
```

### Exercise 1.3

Let's make our first predictions! This data looks fairly linear, so let's try linear regression first. Have a look at the docs [here](https://scikit-learn.org/stable/modules/linear_model.html) to figure out how to complete the cell below.


```python
from sklearn.linear_model import LinearRegression
import numpy as np

model = LinearRegression().fit(X,y) # <- we still need to pass in the training data

# You can ignore the following line, but use plot_X for plotting
plot_X = np.arange(X.min().min(), X.max().max(), 0.001).reshape(-1,1) # For plotting our predition line we want an even distribution of the x-axis - if we use the data samples our line will look broken when plotted.

y_pred = model.predict(plot_X)

plt.scatter(X, y, alpha=0.5)
plt.plot(plot_X, y_pred, color='red')
plt.show()
```

### Exercise 1.4

We can also make our own features from the data we have. In the example above, the data is not perfectly linear, so we can "engineer" polynomial features to capture that part of the relationship too. At degree=1, we will end up with an identical model as earlier, but as you increase the degree we will slightly accuracy increase and then drop off. Try it for yourself.


```python
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline
import numpy as np

model = make_pipeline(
    PolynomialFeatures(degree=1), # <-- try, e.g., 1, 3, 10, 25
    LinearRegression()
)
model.fit(X, y)

y_pred = model.predict(plot_X)

plt.scatter(X, y, alpha=0.5)
plt.plot(plot_X, y_pred, color='red')
plt.show()
```

This is an important aspect of ML: models can learn to follow the training data too closely (often just memorise it) and won't perform well on unseen data.

# Section 2 - Evaluating Our Model

We've inspected the dataset and made a model, but how good is it? We're fortunate, in this case, that we can view our data and model and see for ourselves whether it's any good. However, in majority of problems, we will not be so fortunate. We must come up with some different tools to evaluate our models rather than simply visualising them.

### Exercise 2.1

For regression tasks, we are trying to create a model which can predict the outcome on unseen data. In the example we're using, we've trained a model to predict the progression of diabetes using some data we have about the patient. Now we hope that, given a new unseen patient, we can accurately predict the progression.

Notice we want our model to do well on "unseen" data. So, to evaluate our model, we can mimic this scenario. Seperate some data to be our "unseen" data, and leave the rest to be trained on. Often an 70:30 split is used between the training data and "unseen"/test data.

Luckily, this is such a common technique that scikit-learn has exactly a function to do this split for us!


```python
from sklearn.model_selection import train_test_split

train_X, test_X, train_y, test_y = train_test_split(X, y, test_size=0.3, random_state=42) # Test size tells us what proportion of the data to split into the test set.
                                                                                          # random_state lets us choose the data to go into our test set randomly - different values give different random sets of data.
```

We should find that we now have two different sets of data with the same underlying struture.


```python
plt.scatter(train_X, train_y, alpha=0.5)
plt.xlabel('BMI (normalised)')
plt.ylabel('Disease progression')
plt.show()
```


```python
plt.scatter(test_X, test_y, alpha=0.5)
plt.xlabel('BMI (normalised)')
plt.ylabel('Disease progression')
plt.show()
```

### Exercise 2.2

Now that we've split the data we need to evaluate the accuracy of our model on the test data. First we train the model using our training data.


```python
model = make_pipeline(
    PolynomialFeatures(degree=15), # <-- try, e.g., 1, 3, 10, 25
    LinearRegression()
)
model.fit(train_X, train_y)


y_pred = model.predict(plot_X)

plt.scatter(train_X, train_y, alpha=0.5)
plt.plot(plot_X, y_pred, color='red')
plt.show()
```

And now we can predict on our test set, and evaluate these predictions using mean squared error.


```python
from sklearn.metrics import mean_squared_error

y_pred = model.predict(test_X)
mse_test = mean_squared_error(test_y, y_pred)  # Take the mean squared error between the true values and our predicted ones.

y_pred = model.predict(train_X)
mse_train = mean_squared_error(train_y, y_pred)

print(f"Test Error : {mse_test}, Train Error : {mse_train}")
```

Have a look at the test error vs train error for different degrees in polynomials. What do you notice?

Very high order polynomial functions are in danger of overfitting the data. But a model that perfectly memorises the training data might perform terribly on unseen data. We say that a model which performs well on seen data but poorly on unseen data has poor generalisation.

### Exercise 2.3

Let's plot what we're noticing, train a model with varying degrees and plot the training error vs test error in each case.


```python
train_X, test_X, train_y, test_y = train_test_split(X, y, test_size=0.3, random_state=42) # FILL THIS IN

degrees = [1, 2, 3, 5, 10, 25]
train_errors = []
test_errors = []

for degree in degrees:
  model = make_pipeline(
    PolynomialFeatures(degree=degree),
    LinearRegression()
  )
  model.fit(train_X, train_y)

  # Calculate training error
  train_pred = model.predict(train_X)
  train_error = mean_squared_error(train_y, train_pred)
  train_errors.append(train_error)

  # Calculate test error
  test_pred = model.predict(test_X)
  test_error = mean_squared_error(test_y, test_pred)
  test_errors.append(test_error)

# Plot Training and Test errors for each degree
plt.plot(degrees, train_errors, marker='o', label='Training Error')
plt.plot(degrees, test_errors, marker='s', label='Test Error')
plt.xlabel('Polynomial Degree')
plt.ylabel('Error (MSE)')
plt.legend()
plt.show()
```

## Section 3: Regularisation

We saw that high-degree polynomials overfit the training data. Regularisation is a technique that prevents this by penalising overly complex models. Ridge regression is a type of linear regression with regularisation.

The strength of regularisation is controlled by the parameter `alpha`:
- Small alpha: less regularisation (model can be complex)
- Large alpha: more regularisation (model forced to be simpler)

We can adjust our pipeline to include Ridge regularisation like so:


```python
from sklearn.linear_model import Ridge

model = make_pipeline(
      PolynomialFeatures(degree=10),
      Ridge(alpha=0.1)
  )
```

### Exercise 3.1

Train two models of degree 10, with and without ridge regularisation and plot the resulting function.






```python
model = make_pipeline(
    PolynomialFeatures(degree=10), # <-- try, e.g., 1, 3, 10, 25
    LinearRegression()
)

model.fit(X, y)

y_pred = model.predict(plot_X)

plt.scatter(train_X, train_y, alpha=0.5)
plt.plot(plot_X, y_pred, color='red')
plt.show()
```


```python
model_with_regression = make_pipeline(
    PolynomialFeatures(degree=10), # <-- try, e.g., 1, 3, 10, 25
    Ridge(alpha=0.1)
)

model_with_regression.fit(X,y)

y_pred = model_with_regression.predict(plot_X)

plt.scatter(train_X, train_y, alpha=0.5)
plt.plot(plot_X, y_pred, color='red')
plt.show()

```

### Exercise 3.2

Let's observe how different alpha values affect training and test errors.

Plot the training and test error for different values of alpha on a high order polynomial.


```python
alphas = [0.001, 0.01, 0.1, 1.0, 10.0, 100.0]

train_errors = []
test_errors = []

for alpha in alphas:
  # Use a high polynomial degree that we know overfits
  model = make_pipeline(
      PolynomialFeatures(degree=10),
      Ridge(alpha=alpha) # Use ridge regression
  )

  # Fit the model
  model.fit(train_X, train_y)

  # Get training error
  train_pred = model.predict(train_X)
  train_error = mean_squared_error(train_y, train_pred)
  train_errors.append(train_error)

  # Get test errors
  test_pred = model.predict(test_X)
  test_error = mean_squared_error(test_y, test_pred)
  test_errors.append(test_error)

# Plot train and test errors for each alpha (see Ridge regression)
plt.plot(alphas, train_errors, marker='o', label='Training Error')
plt.plot(alphas, test_errors, marker='s', label='Test Error')
plt.xscale('log')
plt.xlabel('Regularisation Strength (alpha)')
plt.legend()
plt.show()
```

### Exercise 3.3

Right at the start we define our data X to be the bmi data, but there are many other variables we could look at.

Try changing the line in Exercise 1.2, so that we look at 's2' for example. Look back over the graphs you created from the exercises. Investigate the graphs for each different variable to get an idea of what they look like.

### Exercise 3.4

Notice all of the variables are scattered, none of them provide a good correlation between diabetes and themselves alone. Perhaps when considered together they can provide a better picture.

We can do linear regression on many variables at once! It just becomes almost impossible to visualise. We'll have to rely on the training and test error alone from now on.

Start by training models without regularisation.

You will notice very high degree polynomials will have much more dramatic differences in test and train errors.

Try a range of different polynomial degrees.

**Warning** : High order polynomials with regression will take a minute or so to train now that we are using all the features, just be patient.


```python
X = diabetes['data']
y = diabetes['target']

train_X, test_X, train_y, test_y = train_test_split(X, y, test_size=0.3, random_state=10)

# Create the model
model = make_pipeline(
    PolynomialFeatures(degree=2), # <-- try, e.g., 1, 3, 10, 25
    LinearRegression()
)

# Fit the model
model.fit(train_X, train_y)

# Get test error
y_pred = model.predict(test_X)
mse_test = mean_squared_error(test_y, y_pred)  # Take the mean squared error between the true values and our predicted ones.

# Get training error
y_pred = model.predict(train_X)
mse_train = mean_squared_error(train_y, y_pred)

print(f"Test Error : {mse_test}, Train Error : {mse_train}")
```

### Exercise 3.5

Repeat Exercise 3.2 using ALL the features from the data set and take notice that we start to prefer a more complex model over simple one (But not too complex!).


```python
X = diabetes['data']
y = diabetes['target']

train_X, test_X, train_y, test_y = train_test_split(X, y, test_size=0.3, random_state=10)

alphas = [0.001, 0.01, 0.1, 1.0, 10.0, 100.0]

train_errors = []
test_errors = []

for alpha in alphas:
  # Use a high polynomial degree that we know overfits
  model = make_pipeline(
      PolynomialFeatures(degree=10),
      Ridge(alpha=alpha)
  )

  model.fit(train_X, train_y)

  train_pred = model.predict(train_X)
  train_error = mean_squared_error(train_y, train_pred)
  train_errors.append(train_error)

  test_pred = model.predict(test_X)
  test_error = mean_squared_error(test_y, test_pred)
  test_errors.append(test_error)

# Plot the results
plt.plot(alphas, train_errors, marker='o', label='Training Error')
plt.plot(alphas, test_errors, marker='s', label='Test Error')
plt.xscale('log')
plt.xlabel('Regularisation Strength (alpha)')
plt.legend()
plt.show()
```

## Extension

Awesome! Let's recap on the Califronia housing dataset. This time, we're using median income to predict the value of the house a family owns. This sort of prediction has lots of uses in insurance.

Train a model for this dataset. Everything you need is in the previous exercises so please do go back and review them if you feel stuck (and don't forget you can ask us for help!)

Here's some code to get you started:


```python
from sklearn.datasets import fetch_california_housing

housing = fetch_california_housing(as_frame=True)

X = housing['data']['MedInc'].to_frame()
y = housing['target']

plt.scatter(X, y, alpha=0.1)
plt.xlabel('Median income (normalised)')
plt.ylabel('Median house value (normalised)')
plt.show()
```


```python
# train_X, test_X, train_y, test_y = ...
train_X, test_X, train_y, test_y = train_test_split(X, y, test_size=0.2, random_state=10)

# model = make a pipeline with polynomial features and a ridge model
model = make_pipeline(
    PolynomialFeatures(degree=5),
    Ridge(alpha=1.0)
)

model.fit(train_X, train_y)

mse = mean_squared_error(test_y, model.predict(test_X))
print(f"MSE: {mse:.2f}")
```

Don't forget to visualise the variables, but also use all the variables for you final model even if you can't visualise the final output you can still check its accuracy using the test error.


```python
!jupyter nbconvert --to markdown Lab1_solutions.ipynb
```
