# miniprojects
A collection of small projects I wasted my time on. A lot of them use the nom library render-space, which I made specifically for these projecys.

The projects are ordered below by how proud I am of each one of them, from highest to lowest.

### [game of life](https://gdor-11.github.io/miniprojects/dist/game_of_life)
Pretty self descriptive. It uses sparse encoding (planning to implement HashLife when I'm not lazy). It supports importing `.rle` and `.mc` files.

### [balls](https://gdor-11.github.io/miniprojects/dist/balls)
A "physics engine" that only supports dynamic balls and static infinite walls colliding elastically with each other. The only supported force is gravity, and the performance is terrible. Perhaps the single upside is that it uses continuous collision detection (CCD) instead of discrete collision detection (DCD)

### [infinite minesweeper](https://gdor-11.github.io/miniprojects/dist/infinite_minesweeper)
I made this to get an estimative at the answer to [this question](https://math.stackexchange.com/q/5061585/874213)

### [clone game](https://gdor-11.github.io/miniprojects/dist/clone_game)
Inspired by a math problem proposed by a teacher of mine, your objective is to deactivate all initial activated squares. You may deactivate a square S by clicking on it, but the squares to the right and to the top must be deactivated, and will be activated after you click on S. If you're up for a small challenge, prove why it's impossible to get to the objective.

### [interference](https://gdor-11.github.io/miniprojects/dist/interference)
A (very inefficient and probably incorrect) renderer of interference patterns

### [gabriels point](https://gdor-11.github.io/miniprojects/dist/gabriels_point)
Given a triangle ABC, its orthic triangle is the one formed by projecting A, B and C onto the sides of ABC. If you repeat this process many times, the triangles (generally) go smaller and smaller until they converge to a point. I asked my geometry teacher if this point is a known center of the triangle, and he couldn't answer, so I made this to see if I could identify it visually (I couldn't, lol). As to the name of this project, he joked that this was a known point called "Gabriel's point".

### [war exceptions](https://gdor-11.github.io/miniprojects/dist/war_exceptions)
I made this to look for patterns which coukd help answer [this question](https://math.stackexchange.com/q/5064903/874213)

### [plotter](https://gdor-11.github.io/miniprojects/dist/plotter)
Very barebones grapher. I don't even know why I made this.

### [mirrors](https://gdor-11.github.io/miniprojects/dist/mirrors)
I made this to visually show my geometrical optics teacher why a question was incorrect
