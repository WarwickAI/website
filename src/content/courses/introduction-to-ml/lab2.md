---
title: 'Lab 2'
course: 'Introduction to Machine Learning'
description: "Part 2 of Introduction to Machine Learning"
date: 2026-02-03
---

# **WAI Intro to ML** - Session 2 Lab
🖋️ *Written by Laura and Alex from [Warwick AI](https://warwick.ai)*

We've put all the imports at the top this time so that they're out the way.

❗Remember to run this cell first and whenever you refresh/reset


```python
import matplotlib.pyplot as plt
import numpy as np

from sklearn.metrics import classification_report, ConfusionMatrixDisplay, accuracy_score
from sklearn.datasets import make_circles, make_classification, make_moons, load_breast_cancer, load_digits
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler, PolynomialFeatures
from sklearn.svm import SVC
from sklearn.inspection import DecisionBoundaryDisplay
from sklearn.linear_model import LogisticRegression
```

# Section 1 - Logistic Regression

We're starting off this section with a simple dataset purely for visualising and understanding decision boundaries.

First we will define our data: `make_circles()` creates a dataset with one class inside another. Have a play with it below, `noise` and `factor` will change the distribution, and changing `random_state` will give you a different set of data points following the same distribution.

There are some other data distributions for you to play around with and visualise `make_moons` and `make_classification` - just uncomment them if you with to use them.

The plot output shows one class in yellow and the other class in purple.


```python
# create classification dataset with circles
X, y = make_circles(noise=0.2, factor=0.5, random_state=2)
# create classification dataset with half-moons
# X, y = make_moons(noise=0.3, random_state=0)
# create a standard classification dataset
# X, y = make_classification(n_features=2, n_informative=2, n_redundant=0, random_state=0)

# Plot the data points
plt.scatter(X[:, 0], X[:, 1], c=y, edgecolors="k")

plt.show()
```

Now we're going to train our logistic regression model. Our pipeline is a bit more involved than last time. We first standardize the features using `StandardScaler()`, then we create our polynomial features to add complexity to our model using `PolynomialFeatures`. Finally we call our model with these features using `LogisticRegression(penalty=None)`.

For now, we will keep `penalty=None`. By default sk-learn adds regularisation to prevent models overfitting, but we want to see the effects of overfitting so we will leave it out for now.

### Exercise 1.1
The code below trains a linear logistic regressor, which means it has a straight line boundary. This is terrible for our circles dataset! Change the code below, so that the boundary can be more complex.


Hint: Change the degree used for `PolynomialFeatures` in the pipeline.


```python

# preprocess dataset, split into training and test part
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.4, random_state=42
)

# create the model
model = make_pipeline(StandardScaler(),
                      PolynomialFeatures(degree=1),
                      LogisticRegression(penalty=None))

# fit the model using the training data
model.fit(X_train, y_train)

# draw the decision boundary (don't worry about this line it's just for visualization)
plot = DecisionBoundaryDisplay.from_estimator(
    model, X, response_method="predict", alpha=0.5
)

# Plot the training points
plot.ax_.scatter(X_train[:, 0], X_train[:, 1], c=y_train, edgecolors="k")
# Plot the testing points
plot.ax_.scatter(
    X_test[:, 0], X_test[:, 1], c=y_test, alpha=0.4, edgecolors="k"
)

plt.show()
```

We can calculate the accuracy using `score` from sk-learn.


```python
print(model.score(X_test, y_test))
```

### Exercise 1.2
Explore how the complexity of the decision boundary affects the accuracy. Use the `score` function to calculate the train and test accuracies for models of varying degree, then plot them.

Hint: This is essentially the same exercise as 2.3 in the previous notebook.


```python
train_X, test_X, train_y, test_y = train_test_split(X, y, test_size=0.3, random_state=42)

degrees = [1, 2, 3, 4, 5, 6, 7]
train_errors = []
test_errors = []

for degree in degrees:
  model = make_pipeline(StandardScaler(),
                        PolynomialFeatures(degree=degree),
                        LogisticRegression(penalty=None))
  model.fit(train_X, train_y)

  train_error = model.score(X_train, y_train)
  train_errors.append(train_error)

  test_error = model.score(X_test, y_test)
  test_errors.append(test_error)

  # Task: create and train a model with PolynomialFeatures

  # USE THIS AS A SKELETON FOR YOUR CODE

  # Calculate training error
  # train_error = model.score(...)
  # train_errors.append(train_error)

  # Calculate test error
  # test_error = model.score(...)
  # test_errors.append(test_error)

plt.plot(degrees, train_errors, marker='o', label='Training Accuracy')
plt.plot(degrees, test_errors, marker='s', label='Test Accuracy')
plt.xlabel('Polynomial Degree')
plt.ylabel('Accuracy')
plt.legend()
plt.show()
```

As before we can add regularisation to control the complexity of our model. In this case, sk-learn does it all for you! Simply add `penalty='l2'` to penalise the size of the weights in your model.

Note there is no scaling parameter this time because sk-learn chooses this optimally for us.


```python

# preprocess dataset, split into training and test part
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.4, random_state=42
)

# create the model
model = make_pipeline(StandardScaler(),
                      PolynomialFeatures(degree=5),
                      LogisticRegression(penalty='l2'))

# fit the model using the training data
model.fit(X_train, y_train)

# draw the decision boundary (don't worry about this line it's just for visualization)
plot = DecisionBoundaryDisplay.from_estimator(
    model, X, response_method="predict", alpha=0.5
)

# Plot the training points
plot.ax_.scatter(X_train[:, 0], X_train[:, 1], c=y_train, edgecolors="k")
# Plot the testing points
plot.ax_.scatter(
    X_test[:, 0], X_test[:, 1], c=y_test, alpha=0.4, edgecolors="k"
)

plt.show()

print(model.score(X_test, y_test))
```

### Exercise 1.3

So far we've only used toy datasets that we can visualize. Let's now use a breast cancer classification dataset. We will inspect this further in exercise 2...


```python
X, y = load_breast_cancer(return_X_y=True)

# preprocess dataset, split into training and test part
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.4, random_state=42
)

# create the model
model = make_pipeline(StandardScaler(),
                      PolynomialFeatures(degree=1),
                      LogisticRegression(penalty='l2'))

# fit the model using the training data
model.fit(X_train, y_train)

model.score(X_test, y_test)

```


```python
predicted = model.predict(X_test)

disp = ConfusionMatrixDisplay.from_predictions(y_test, predicted)
disp.figure_.suptitle("Confusion Matrix")

plt.show()

print(
    f"Classification report:\n"
    f"{classification_report(y_test, predicted)}\n"
)
```

### Exercise 1.4

This section is short, so that you can repeat it with different datasets and investigate the decision boundaries, please do go back to exercise 1.1 and experiment with the different datasets.

# Section 2: F1 Score

We're going to explore why the F1 Score, precision and recall are key quantities for evaluating your model. We'll also get comfortable with confusion matrices which are similarly very useful.

I've created a class-biased data set here. Only 10% of samples are in class 1, the rest are in class 0.


```python
X1, y1 = make_classification(n_samples=10000, n_classes=1, n_features=2, n_informative=2, n_redundant=0, random_state=10)
X2, y2 = make_classification(n_samples=100, n_classes=1, n_features=2, n_informative=2, n_redundant=0, random_state=9)
y2[:] = 1

y = np.concatenate((y1,y2))
X = np.vstack((X1,X2))


# Plot the data points
plt.scatter(X[:, 0], X[:, 1], c=y, edgecolors="k")

plt.show()
```

### Exercise 2.1
Create a logistic regression model to fit this data and inspect the accuracy using `score`.


Is your model a good fit?

What does the accuracy imply?


```python

# preprocess dataset, split into training and test part
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.4, random_state=42
)

# create the model
model = make_pipeline(StandardScaler(),
                      PolynomialFeatures(degree=3),
                      LogisticRegression(penalty='l2'))

# fit the model using the training data
model.fit(X_train, y_train)

accuracy = model.score(X_test, y_test)

print(f"Accuracy is {accuracy}")

# draw the decision boundary (don't worry about this line it's just for visualization)
plot = DecisionBoundaryDisplay.from_estimator(
    model, X, response_method="predict", alpha=0.5
)

# Plot the training points
plot.ax_.scatter(X_train[:, 0], X_train[:, 1], c=y_train, edgecolors="k")
# Plot the testing points
plot.ax_.scatter(
    X_test[:, 0], X_test[:, 1], c=y_test, alpha=0.4, edgecolors="k"
)

plt.show()
```

### Exercise 2.2

Let's look at the confusion matrix. This isn't quite arranged the way we did in lectures so pay careful attention to the predicted and true label and work out the following:

- Number of True Positives: 20
- Number of False Positives: 17
- Number of True Negatives: 4001
- Number of False Negatives: 2

From these values, do you expect a good F1 Score?


```python
predicted = model.predict(X_test)

disp = ConfusionMatrixDisplay.from_predictions(y_test, predicted)
disp.figure_.suptitle("Confusion Matrix")

plt.show()
```

### Exercise 2.3

As always, sk-learn has the tools to calculate precision and recall for us. `classification_report` will calculate precision, recall and f1-score for each class.

Have a look at the classification report below and answer the following questions:
- Which class did we classify better and why?
- Why is the recall much lower than the precision for class 1?


```python
print(
    f"Classification report:\n"
    f"{classification_report(y_test, predicted)}\n"
)
```

### Exercise 2.3

In the real world we will never have perfect accuracy. Let us consider the cancer prediction task, there are two ways we could be wrong:
1) We tell a patient that they have cancer, but they actually don't.
2) We tell a patient they do not have cancer, and discharge them, but they *do* have cancer.

What are the consequences of 1) and 2)?
1) The patient endures some stress (being told they have cancer), but ultimately we will find out they don't through further testing and they will be fine.
2) The patient returns home and their cancer progresses. When they finally return they will need more treatment than before (or potentially be beyond treatment).

Answer the following questions:
- What does 1) and 2) correspond to: False Negative or False Positive?
- Clearly, in the medical field we prefer 1). Which value would you prioritise so that we avoid situation 2): precision, recall or accuracy?

### Exercise 2.4

How can we improve the situation? The main issue is the imbalance of classes, class 0 is being prioritised because is has so much more data.

If this were a real life dataset, we may not be able gather more data of class 1. We're stuck with what we've got. There are two possible approaches:
1) Reduce the number of class 0 samples.
2) Increase the number of class 1 samples by duplicating.


(NB:There are fancier ways of doing 2), there is a lot of research into how to create synthetic data for this reason).

However, there are drawbacks to both methods:
1) We lose data - potentially important data
2) We increase our chances of overfitting


We're going to do method 2) together. The code below increases the number of class 1 samples in training data by 10x.

Note that we are not using the test set data, nor are we increasing the number of class 1 samples in the test data. This is *very* important. The test set must remain unseen by the model to get a proper evaluation and, precision and recall always account for a discrepancy in class size - that is, if we duplicated all the test samples for class 1 and look again at the precision and recall, it would be the exact same.


```python
# Get the class 1 entries from y_train and X_train
y1_train = y_train[y_train == 1]
X1_train = X_train[y_train == 1]

y1_inflated = np.repeat(y1_train, 10)
X1_inflated = np.repeat(X1_train, 10, axis=0)

y_train = np.concatenate((y_train, y1_inflated))
X_train = np.vstack((X_train, X1_inflated))

```

Now let's retrain our model and see if the precision and recall shifts.


```python
# create the model
model = make_pipeline(StandardScaler(),
                      PolynomialFeatures(degree=3),
                      LogisticRegression(penalty='l2'))

# fit the model using the new inflated training data
model.fit(X_train, y_train)

accuracy = model.score(X_test, y_test)

print(f"Accuracy is {accuracy}")

# draw the decision boundary (don't worry about this line it's just for visualization)
plot = DecisionBoundaryDisplay.from_estimator(
    model, X, response_method="predict", alpha=0.5
)

# Plot the training points
plot.ax_.scatter(X_train[:, 0], X_train[:, 1], c=y_train, edgecolors="k")
# Plot the testing points
plot.ax_.scatter(
    X_test[:, 0], X_test[:, 1], c=y_test, alpha=0.4, edgecolors="k"
)

plt.show()
```

Notice the decision boundary looks very different! Let's see the precision and recall now.


```python
predicted = model.predict(X_test)

print(
    f"Classification report:\n"
    f"{classification_report(y_test, predicted)}\n"
)
```

Is it what you expected? Notice we sacrificed some precision to increase our recall, and the accuracy barely changed.

Can you answer the following questions:

- Why did the precision decrease?
- Why did the recall increase?

### Exercise 2.5

Go back to the breast cancer dataset in Exercise 1.3 and display the the confusion matrix and classification report (reuse the code you've seen in this section). Did our classifier do a good job of predicting breast cancer?


# Section 3: Recognizing hand-written digits

This example shows how scikit-learn can be used to recognize images of
hand-written digits, from 0-9.


### Section 3.1: Load the digits dataset and inspect its structure

The digits dataset consists of 8x8 pixel images of digits. The ``images``
attribute of the dataset stores 8x8 arrays of grayscale values for each image. We will use these arrays to visualize the first 10 images. The ``target`` attribute of the dataset stores the digit each image represents and this is included in the title of the numbers below.

* How many samples are there?
* How many features are there?
* What are the samples?


```python
digits = load_digits()

Data = digits.data       # flattened images (n_samples, 64)
Targets = digits.target     # digit labels (0–9)
Images = digits.images

print("Shape of digits.images:", Images.shape)  # (n_samples, 8, 8)
print("Shape of digits.data:", Data.shape)                # (n_samples, 64)
print("Shape of digits.targets:", Targets.shape)
print("Number of samples:", Data.shape[0])
print("Number of features:", Data.shape[1])

# Each feature corresponds to one pixel in the 8×8 image.
```

### Section 3.2: Visualise the first 10 digit images:

We will use these arrays to visualize the first 10 images. The target attribute of the dataset stores the digit each image represents and this is included in the title of the numbers below.
* Which digits look visually similar? How might this lead to misclassification?
* Which digits seem easiest to distinguish? Why?
* Does the low (8×8) resolution pose challenges for recognising certain digits?




```python

_, axes = plt.subplots(nrows=1, ncols=10, figsize=(15, 3))
for i in range(len(axes)):
    axes[i].set_axis_off()
    axes[i].imshow(Images[i], cmap=plt.cm.gray_r, interpolation="nearest")
    axes[i].set_title("Training: %i" % Targets[i])

```

### Section 3.3: Create a logistic regression classifier inside a pipeline

We can then split the data into train and test subsets before making our classifier.

As before, we define our classifer inside a pipeline, using polynomial features (Keep at 3 or under, degree of 4 will cause google colab to crash). Once created, we then fit our classifer and run some predictions.




```python
# Split data into 50% train and 50% test subsets
X_train, X_test, y_train, y_test = train_test_split(
    Data, Targets, test_size=0.5, shuffle=False
)

# Create a classifier: logistic regression classifier
clf = make_pipeline(LogisticRegression(max_iter=1000))

# Learn the digits on the train subset
clf.fit(X_train, y_train)

# Predict the value of the digit on the test subset
predicted = clf.predict(X_test)

accuracy = accuracy_score(y_test, predicted)
print("Test accuracy:", accuracy)
```

### Section 3.4: Inspect individual predictions

Below we visualize the first 10 test samples and show their predicted
digit value in the title.

* For misclassified digits, what visual features might have misled the model?
* Would a human also struggle to classify these examples?
* What patterns do you notice in the mistakes (e.g., 9→4, 3→5)?




```python
_, axes = plt.subplots(nrows=1, ncols=10, figsize=(15, 3))

for i in range(10):
    axes[i].set_axis_off()
    image = X_test[i].reshape(8, 8)
    axes[i].imshow(image, cmap=plt.cm.gray_r, interpolation="nearest")
    axes[i].set_title(f"True: {y_test[i]} \nPrediction: {predicted[i]}")
```

### Excerise 3.5: Plot a confusion matrix

We can also a confusion matrix of the true digit values and the predicted digit values to help us understand which digits the classifer did well with and which ones it struggled with. The X axis of the matrix, represents the predicted labels whilst the Y axis represents the true labels. The squares in the matrix are colourmapped based on frequency of predicted; so if the classifer does well then it should be a diagonal from the top left corner to the bottom left.

 * Identify the digit class with the highest correct count (largest diagonal value).
 * Which pairs of digits are most frequently confused?
 * What visual similarities might explain these confusions?
 * Is the distribution of errors uniform, or are certain digits systematically harder?




```python
disp = ConfusionMatrixDisplay.from_predictions(y_test, predicted)
disp.figure_.suptitle("Confusion Matrix")

plt.show()
```

### Exercise 3.6: Generate a classification report

Next we'll generate a classification report so we can see the precision, recall and f1-score  for each digit to help identify which digits it does well with and which it doesnt. Support simply refers to the frequency of that class.

 * Which digits have highest precision? What does that imply?
 * Which digits have lowest recall? Why might the model miss those digits more often?
 * Are some digits harder to classify because they appear less frequently?


```python
print(
    f"Classification report for classifier {clf}:\n"
    f"{classification_report(y_test, predicted)}\n"
)
```

### Exercise 3.7
Now try improving the accuracy of the classifer. There are many paramaters for the logistic regression algorithm that can improve its performance. Some include:
* Changing the regularization (C), try decreasing it, increasing it. See how it changes things.
* Change the solver. Different solvers are useful for different dataset problems, find the best one for the digits.
* Try adding in polynomial features to the pipeline, try setting the degrees to zero, then try increasing it.

https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html


```python
model = make_pipeline(LogisticRegression(C = 1, solver = 'lbfgs',  max_iter=1000))

model.fit(X_train, y_train)
y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)

print(f"Test accuracy: {acc:.4f}")

print(
    f"Classification report for classifier {clf}:\n"
    f"{classification_report(y_test, predicted)}\n"
)

disp = ConfusionMatrixDisplay.from_predictions(y_test, predicted)
disp.figure_.suptitle("Confusion Matrix")

plt.show()
```
