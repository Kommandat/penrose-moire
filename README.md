![party](https://user-images.githubusercontent.com/12615164/120043011-300e8b00-bfd9-11eb-84de-2419629dd574.png)

# Penrose-Moiré

A website to interact with Moiré patterns for Penrose tilings. Check it out at [penrosemoire.com](penrosemoire.com).

Built using [PaperJS](http://paperjs.org/), [Node and Express](https://expressjs.com/).

## What are Penrose tilings?

A Penrose tiling uses a few shapes but **never** repeats. To be precise, to "repeat" here means to demonstrate translational symmetry. The Penrose tiling I used for Penrose-Moiré consists of two rhombuses. Even though it's just the same two rhombuses repeated, the pattern never repeats! A small part of the pattern might repeat but if you zoom out, you'll see that it's not repeating. This is different from other perioding tilings, which do repeat (like the one below).

![An example of a periodic tiling](https://user-images.githubusercontent.com/12615164/120352063-68aaaf00-c2ce-11eb-8f39-f01e8c575fbf.png)

Visually, you can see how Penrose tilings don't repeat by layering two tilings over each other and seeing where the colors don't match. Below are two overlapping Penrose tilings. The pink and dark teal colors are visible where the tilings don't match. The pattern that emerges from layering two tilings is called a Moiré pattern.

![Example of a Moiré pattern for Penrose tilings](https://user-images.githubusercontent.com/12615164/120352366-b45d5880-c2ce-11eb-8f26-d93fe3547c90.png)

Now try it out yourself at [penrosemoire.com](penrosemoire.com)!

## How did you create the Penrose tilings?

The Penrose tilings are created using a process called deflation. The process is detailed [here](https://tartarus.org/~simon/20110412-penrose/penrose.xhtml), but in short, you start with a simple tiling and increase the number of tiles by breaking up larger tiles into smaller tiles while following some basic rules.




