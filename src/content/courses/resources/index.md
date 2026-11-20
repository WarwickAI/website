---
title: 'Resources'
course: 'Resources'
description: "Stuff we'd actually recommend if you're getting into AI."
date: 2026-11-19
authors: ['joshua-tso', 'finlay-sanders']
---

Stuff we'd actually recommend if you're getting into AI. New to all this? Start at the top.

**How long it takes**

🕒 an afternoon or less · 🕒🕒 a few days to a week · 🕒🕒🕒 a few weeks or more

**How technical it is**

🔥 beginner friendly · 🔥🔥 some maths/coding needed · 🔥🔥🔥 heavy going

⭐ = my favourites/ highly recommended

---

## Start here

**[3Blue1Brown – Neural Networks](https://www.3blue1brown.com/topics/neural-networks)** 🕒 🔥 ⭐

Really nice visual explanation of how neural nets learn. You can watch it on the bus. Trust bro you're going to like it

**[Andrew Ng – Machine Learning Specialization](https://www.coursera.org/specializations/machine-learning-introduction)** 🕒🕒🕒 🔥

It's a classic and pretty much everyone's done it. Good grounding in the basics.

**[Karpathy – Neural Networks: Zero to Hero](https://karpathy.ai/zero-to-hero.html)** 🕒🕒🕒 🔥🔥 ⭐

Starts with backprop by hand and ends with you building a GPT from scratch. Karpathy is one of the leading AI researchers who worked at Tesla, OpenAI, Anthropic. V good course

---

## Deep learning

**[Dive into Deep Learning](https://d2l.ai/)** 🕒🕒🕒 🔥🔥

Textbook with code you can run for every section. Free online, or you can buy it [in print](https://www.amazon.co.uk/dp/1009389432).

**[Stanford CS231n](https://cs231n.stanford.edu)** 🕒🕒🕒 🔥🔥🔥

Stanford's computer vision course. The lecture notes on CNNs and backprop are some of the best out there.

**[fast.ai – Practical Deep Learning for Coders](https://course.fast.ai/)** 🕒🕒🕒 🔥

You train real models from lesson one and pick up the theory along the way. Good if you learn by doing.

**[The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/)** 🕒 🔥🔥 ⭐

Jay Alammar's diagrams of how transformers work. Read this before you try to understand any LLM paper.

---

## Reinforcement learning

### Learning it

**[Spinning Up in Deep RL](https://spinningup.openai.com/en/latest/)** 🕒🕒 🔥🔥 ⭐

OpenAI's written intro to RL and the main policy gradient algorithms, with reference code. Best place to start.

**[Deriving the simplest policy gradient](https://spinningup.openai.com/en/latest/spinningup/rl_intro3.html#deriving-the-simplest-policy-gradient)** 🕒 🔥🔥🔥

The section of Spinning Up where policy gradients finally click.

**[Karpathy – Pong from Pixels](https://karpathy.github.io/2016/05/31/rl/)** 🕒 🔥🔥

The 🐐 Karpathy again. Trains a Pong agent in about 130 lines of Python.

**[Hugging Face Deep RL Course](https://huggingface.co/learn/deep-rl-course)** 🕒🕒🕒 🔥🔥

Free and hands on, from Q-learning up to PPO, with notebooks.

**[David Silver's RL lectures](https://www.davidsilver.uk/teaching/)** 🕒🕒🕒 🔥🔥🔥

The UCL course from the guy who led AlphaGo. Proper theory.

**[Sutton & Barto](http://incompleteideas.net/book/RLbook2020.pdf)** 🕒🕒🕒 🔥🔥🔥

The og bible. Free PDF. More of a reference than something you read cover to cover.

### Going further

**[The 37 Implementation Details of PPO](https://iclr-blog-track.github.io/2022/03/25/ppo-implementation-details/)** 🕒🕒 🔥🔥🔥 ⭐

The PPO bible. All the stuff the paper leaves out that you need to actually get it working.

**[Entity-Based RL](https://clemenswinter.com/2023/04/14/entity-based-reinforcement-learning/)** 🕒 🔥🔥🔥

Clemens Winter on entity encoding, which is a cornerstone once your observations get complicated.

### Libraries

**[Gymnasium](https://gymnasium.farama.org/)** 🔥

The standard environment API. Pretty much everything below plugs into it.

**[Stable-Baselines3](https://stable-baselines3.readthedocs.io/en/master/)** 🔥

Best beginner library. Get an agent training in a few lines.

**[CleanRL](https://github.com/vwxyzjn/cleanrl/blob/master/cleanrl/ppo.py)** 🔥🔥

Best library for learning. Each algorithm is one readable file.

**[PufferLib](https://puffer.ai/docs.html)** 🔥🔥🔥

Best library for frontier work. Very fast.

---

## Tooling

**[10 minutes to pandas](https://pandas.pydata.org/docs/user_guide/10min.html)** 🕒 🔥

Fundamental for datascience/ ML work.

**[NumPy for absolute beginners](https://numpy.org/doc/stable/user/absolute_beginners.html)** 🕒 🔥

Arrays and broadcasting. Everything else is built on this.

**[PyTorch tutorials](https://pytorch.org/tutorials/)** 🕒🕒 🔥🔥

Start with "Learn the Basics".

**[Weights & Biases](https://docs.wandb.ai/)** 🔥

Logs your training runs so you can compare them instead of scrolling back through your terminal.

**[uv](https://docs.astral.sh/uv/)** 🔥

Fast Python package and environment manager. Will save you a lot of dependency pain.

