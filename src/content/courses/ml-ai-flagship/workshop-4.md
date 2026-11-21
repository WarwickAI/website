---
title: 'Workshop 4'
course: 'ML/AI Course'
description: 'Hugging Face and transfer learning: build a chatbot, fine-tune a fruit classifier, then detect angry messages.'
order: 4
authors: ['shaana-amarawickrama', 'tanvi-patnayukuni', 'sameer-gupta']
---

Follow along with the slides, then work through the lab below.

## Getting started (2 minutes)

- Open [Google Colab](https://colab.research.google.com/) and choose **File > New notebook in Drive**.
- Choose **Runtime > Change runtime type** and pick a **GPU**. If you get an error later, check you are on a GPU runtime and run all the cells again.
- Copy each code block from this page into a new code cell with **+ Code**, fill in any `???`, then click the **play button** to run it. Work from top to bottom.

This session uses three libraries from **Hugging Face**, plus **Gradio** for simple apps:

| Library | What it does |
|---|---|
| `transformers` | Downloads pretrained models and runs them |
| `datasets` | Downloads datasets from the Hugging Face Hub |
| `gradio`, shortened to `gr` | Turns a Python function into a small web app |

```python
import time  # Measures time.
import gradio as gr  # Builds interactive apps for models.
from transformers import pipeline  # Runs a pretrained model in one line.
import numpy as np  # Does maths on many numbers at once.
from datasets import load_dataset  # Downloads datasets from the Hugging Face Hub.
from transformers import AutoModelForImageClassification, AutoImageProcessor, AutoConfig, TrainingArguments, Trainer
# AutoModelForImageClassification: loads a pretrained image classifier.
# AutoImageProcessor: prepares images for that model.
# AutoConfig: loads information about a pretrained model.
# TrainingArguments: the settings for training, such as learning rate and epochs.
# Trainer: runs the training loop for us.
```

## Code along: a chatbot

The goal is a simple chatbot built on a small pretrained language model, **Qwen3-1.7B**.

```python
MODEL = "Qwen/Qwen3-1.7B"  # The name of the model on the Hub.

# A pipeline that generates text with the model.
pipe_chat = pipeline("text-generation", model=MODEL)


def chat(message, history):
    # Each message is a dictionary. "/no_think" tells the model not to explain its reasoning.
    messages = [{"role": "user", "content": message + " /no_think"}]
    out = pipe_chat(messages)

    # Return only the chatbot's newest response.
    return out[0]["generated_text"][-1]["content"]


gr.ChatInterface(chat, title="Chatbot without History").launch()
```

This chatbot forgets everything you said before. Can we make it remember previous messages?

<details>
<summary>Answer</summary>

Gradio passes the earlier conversation in as `history`. Copy each old message into `messages` before adding the new one, so the model sees the whole conversation.

```python
def chat(message, history):
    messages = []

    # Add every earlier message, from the user or the assistant.
    for old_message in history:
        role = old_message["role"]
        content = old_message["content"][0]["text"]  # The text from the first content block.
        messages.append({"role": role, "content": content})

    # Add the user's new message.
    messages.append({"role": "user", "content": message + " /no_think"})

    out = pipe_chat(messages)
    return out[0]["generated_text"][-1]["content"]


gr.ChatInterface(chat, title="Chatbot with History").launch()
```

</details>

## Lab: Fruit classifier

Now you fine-tune an image model to recognise fruit.

### 1. Load the data

Inspect the [Fruits-30 dataset](https://huggingface.co/datasets/VinayHajare/Fruits-30) on Hugging Face. Fill in the dataset name, and the split in the square brackets. From the dataset page, should the split be `"test"` or `"train"`? The cell should show an example image.

```python
dataset = load_dataset(???)[???]  # Fill in these two.
dataset[4]["image"]
```

<details>
<summary>Answer</summary>

The dataset name is the part of the URL after `datasets/`. Fruits-30 only has a `train` split.

```python
dataset = load_dataset("VinayHajare/Fruits-30")["train"]
dataset[4]["image"]
```

</details>

### 2. Load a pretrained model

You don't need to set up the image processor or the model yourself. Give Hugging Face the name of the model you want, Google's **vision transformer** (ViT), and it picks a sensible setup. The documentation for [Auto Classes](https://huggingface.co/docs/transformers/v5.2.0/en/model_doc/auto#transformers.AutoModel) and [image processors](https://huggingface.co/docs/transformers/en/main_classes/image_processor) explains more. Run this cell.

```python
labels = dataset.features["label"].names

model_name = "google/vit-base-patch16-224"
processor = AutoImageProcessor.from_pretrained(model_name)
model = AutoModelForImageClassification.from_pretrained(model_name, num_labels=len(labels), ignore_mismatched_sizes=True)

# The model predicts IDs like 1, not names like Limes. These look-up tables
# give nicer output, but don't change how the model works.
model.config.id2label = {i: name for i, name in enumerate(labels)}
model.config.label2id = {name: i for i, name in enumerate(labels)}
```

### 3. Freeze the model

The dataset is small, so retraining the whole model is a bad idea. Instead, **freeze** the main part of the model and only train the new final layer.

Being able to use online resources is an important skill. [This forum answer](https://discuss.huggingface.co/t/how-to-freeze-layers-using-trainer/4702) is the first result on Google. Adapt it for our model.

```python
for param in model.vit.parameters():
    # Turn off autograd for param here; replace this comment with some code
```

<details>
<summary>Answer</summary>

A parameter with `requires_grad = False` gets no gradient, so training leaves it unchanged.

```python
for param in model.vit.parameters():
    param.requires_grad = False
```

</details>

### 4. Prepare the images

Run this preprocessing step. It is the standard template from Hugging Face's website. It also keeps 20% of the images back to test the model.

```python
def preprocess(batch):
    images = [img.convert("RGB") for img in batch["image"]]
    inputs = processor(images)
    inputs["labels"] = batch["label"]
    return inputs

ds = dataset.map(preprocess, batched=True, batch_size=8, writer_batch_size=8, remove_columns=dataset.column_names)
ds.set_format("torch")
ds = ds.train_test_split(test_size=0.2)
```

### 5. Train

This is also template code, from Hugging Face's [Trainer documentation](https://huggingface.co/docs/transformers/en/trainer). You fill in the settings and delete what you don't need. Look up any setting you don't understand.

1. Set the number of training epochs to **3**.
2. Set the training batch size to **8**.
3. Save the model as `/content/fruit-model` (type this in as a string).

```python
trainer = Trainer(
    model=model,
    args=TrainingArguments(
        "fruit-model",
        num_train_epochs=???,
        per_device_train_batch_size=???,
        per_device_eval_batch_size=8,
        learning_rate=1e-3,
        eval_strategy="epoch",
        save_strategy="no",
        report_to="none"
    ),
    train_dataset=ds["train"],
    eval_dataset=ds["test"]
)

# Train the model.
trainer.train()

# Save the final trained model.
trainer.save_model(???)
processor.save_pretrained(???)
```

<details>
<summary>Answer</summary>

```python
trainer = Trainer(
    model=model,
    args=TrainingArguments(
        "fruit-model",
        num_train_epochs=3,  # Go through the training images 3 times.
        per_device_train_batch_size=8,  # Process 8 images at a time.
        per_device_eval_batch_size=8,
        learning_rate=1e-3,
        eval_strategy="epoch",  # Test after each epoch.
        save_strategy="no",  # Don't save a checkpoint after every epoch.
        report_to="none"
    ),
    train_dataset=ds["train"],
    eval_dataset=ds["test"]
)

trainer.train()

trainer.save_model("/content/fruit-model")
processor.save_pretrained("/content/fruit-model")
```

</details>

### 6. Try it out

Read the [pipelines documentation](https://huggingface.co/docs/transformers/en/main_classes/pipelines) and fill in the code below. Then run the app and try some fruits the model saw in the dataset, to check training worked.

<details>
<summary>Hint</summary>

What type of classification is this? You just saved the model as `/content/fruit-model`.

</details>

```python
pipe = pipeline(???, model=???)
```

```python
def classify(image):
    results = pipe(image)
    return {r["label"]: r["score"] for r in results}

demo = gr.Interface(
    fn=classify,
    inputs=gr.Image(type="pil"),
    outputs=gr.Label(num_top_classes=5),
    title="Fruit Classifier",
)

demo.launch()
```

<details>
<summary>Answer</summary>

```python
pipe = pipeline("image-classification", model="/content/fruit-model")
```

</details>

## Independent exercise: an anger detector

Time to use everything from today. A celebrity wants to filter angry messages out of their DMs automatically. Build a simple proof of concept that gives each message an anger score.

- **Hint 1:** find a model that already detects anger as an emotion, so you don't have to train one. Ask if you need help choosing.
- **Hint 2:** use a `text-classification` pipeline.
- **Hint 3:** print what the pipeline returns, then loop through it to find anger. AI can help with this if you show it the output. Return a backup value such as `0` if anger isn't found, or change the pipeline's `top_k` setting so every emotion is returned.

```python
emotion_pipe = ???

def get_anger(text) -> float:
    # Run the text through the pipeline
    # Find the anger result
    # Extract the score (and possibly round it to 2 d.p.)

    return ???
```

```python
gr.Interface(
    fn=get_anger,
    inputs=gr.Textbox(label="Type a message."),
    outputs="text",
    title="Message Anger Analyser"
).launch()
```

<details>
<summary>Answer</summary>

One model that detects anger is [`j-hartmann/emotion-english-distilroberta-base`](https://huggingface.co/j-hartmann/emotion-english-distilroberta-base). `top_k=None` makes the pipeline return a score for every emotion, so anger is always in the list.

```python
emotion_pipe = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    top_k=None,
)

def get_anger(text) -> float:
    result = emotion_pipe(text)

    anger_score = 0
    for emotion in result[0]:
        if emotion["label"] == "anger":
            anger_score = round(emotion["score"], 2)

    return anger_score
```

</details>
