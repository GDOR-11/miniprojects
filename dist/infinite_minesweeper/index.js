(() => {
  // node_modules/vecti/dist/index.mjs
  var e = Object.defineProperty;
  var y = (h, t, s) => t in h ? e(h, t, { enumerable: true, configurable: true, writable: true, value: s }) : h[t] = s;
  var n = (h, t, s) => y(h, typeof t != "symbol" ? t + "" : t, s);
  var i = class _i {
    /**
     * Create a vector with the given components.
     * @param x - The component of the x-axis.
     * @param y - The component of the y-axis.
     * @returns The vector.
     */
    constructor(t, s) {
      n(this, "x");
      n(this, "y");
      this.x = t, this.y = s;
    }
    /**
     * Create a vector with the given components.
     * @param x - The component of the x-axis.
     * @param y - The component of the y-axis.
     * @returns The vector.
     */
    static of([t, s]) {
      return new _i(t, s);
    }
    /**
     * Add another vector to the vector.
     * @param val - The vector to be added.
     * @returns The resulting vector of the addition.
     */
    add(t) {
      return new _i(this.x + t.x, this.y + t.y);
    }
    /**
     * Subtract another vector from the vector.
     * @param val - The vector to be added.
     * @returns The resulting vector of the subtraction.
     */
    subtract(t) {
      return new _i(this.x - t.x, this.y - t.y);
    }
    /**
     * Multiply the vector by a scalar.
     * @param scalar - The scalar the vector will be multiplied by.
     * @returns The resulting vector of the multiplication.
     */
    multiply(t) {
      return new _i(this.x * t, this.y * t);
    }
    /**
     * Divide the vector by a scalar.
     * @param scalar - The scalar the vector will be divided by.
     * @returns The resulting vector of the division.
     */
    divide(t) {
      return new _i(this.x / t, this.y / t);
    }
    /**
     * Calculate the dot product of the vector and another vector.
     * @param other - The other vector used for calculating the dot product.
     * @returns The dot product.
     */
    dot(t) {
      return this.x * t.x + this.y * t.y;
    }
    /**
     * Calculate the cross product of the vector and another vector. The cross product of two vectors `a` and `b` is defined as `a.x * b.y - a.y * b.x`.
     * @param other - The other vector used for calculating the cross product.
     * @returns The cross product.
     */
    cross(t) {
      return this.x * t.y - t.x * this.y;
    }
    /**
     * Calculate the Hadamard product of the vector and another vector.
     * @param other - The other vector used for calculating the Hadamard product.
     * @returns The Hadamard product.
     */
    hadamard(t) {
      return new _i(this.x * t.x, this.y * t.y);
    }
    /**
     * Calculate the length of the vector using the L2 norm.
     * @returns The length.
     */
    length() {
      return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
    /**
     * Normalize the vector using the L2 norm.
     * @returns The normalized vector.
     */
    normalize() {
      const t = this.length();
      return new _i(this.x / t, this.y / t);
    }
    /**
     * Rotate the vector by the given radians counterclockwise.
     * @param radians - The radians the vector will be rotated by.
     * @returns The rotated vector.
     */
    rotateByRadians(t) {
      const s = Math.cos(t), r = Math.sin(t);
      return new _i(this.x * s - this.y * r, this.x * r + this.y * s);
    }
    /**
     * Rotate the vector by the given degrees counterclockwise.
     * @param degrees - The degrees the vector will be rotated by.
     * @returns The rotated vector.
     */
    rotateByDegrees(t) {
      return this.rotateByRadians(t * Math.PI / 180);
    }
  };

  // src/infinite_minesweeper/tile.ts
  var Tile = class {
    constructor(state = 0 /* Unknown */, mine = Math.random() < difficulty) {
      this.state = state;
      this.mine = mine;
    }
  };

  // src/infinite_minesweeper/screen_view.ts
  var view_center = new i(0, 0);
  var view_zoom = 50;
  function setViewCenter(new_center) {
    view_center = new_center;
  }
  function setViewZoom(new_zoom) {
    view_zoom = new_zoom;
  }
  var screen_center = new i(window.innerWidth, window.innerHeight).divide(2);
  function world2screen(world) {
    return typeof world === "number" ? world * view_zoom : world.subtract(view_center).multiply(view_zoom).add(screen_center);
  }
  function screen2world(screen) {
    return typeof screen === "number" ? screen / view_zoom : screen.subtract(screen_center).divide(view_zoom).add(view_center);
  }
  function screen2world_round(screen) {
    let world = screen2world(screen);
    return new i(Math.round(world.x), Math.round(world.y));
  }

  // src/infinite_minesweeper/utils.ts
  function neighborhood(center) {
    let neighborhood2 = [];
    for (let x = center.x - 1; x <= center.x + 1; x++) {
      for (let y2 = center.y - 1; y2 <= center.y + 1; y2++) {
        if (x === center.x && y2 === center.y) continue;
        neighborhood2.push(new i(x, y2));
      }
    }
    return neighborhood2;
  }

  // src/infinite_minesweeper/minefield.ts
  var Minefield = class {
    constructor() {
      this.a = new i(-1, -1);
      this.b = new i(1, 1);
      this.field = { [-1]: {}, 0: {}, 1: {} };
      for (let pos of neighborhood(new i(0, 0))) {
        this.field[pos.x][pos.y] = new Tile(0 /* Unknown */, false);
      }
      this.field[0][0] = new Tile(2 /* Revealed */, false);
    }
    getTile(coordinate) {
      return this.field?.[coordinate.x]?.[coordinate.y];
    }
    getTileState(coordinate) {
      return this.getTile(coordinate)?.state || 0 /* Unknown */;
    }
    getNeighborMineCount(coordinate) {
      let count = 0;
      for (let neighbor of neighborhood(coordinate)) {
        count += this.getTile(neighbor)?.mine ? 1 : 0;
      }
      return count;
    }
    getOuterBorderTiles() {
      let queue = (() => {
        let pos = new i(0, this.a.y);
        while (this.getTile(pos).state !== 2 /* Revealed */) pos = new i(0, pos.y + 1);
        return [pos];
      })();
      let tiles = queue.slice();
      let is_border_tile = (pos) => neighborhood(pos).find((neighbor) => this.getTileState(neighbor) === 0 /* Unknown */) !== void 0;
      while (queue.length > 0) {
      }
    }
    expandField(left, right, top, bottom) {
      this.a = this.a.subtract(new i(left, top));
      this.b = this.b.add(new i(right, bottom));
      for (let x = this.a.x; x <= this.b.x; x++) {
        this.field[x] ??= {};
        for (let y2 = this.a.y; y2 <= this.b.y; y2++) {
          this.field[x][y2] ??= new Tile();
        }
      }
    }
    expandToTile(coordinate) {
      if (coordinate.x - 1 < this.a.x) this.expandField(1 + this.a.x - coordinate.x, 0, 0, 0);
      if (coordinate.x + 1 > this.b.x) this.expandField(0, 1 + coordinate.x - this.b.x, 0, 0);
      if (coordinate.y - 1 < this.a.y) this.expandField(0, 0, 1 + this.a.y - coordinate.y, 0);
      if (coordinate.y + 1 > this.b.y) this.expandField(0, 0, 0, 1 + coordinate.y - this.b.y);
    }
    setTileState(coordinate, state) {
      this.expandToTile(coordinate);
      let tile = this.getTile(coordinate);
      if (tile === null) throw "what the fuck";
      tile.state = state;
      return tile;
    }
    detailed_render(ctx2) {
      let A = screen2world_round(new i(0, 0));
      let B = screen2world_round(new i(window.innerWidth, window.innerHeight));
      ctx2.strokeStyle = "grey";
      for (let x = A.x - 0.5; x <= B.x + 0.5; x++) {
        let screen_x = world2screen(new i(x, 0)).x;
        ctx2.beginPath();
        ctx2.moveTo(screen_x, 0);
        ctx2.lineTo(screen_x, window.innerHeight);
        ctx2.stroke();
      }
      for (let y2 = A.y - 0.5; y2 <= B.y + 0.5; y2++) {
        let screen_y = world2screen(new i(0, y2)).y;
        ctx2.beginPath();
        ctx2.moveTo(0, screen_y);
        ctx2.lineTo(window.innerWidth, screen_y);
        ctx2.stroke();
      }
      const text_size = 0.75;
      for (let x = A.x; x <= B.x; x++) {
        for (let y2 = A.y; y2 <= B.y; y2++) {
          let pos = new i(x, y2);
          let pixel = world2screen(pos);
          let text = "";
          switch (this.getTileState(pos)) {
            case 1 /* Flagged */:
              ctx2.fillStyle = "blue";
              text = "F";
              break;
            case 2 /* Revealed */:
              let mine = this.getTile(pos).mine;
              ctx2.fillStyle = mine ? "red" : "white";
              text = mine ? "M" : this.getNeighborMineCount(pos).toString();
              break;
          }
          if (text === "") continue;
          ctx2.textAlign = "center";
          ctx2.textBaseline = "top";
          ctx2.font = world2screen(text_size) + "px monospace";
          ctx2.fillText(text, pixel.x, pixel.y - world2screen(7 * text_size / 16));
        }
      }
    }
    simple_render(ctx2) {
      let tile_sidelength = world2screen(1);
      for (let i2 in this.field) {
        let x = Number(i2);
        let row = this.field[x];
        for (let j in row) {
          let y2 = Number(j);
          let tile = row[y2];
          if (tile.state === 0 /* Unknown */) continue;
          let screen = world2screen(new i(x, y2));
          if (screen.x < -10) break;
          if (screen.x > window.innerWidth + 10) break;
          if (screen.y < -10) continue;
          if (screen.y > window.innerHeight + 10) continue;
          if (tile.state === 1 /* Flagged */) ctx2.fillStyle = "blue";
          if (tile.state === 2 /* Revealed */) ctx2.fillStyle = tile.mine ? "red" : "white";
          ctx2.fillRect(screen.x - tile_sidelength / 2, screen.y - tile_sidelength / 2, tile_sidelength, tile_sidelength);
        }
      }
    }
    render(ctx2) {
      if (view_zoom > 10) {
        this.detailed_render(ctx2);
      } else {
        this.simple_render(ctx2);
      }
    }
  };

  // src/infinite_minesweeper/solvers.ts
  async function trivialSolver(minefield2, on_update) {
    let queue = [];
    let on_new_information = async (pos) => {
      for (let neighbor of neighborhood(pos).concat([pos])) {
        if (queue.find((p) => p.x === neighbor.x && p.y === neighbor.y) !== void 0) continue;
        queue.push(neighbor);
      }
      await on_update();
    };
    while (queue.length > 0) {
      let pos = queue[0];
      if (minefield2.getTileState(pos) !== 2 /* Revealed */) {
        queue.shift();
        continue;
      }
      let unknown_count = 0;
      let flag_count = 0;
      for (let neighbor of neighborhood(pos)) {
        let state = minefield2.getTileState(neighbor);
        if (state === 0 /* Unknown */) unknown_count++;
        if (state === 1 /* Flagged */) flag_count++;
      }
      let mine_count = minefield2.getNeighborMineCount(pos);
      if (unknown_count === mine_count - flag_count) {
        for (let neighbor of neighborhood(pos)) {
          let state = minefield2.getTileState(neighbor);
          if (state === 0 /* Unknown */) {
            minefield2.setTileState(neighbor, 1 /* Flagged */);
            await on_new_information(neighbor);
          }
        }
      }
      if (flag_count === mine_count) {
        for (let neighbor of neighborhood(pos)) {
          let state = minefield2.getTileState(neighbor);
          if (state === 0 /* Unknown */) {
            minefield2.setTileState(neighbor, 2 /* Revealed */);
            await on_new_information(neighbor);
          }
        }
      }
      queue.shift();
    }
  }

  // src/infinite_minesweeper/index.ts
  var difficulty = Number(prompt("difficulty [0-1]"));
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  var minefield = new Minefield();
  function render() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    minefield.render(ctx);
  }
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    render();
  }
  window.onresize = resize;
  resize();
  var pointers = {};
  window.onpointerdown = (event) => {
    pointers[event.pointerId] = {
      last_pos: new i(event.x, event.y),
      total_distance: 0,
      pressed: Date.now()
    };
  };
  window.onpointermove = (event) => {
    let moved_pointer = pointers[event.pointerId];
    let pos = new i(event.x, event.y);
    let last_pos = moved_pointer.last_pos;
    moved_pointer.total_distance += pos.subtract(moved_pointer.last_pos).length();
    moved_pointer.last_pos = pos;
    if (moved_pointer.total_distance < 10) return;
    switch (Object.keys(pointers).length) {
      case 1:
        let movement = new i(screen2world(event.movementX), screen2world(event.movementY));
        setViewCenter(view_center.subtract(movement));
        break;
      case 2:
        let anchor_id = parseInt(Object.keys(pointers).filter((id) => id !== event.pointerId + "")[0]);
        let anchor_pointer = pointers[anchor_id];
        let center_movement = screen2world(pos).subtract(screen2world(last_pos)).divide(2);
        let amplification = pos.subtract(anchor_pointer.last_pos).length() / last_pos.subtract(anchor_pointer.last_pos).length();
        setViewCenter(view_center.subtract(center_movement));
        setViewZoom(view_zoom * amplification);
        break;
    }
  };
  window.onpointerup = (event) => {
    delete pointers[event.pointerId];
  };
  (async () => {
    while (true) {
      minefield = new Minefield();
      let last_update = Date.now();
      await trivialSolver(minefield, async () => {
        if (Date.now() - last_update > 100) {
          render();
          await new Promise((r) => setTimeout(r, 1));
          last_update = Date.now();
        }
      });
      render();
      await new Promise((r) => setTimeout(r, 1));
    }
  })();
})();
//# sourceMappingURL=index.js.map
