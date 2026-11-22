---
title: 'Workshop 4'
course: 'ML/AI Course'
description: 'Convolutional neural networks: find the pumpkins among vegetable photos, then read handwritten digits.'
date: 2026-11-11
authors: ['jan-lindroos']
---

In Workshop 3 you built networks from `nn.Linear` and `nn.ReLU` and trained them on house prices. This week you build a **convolutional neural network (CNN)** and use it to answer the question from Workshop 2: pumpkin or not pumpkin?

## The ideas

### A photo is a grid of numbers

Every pixel has 3 numbers: how red, green and blue it is. PyTorch stores a photo with shape **(3, 64, 64)**: colour channels, then height and width. A batch of photos has shape (photos, 3, 64, 64).

### Workshop 3's network ignores where pixels are

`nn.Linear` needs one row of numbers, so we would flatten the photo: 3 × 64 × 64 = **12,288 inputs**. But:

- `nn.Linear(12288, 64)` alone has **786,496 parameters**.
- It has no idea which pixels are next to each other.
- Move the pumpkin 8 pixels to the right and most of its inputs change, so it has to learn the pumpkin again in every position.

### A filter slides across the photo

A **filter** is a neuron that looks at a 3 × 3 patch: 9 weights and a bias, as in Workshop 3. It slides one pixel at a time and gives one number per position. Those numbers make a new image called a **feature map**.

The filter uses the same 9 weights everywhere, so it finds a pumpkin edge wherever it is. Without padding, a 3 × 3 filter turns a 64 × 64 image into 62 × 62.

These weights find vertical edges:

| | | |
|---|---|---|
| −1 | 0 | 1 |
| −2 | 0 | 2 |
| −1 | 0 | 1 |

### A convolution layer is many filters, and it learns them

We chose those weights by hand. In a CNN, training learns them, just like `fit` learnt Workshop 3's weights.

```python
nn.Conv2d(3, 16, kernel_size=3)  # 3 channels in (red, green, blue), 16 filters out.
```

- Each filter reads all 3 colour channels: 3 × 3 × 3 = 27 weights and 1 bias.
- 16 filters give 16 feature maps, which are the next layer's 16 input channels.
- Parameters: 16 × 28 = **448**, against **786,496** for the flattened `nn.Linear`.

Like `nn.Linear(a, b)`, the counts have to match up: the next layer must be `nn.Conv2d(16, ...)`.

### Pooling shrinks the feature maps

`nn.MaxPool2d(2)` keeps the biggest number in each 2 × 2 square, so it halves the height and width. The strong edges survive, the next filters see a wider area, and there are fewer numbers to process.

### Stack these, then make a decision

| Step | Shape |
|---|---|
| Photo | 3 × 64 × 64 |
| Conv, ReLU, Pool | 16 × 32 × 32 |
| Conv, ReLU, Pool | 32 × 16 × 16 |
| Flatten | 8,192 |
| Linear | 1 score |

- Early filters find edges and colours. Later filters combine them into textures, then parts, like a stem or ridges.
- **Flatten** turns the small feature maps into one row, and the `nn.Linear` from Workshop 3 makes the decision.

### From a score to an answer

- **Sigmoid** squashes the score into a probability between 0 and 1. Above 0.5, which is a score above 0, means pumpkin.
- The loss is **cross-entropy** from Workshop 1: confident mistakes cost most. `nn.BCEWithLogitsLoss()` applies the sigmoid and the loss in one step, so the network ends with `nn.Linear(..., 1)` and no activation.

### Accuracy misleads when pumpkins are rare

Only 100 of the 1,500 photos in each split are pumpkins. A model that always says "not pumpkin" is 93.3% accurate and finds none.

| Score | Question it answers |
|---|---|
| **Precision** | Of the photos it called pumpkins, how many were? |
| **Recall** | Of the real pumpkins, how many did it find? |
| **F1** | $\frac{2 \times P \times R}{P + R}$: high only when both are |

A low threshold finds every pumpkin but calls many other vegetables pumpkins: high recall, low precision. A high threshold does the opposite. F1 changes far more than accuracy does.

## Live coding: pumpkin or not pumpkin

### Getting started

- Open [Google Colab](https://colab.research.google.com/) and choose **File > New notebook in Drive**.
- Choose **Runtime > Change runtime type** and pick a **T4 GPU**.
- Copy each code block from this page into a new code cell with **+ Code**, then click the **play button** to run it. Work from top to bottom.

Run this cell first. It downloads 3,000 vegetable photos, 1 in 15 a pumpkin, and shrinks them to 64 × 64 pixels.

```python
%pip install -q datasets gradio

import torch
from datasets import load_dataset
from sklearn.metrics import f1_score
from torch import nn
from torch.utils.data import DataLoader, TensorDataset
from torchvision.transforms.functional import to_tensor

device = "cuda" if torch.cuda.is_available() else "cpu"  # Use the GPU if there is one.
vegetables = load_dataset("guydegnol/vegetables", revision="refs/convert/parquet")
PUMPKIN = vegetables["train"].features["label"].names.index("Pumpkin")


def photo_to_tensor(photo):  # Any photo becomes shape (3, 64, 64), values 0 to 1.
    return to_tensor(photo.convert("RGB").resize((64, 64)))


def to_tensors(split):
    X = torch.stack([photo_to_tensor(photo) for photo in split["image"]])
    y = (torch.tensor(split["label"]) == PUMPKIN).float()  # 1 for pumpkin, 0 for anything else.
    return X, y


X_train, y_train = to_tensors(vegetables["train"])
X_val, y_val = to_tensors(vegetables["validation"])
train = DataLoader(TensorDataset(X_train, y_train), batch_size=64, shuffle=True)  # Shuffled batches of 64.
valid = DataLoader(TensorDataset(X_val, y_val), batch_size=256)
```

| Name | What it is |
|---|---|
| `X_train`, `y_train` | 1,500 training photos, shape (1500, 3, 64, 64), and their labels: 1.0 for pumpkin, 0.0 otherwise |
| `X_val`, `y_val` | 1,500 validation photos and labels, the same shapes |
| `train`, `valid` | The same data in batches |
| `device` | The GPU if there is one, otherwise the CPU |
| `photo_to_tensor(photo)` | Turns any photo into a (3, 64, 64) tensor |

### 1. Build the model

```python
model = nn.Sequential(
    nn.Conv2d(3, 32, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
    nn.Conv2d(32, 32, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
    nn.Flatten(),
    nn.Linear(32 * 16 * 16, 1),
).to(device)

optimiser = torch.optim.AdamW(model.parameters(), lr=1e-3)
loss_fn = nn.BCEWithLogitsLoss()
```

- `padding=1` keeps the image at 64 × 64 through each convolution. Each `nn.MaxPool2d(2)` halves it, so after two blocks there are 32 feature maps of 16 × 16, and the Flatten gives 32 × 16 × 16 = 8,192 numbers.
- `.to(device)` puts the model on the GPU. The model and its inputs must be on the same device.
- `AdamW` is Adam from Workshop 3 with a small fix to how it shrinks the weights. For this model it behaves almost the same.

What happens if you delete the second `nn.MaxPool2d(2)`?

<details>
<summary>Answer</summary>

The Flatten then gives 32 × 32 × 32 = 32,768 numbers, and `nn.Linear` fails with `mat1 and mat2 shapes cannot be multiplied (64x32768 and 8192x1)`. The fix is `nn.Linear(32 * 32 * 32, 1)`. Printing `x.shape` after each layer is the way to find the right number.

</details>

### 2. Train it

```python
for epoch in range(20):
    print(f"EPOCH {epoch + 1}")

    model.train()
    train_loss = 0
    for x, y in train:
        x, y = x.to(device), y.to(device)
        optimiser.zero_grad()
        loss = loss_fn(model(x).squeeze(1), y)
        train_loss += loss.item() * len(y)
        loss.backward()
        optimiser.step()
    print(f"TRAIN LOSS {train_loss / len(train.dataset)}")

    model.eval()
    valid_loss = 0
    with torch.no_grad():
        for x, y in valid:
            x, y = x.to(device), y.to(device)
            loss = loss_fn(model(x).squeeze(1), y)
            valid_loss += loss.item() * len(y)
    print(f"VALIDATION LOSS {valid_loss / len(valid.dataset)}")
```

- The training loop is Workshop 3's `fit` with two changes. It goes through the photos in shuffled batches of 64, and each batch goes to the device. One pass through all the photos is an **epoch**.
- The model outputs shape (64, 1) for a batch but the labels have shape (64,), so `.squeeze(1)` makes them match.
- `loss.item() * len(y)` adds up the loss over every photo in the batch. Dividing by the number of photos gives the average loss per photo for the epoch.
- `model.train()` and `model.eval()` switch layers such as `nn.Dropout` between training and predicting. This model has none, so they change nothing yet, but they are a good habit.
- The validation loop uses `torch.no_grad()` and no optimiser. It only measures, so the model never learns from the validation photos.

If the training loss keeps falling while the validation loss starts rising, the model is overfitting and fewer epochs would be better.

A model that always says "not pumpkin" gets a loss of about 0.25. The validation loss needs to fall well below that for the model to be finding pumpkins.

### 3. Measure F1

The loop prints losses, not F1. A score above 0 means pumpkin.

```python
model.eval()
with torch.no_grad():
    scores = torch.cat([model(x.to(device)).squeeze(1).cpu() for x, _ in valid])

predictions = (scores > 0).float()
print(f1_score(y_val, predictions))
```

### 4. Try your model

Upload a photo, take one with your webcam, or click an example.

```python
import gradio as gr


def predict(photo):
    with torch.no_grad():
        p = torch.sigmoid(model(photo_to_tensor(photo)[None].to(device))).item()
    return {"Pumpkin": p, "Not pumpkin": 1 - p}


examples = []
for i in [1200, 1210, 1220, 0, 300, 600, 900, 1100, 1400]:  # Validation photos 1200 to 1299 are pumpkins.
    vegetables["validation"][i]["image"].save(f"example_{i}.jpg")
    examples.append(f"example_{i}.jpg")

gr.Interface(predict, gr.Image(type="pil"), gr.Label(), examples=examples).launch()
```

`[None]` adds the batch dimension, so one photo becomes a batch of one.

Try a carved Halloween pumpkin. It may well get a low probability, because the model only knows the market pumpkins it was trained on.

## Lab: handwritten digits (35 minutes)

Train a CNN on [MNIST](https://huggingface.co/datasets/ylecun/mnist): 70,000 photos of handwritten digits, 0 to 9, each 28 × 28 pixels in black and white.

Start a new notebook with **File > New notebook in Drive**, work out what has to change from the pumpkin code, and tell us your test accuracy.

- [`torchvision.datasets.MNIST`](https://pytorch.org/vision/stable/generated/torchvision.datasets.MNIST.html): load MNIST in one line
- [PyTorch Quickstart](https://pytorch.org/tutorials/beginner/basics/quickstart_tutorial.html): a network for Fashion-MNIST, a close cousin, from start to finish
- [`nn.CrossEntropyLoss`](https://pytorch.org/docs/stable/generated/torch.nn.CrossEntropyLoss.html): the loss for choosing one of ten answers
- [A CNN on MNIST](https://adamharley.com/nn_vis/cnn/2d.html): draw a digit and watch every layer respond
- [PyTorch's MNIST example](https://github.com/pytorch/examples/tree/main/mnist): a complete solution, for after you have tried

The ten digits are roughly equally common, so accuracy is a fair score here. Always guessing the same digit scores about 11%.

<details>
<summary>Hint: what changes from the pumpkin code</summary>

| | Pumpkins | MNIST |
|---|---|---|
| Photo shape | (3, 64, 64): colour | (1, 28, 28): black and white, so the first layer is `nn.Conv2d(1, ...)` |
| After two pools | 16 × 16 | 7 × 7 |
| Answer | 1 score, pumpkin or not | 10 scores, one per digit: `nn.Linear(..., 10)` |
| Loss | `nn.BCEWithLogitsLoss()`, with `.squeeze(1)` | `nn.CrossEntropyLoss()`, with whole-number labels 0 to 9 and no squeeze |
| Prediction | A score above 0 | `model(x).argmax(1)`: the digit with the highest score |
| Score | F1 | Accuracy |

</details>

<details>
<summary>Answer</summary>

```python
import torch, torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms

device = "cuda" if torch.cuda.is_available() else "cpu"
tf = transforms.Compose([transforms.ToTensor(), transforms.Normalize((0.1307,), (0.3081,))])
train = DataLoader(datasets.MNIST("data", train=True, download=True, transform=tf), batch_size=128, shuffle=True)
test = DataLoader(datasets.MNIST("data", train=False, download=True, transform=tf), batch_size=256)

model = nn.Sequential(
    nn.Conv2d(1, 32, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),  # 1 × 28 × 28 becomes 32 × 14 × 14.
    nn.Conv2d(32, 64, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),  # Then 64 × 7 × 7.
    nn.Flatten(), nn.Linear(64 * 7 * 7, 10),
).to(device)
opt = torch.optim.Adam(model.parameters(), lr=1e-3)
loss_fn = nn.CrossEntropyLoss()

for epoch in range(3):
    model.train()
    for x, y in train:
        x, y = x.to(device), y.to(device)
        opt.zero_grad()
        loss_fn(model(x), y).backward()
        opt.step()

    model.eval()
    correct = 0
    with torch.no_grad():
        for x, y in test:
            correct += (model(x.to(device)).argmax(1) == y.to(device)).sum().item()
    print(f"epoch {epoch + 1}: test acc {correct / len(test.dataset):.4f}")
```

A CNN like this usually reaches about 98 to 99% test accuracy within 3 epochs.

</details>

### Going further

- Train for more epochs, or add more filters.
- Add `nn.Dropout` before the last `nn.Linear`.
- Keep some training photos back as a validation set with `torch.utils.data.random_split`, and use it to choose your settings. Use the test photos once at the end.
- Plot the digits the model gets wrong.
- Try Fashion-MNIST with `datasets.FashionMNIST`. It has the same shape but is much harder.
