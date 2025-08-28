(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // node_modules/gl-matrix/esm/common.js
  var EPSILON = 1e-6;
  var ARRAY_TYPE = typeof Float32Array !== "undefined" ? Float32Array : Array;
  var RANDOM = Math.random;
  var degree = Math.PI / 180;
  if (!Math.hypot) Math.hypot = function() {
    var y = 0, i = arguments.length;
    while (i--) {
      y += arguments[i] * arguments[i];
    }
    return Math.sqrt(y);
  };

  // node_modules/gl-matrix/esm/mat2d.js
  var mat2d_exports = {};
  __export(mat2d_exports, {
    add: () => add,
    clone: () => clone,
    copy: () => copy,
    create: () => create,
    determinant: () => determinant,
    equals: () => equals,
    exactEquals: () => exactEquals,
    frob: () => frob,
    fromRotation: () => fromRotation,
    fromScaling: () => fromScaling,
    fromTranslation: () => fromTranslation,
    fromValues: () => fromValues,
    identity: () => identity,
    invert: () => invert,
    mul: () => mul,
    multiply: () => multiply,
    multiplyScalar: () => multiplyScalar,
    multiplyScalarAndAdd: () => multiplyScalarAndAdd,
    rotate: () => rotate,
    scale: () => scale,
    set: () => set,
    str: () => str,
    sub: () => sub,
    subtract: () => subtract,
    translate: () => translate
  });
  function create() {
    var out = new ARRAY_TYPE(6);
    if (ARRAY_TYPE != Float32Array) {
      out[1] = 0;
      out[2] = 0;
      out[4] = 0;
      out[5] = 0;
    }
    out[0] = 1;
    out[3] = 1;
    return out;
  }
  function clone(a) {
    var out = new ARRAY_TYPE(6);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    return out;
  }
  function copy(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    return out;
  }
  function identity(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    out[4] = 0;
    out[5] = 0;
    return out;
  }
  function fromValues(a, b, c, d, tx, ty) {
    var out = new ARRAY_TYPE(6);
    out[0] = a;
    out[1] = b;
    out[2] = c;
    out[3] = d;
    out[4] = tx;
    out[5] = ty;
    return out;
  }
  function set(out, a, b, c, d, tx, ty) {
    out[0] = a;
    out[1] = b;
    out[2] = c;
    out[3] = d;
    out[4] = tx;
    out[5] = ty;
    return out;
  }
  function invert(out, a) {
    var aa = a[0], ab = a[1], ac = a[2], ad = a[3];
    var atx = a[4], aty = a[5];
    var det = aa * ad - ab * ac;
    if (!det) {
      return null;
    }
    det = 1 / det;
    out[0] = ad * det;
    out[1] = -ab * det;
    out[2] = -ac * det;
    out[3] = aa * det;
    out[4] = (ac * aty - ad * atx) * det;
    out[5] = (ab * atx - aa * aty) * det;
    return out;
  }
  function determinant(a) {
    return a[0] * a[3] - a[1] * a[2];
  }
  function multiply(out, a, b) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5];
    var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5];
    out[0] = a0 * b0 + a2 * b1;
    out[1] = a1 * b0 + a3 * b1;
    out[2] = a0 * b2 + a2 * b3;
    out[3] = a1 * b2 + a3 * b3;
    out[4] = a0 * b4 + a2 * b5 + a4;
    out[5] = a1 * b4 + a3 * b5 + a5;
    return out;
  }
  function rotate(out, a, rad) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5];
    var s = Math.sin(rad);
    var c = Math.cos(rad);
    out[0] = a0 * c + a2 * s;
    out[1] = a1 * c + a3 * s;
    out[2] = a0 * -s + a2 * c;
    out[3] = a1 * -s + a3 * c;
    out[4] = a4;
    out[5] = a5;
    return out;
  }
  function scale(out, a, v) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5];
    var v0 = v[0], v1 = v[1];
    out[0] = a0 * v0;
    out[1] = a1 * v0;
    out[2] = a2 * v1;
    out[3] = a3 * v1;
    out[4] = a4;
    out[5] = a5;
    return out;
  }
  function translate(out, a, v) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5];
    var v0 = v[0], v1 = v[1];
    out[0] = a0;
    out[1] = a1;
    out[2] = a2;
    out[3] = a3;
    out[4] = a0 * v0 + a2 * v1 + a4;
    out[5] = a1 * v0 + a3 * v1 + a5;
    return out;
  }
  function fromRotation(out, rad) {
    var s = Math.sin(rad), c = Math.cos(rad);
    out[0] = c;
    out[1] = s;
    out[2] = -s;
    out[3] = c;
    out[4] = 0;
    out[5] = 0;
    return out;
  }
  function fromScaling(out, v) {
    out[0] = v[0];
    out[1] = 0;
    out[2] = 0;
    out[3] = v[1];
    out[4] = 0;
    out[5] = 0;
    return out;
  }
  function fromTranslation(out, v) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    out[4] = v[0];
    out[5] = v[1];
    return out;
  }
  function str(a) {
    return "mat2d(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ")";
  }
  function frob(a) {
    return Math.hypot(a[0], a[1], a[2], a[3], a[4], a[5], 1);
  }
  function add(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];
    out[4] = a[4] + b[4];
    out[5] = a[5] + b[5];
    return out;
  }
  function subtract(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    out[3] = a[3] - b[3];
    out[4] = a[4] - b[4];
    out[5] = a[5] - b[5];
    return out;
  }
  function multiplyScalar(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    out[3] = a[3] * b;
    out[4] = a[4] * b;
    out[5] = a[5] * b;
    return out;
  }
  function multiplyScalarAndAdd(out, a, b, scale3) {
    out[0] = a[0] + b[0] * scale3;
    out[1] = a[1] + b[1] * scale3;
    out[2] = a[2] + b[2] * scale3;
    out[3] = a[3] + b[3] * scale3;
    out[4] = a[4] + b[4] * scale3;
    out[5] = a[5] + b[5] * scale3;
    return out;
  }
  function exactEquals(a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5];
  }
  function equals(a, b) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5];
    var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5];
    return Math.abs(a0 - b0) <= EPSILON * Math.max(1, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= EPSILON * Math.max(1, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= EPSILON * Math.max(1, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= EPSILON * Math.max(1, Math.abs(a5), Math.abs(b5));
  }
  var mul = multiply;
  var sub = subtract;

  // node_modules/gl-matrix/esm/vec2.js
  var vec2_exports = {};
  __export(vec2_exports, {
    add: () => add2,
    angle: () => angle,
    ceil: () => ceil,
    clone: () => clone2,
    copy: () => copy2,
    create: () => create2,
    cross: () => cross,
    dist: () => dist,
    distance: () => distance,
    div: () => div,
    divide: () => divide,
    dot: () => dot,
    equals: () => equals2,
    exactEquals: () => exactEquals2,
    floor: () => floor,
    forEach: () => forEach,
    fromValues: () => fromValues2,
    inverse: () => inverse,
    len: () => len,
    length: () => length,
    lerp: () => lerp,
    max: () => max,
    min: () => min,
    mul: () => mul2,
    multiply: () => multiply2,
    negate: () => negate,
    normalize: () => normalize,
    random: () => random,
    rotate: () => rotate2,
    round: () => round,
    scale: () => scale2,
    scaleAndAdd: () => scaleAndAdd,
    set: () => set2,
    sqrDist: () => sqrDist,
    sqrLen: () => sqrLen,
    squaredDistance: () => squaredDistance,
    squaredLength: () => squaredLength,
    str: () => str2,
    sub: () => sub2,
    subtract: () => subtract2,
    transformMat2: () => transformMat2,
    transformMat2d: () => transformMat2d,
    transformMat3: () => transformMat3,
    transformMat4: () => transformMat4,
    zero: () => zero
  });
  function create2() {
    var out = new ARRAY_TYPE(2);
    if (ARRAY_TYPE != Float32Array) {
      out[0] = 0;
      out[1] = 0;
    }
    return out;
  }
  function clone2(a) {
    var out = new ARRAY_TYPE(2);
    out[0] = a[0];
    out[1] = a[1];
    return out;
  }
  function fromValues2(x, y) {
    var out = new ARRAY_TYPE(2);
    out[0] = x;
    out[1] = y;
    return out;
  }
  function copy2(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    return out;
  }
  function set2(out, x, y) {
    out[0] = x;
    out[1] = y;
    return out;
  }
  function add2(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    return out;
  }
  function subtract2(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    return out;
  }
  function multiply2(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    return out;
  }
  function divide(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    return out;
  }
  function ceil(out, a) {
    out[0] = Math.ceil(a[0]);
    out[1] = Math.ceil(a[1]);
    return out;
  }
  function floor(out, a) {
    out[0] = Math.floor(a[0]);
    out[1] = Math.floor(a[1]);
    return out;
  }
  function min(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    return out;
  }
  function max(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    return out;
  }
  function round(out, a) {
    out[0] = Math.round(a[0]);
    out[1] = Math.round(a[1]);
    return out;
  }
  function scale2(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    return out;
  }
  function scaleAndAdd(out, a, b, scale3) {
    out[0] = a[0] + b[0] * scale3;
    out[1] = a[1] + b[1] * scale3;
    return out;
  }
  function distance(a, b) {
    var x = b[0] - a[0], y = b[1] - a[1];
    return Math.hypot(x, y);
  }
  function squaredDistance(a, b) {
    var x = b[0] - a[0], y = b[1] - a[1];
    return x * x + y * y;
  }
  function length(a) {
    var x = a[0], y = a[1];
    return Math.hypot(x, y);
  }
  function squaredLength(a) {
    var x = a[0], y = a[1];
    return x * x + y * y;
  }
  function negate(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    return out;
  }
  function inverse(out, a) {
    out[0] = 1 / a[0];
    out[1] = 1 / a[1];
    return out;
  }
  function normalize(out, a) {
    var x = a[0], y = a[1];
    var len2 = x * x + y * y;
    if (len2 > 0) {
      len2 = 1 / Math.sqrt(len2);
    }
    out[0] = a[0] * len2;
    out[1] = a[1] * len2;
    return out;
  }
  function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1];
  }
  function cross(out, a, b) {
    var z = a[0] * b[1] - a[1] * b[0];
    out[0] = out[1] = 0;
    out[2] = z;
    return out;
  }
  function lerp(out, a, b, t) {
    var ax = a[0], ay = a[1];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    return out;
  }
  function random(out, scale3) {
    scale3 = scale3 || 1;
    var r = RANDOM() * 2 * Math.PI;
    out[0] = Math.cos(r) * scale3;
    out[1] = Math.sin(r) * scale3;
    return out;
  }
  function transformMat2(out, a, m) {
    var x = a[0], y = a[1];
    out[0] = m[0] * x + m[2] * y;
    out[1] = m[1] * x + m[3] * y;
    return out;
  }
  function transformMat2d(out, a, m) {
    var x = a[0], y = a[1];
    out[0] = m[0] * x + m[2] * y + m[4];
    out[1] = m[1] * x + m[3] * y + m[5];
    return out;
  }
  function transformMat3(out, a, m) {
    var x = a[0], y = a[1];
    out[0] = m[0] * x + m[3] * y + m[6];
    out[1] = m[1] * x + m[4] * y + m[7];
    return out;
  }
  function transformMat4(out, a, m) {
    var x = a[0];
    var y = a[1];
    out[0] = m[0] * x + m[4] * y + m[12];
    out[1] = m[1] * x + m[5] * y + m[13];
    return out;
  }
  function rotate2(out, a, b, rad) {
    var p0 = a[0] - b[0], p1 = a[1] - b[1], sinC = Math.sin(rad), cosC = Math.cos(rad);
    out[0] = p0 * cosC - p1 * sinC + b[0];
    out[1] = p0 * sinC + p1 * cosC + b[1];
    return out;
  }
  function angle(a, b) {
    var x1 = a[0], y1 = a[1], x2 = b[0], y2 = b[1], mag = Math.sqrt(x1 * x1 + y1 * y1) * Math.sqrt(x2 * x2 + y2 * y2), cosine = mag && (x1 * x2 + y1 * y2) / mag;
    return Math.acos(Math.min(Math.max(cosine, -1), 1));
  }
  function zero(out) {
    out[0] = 0;
    out[1] = 0;
    return out;
  }
  function str2(a) {
    return "vec2(" + a[0] + ", " + a[1] + ")";
  }
  function exactEquals2(a, b) {
    return a[0] === b[0] && a[1] === b[1];
  }
  function equals2(a, b) {
    var a0 = a[0], a1 = a[1];
    var b0 = b[0], b1 = b[1];
    return Math.abs(a0 - b0) <= EPSILON * Math.max(1, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1, Math.abs(a1), Math.abs(b1));
  }
  var len = length;
  var sub2 = subtract2;
  var mul2 = multiply2;
  var div = divide;
  var dist = distance;
  var sqrDist = squaredDistance;
  var sqrLen = squaredLength;
  var forEach = function() {
    var vec = create2();
    return function(a, stride, offset, count, fn, arg) {
      var i, l;
      if (!stride) {
        stride = 2;
      }
      if (!offset) {
        offset = 0;
      }
      if (count) {
        l = Math.min(count * stride + offset, a.length);
      } else {
        l = a.length;
      }
      for (i = offset; i < l; i += stride) {
        vec[0] = a[i];
        vec[1] = a[i + 1];
        fn(vec, vec, arg);
        a[i] = vec[0];
        a[i + 1] = vec[1];
      }
      return a;
    };
  }();

  // node_modules/movable-render-space/lib/index.js
  function signedAngle(a, b) {
    let ax = a[0], ay = a[1], bx = b[0], by = b[1];
    return Math.atan2(ax * by - ay * bx, ax * bx + ay * by);
  }
  var Transform = class _Transform {
    constructor(translation, zoom, rotation) {
      this.translation = vec2_exports.create();
      this.zoom = 1;
      this.rotation = 0;
      this.translation = translation || this.translation;
      this.zoom = zoom || this.zoom;
      this.rotation = rotation || this.rotation;
    }
    translationMatrix() {
      return mat2d_exports.fromTranslation(mat2d_exports.create(), this.translation);
    }
    scalingMatrix() {
      return mat2d_exports.fromScaling(mat2d_exports.create(), [this.zoom, this.zoom]);
    }
    rotationMatrix() {
      return mat2d_exports.fromRotation(mat2d_exports.create(), this.rotation);
    }
    matrix() {
      let m = mat2d_exports.create();
      mat2d_exports.mul(m, this.translationMatrix(), this.scalingMatrix());
      mat2d_exports.mul(m, m, this.rotationMatrix());
      return m;
    }
    translate(translation) {
      vec2_exports.add(this.translation, this.translation, translation);
    }
    zoomInto(center, zoom) {
      this.zoom *= zoom;
      vec2_exports.sub(this.translation, this.translation, center);
      vec2_exports.scaleAndAdd(this.translation, center, this.translation, zoom);
    }
    rotateAround(center, angle2) {
      this.rotation += angle2;
      vec2_exports.rotate(this.translation, this.translation, center, angle2);
    }
    lerp(transform, t) {
      vec2_exports.lerp(this.translation, this.translation, transform.translation, t);
      this.zoom = (1 - t) * this.zoom + t * transform.zoom;
      this.rotation = (1 - t) * this.rotation + t * transform.rotation;
    }
    copy(transform) {
      vec2_exports.copy(this.translation, transform.translation);
      this.zoom = transform.zoom;
      this.rotation = transform.rotation;
    }
    /** mutates the argument!!! */
    apply(point) {
      return vec2_exports.transformMat2d(point, point, this.matrix());
    }
    inverse() {
      let p = vec2_exports.negate(vec2_exports.create(), this.translation);
      vec2_exports.scale(p, p, 1 / this.zoom);
      vec2_exports.rotate(p, p, vec2_exports.create(), -this.rotation);
      return new _Transform(p, 1 / this.zoom, -this.rotation);
    }
  };
  var RenderSpace = class {
    constructor(arg) {
      this._listeners = [];
      this.config = {
        /** value in the rage (1, ∞) determining the zoom speed of the scrollwheel */
        scroll_sensitivity: 1.01,
        /** value in the range (0, ∞) determining the sensitivity of the rotation */
        rotation_sensitivity: 0.01,
        /** value in the range [0, ∞) determining the strength of damping */
        damping_strength: 0,
        panning: true,
        zooming: true,
        rotating: true
      };
      let ctx2 = arg instanceof HTMLCanvasElement ? arg.getContext("2d") : arg;
      if (ctx2 === null)
        throw new Error("Failed to get CanvasRenderingContext2D");
      this.ctx = ctx2;
      this.transform = new Transform();
      this.target_transform = new Transform();
      this.canvas.style.touchAction = "none";
      event_listeners(this, this.canvas);
    }
    updateDamping(dt, update_transform = true) {
      this.transform.lerp(this.target_transform, 1 - Math.exp(-dt / this.config.damping_strength));
      if (update_transform)
        this.updateTransform();
    }
    updateTransform() {
      if (this.config.damping_strength === 0) {
        this.transform.copy(this.target_transform);
      }
      this.ctx.resetTransform();
      this.ctx.translate(...this.transform.translation);
      this.ctx.rotate(this.transform.rotation);
      this.ctx.scale(this.transform.zoom, this.transform.zoom);
      this._listeners.forEach((listener) => listener(this));
    }
    /** mutates the argument!!! */
    renderSpaceToScreen(point) {
      return this.transform.apply(point);
    }
    /** mutates the argument!!! */
    screenToRenderSpace(point) {
      return this.transform.inverse().apply(point);
    }
    /**
      * returns the smallest render-space AABB that covers the entire screen
      * @returns {[vec2, vec2]} top left and bottom right corner
      **/
    getScreenAABB() {
      let screen_corners = [
        vec2_exports.fromValues(0, 0),
        vec2_exports.fromValues(0, this.canvas.height),
        vec2_exports.fromValues(this.canvas.width, 0),
        vec2_exports.fromValues(this.canvas.width, this.canvas.height)
      ].map(this.screenToRenderSpace.bind(this));
      let x = screen_corners.map((v) => v[0]);
      let y = screen_corners.map((v) => v[1]);
      return [
        vec2_exports.fromValues(Math.min(...x), Math.min(...y)),
        vec2_exports.fromValues(Math.max(...x), Math.max(...y))
      ];
    }
    translate(translation) {
      this.target_transform.translate(translation);
    }
    zoomInto(center, zoom) {
      this.target_transform.zoomInto(center, zoom);
    }
    rotateAround(center, angle2) {
      this.target_transform.rotateAround(center, angle2);
    }
    lerp(transform, t) {
      this.target_transform.lerp(transform, t);
    }
    addListener(listener) {
      this._listeners.push(listener);
    }
    removeListener(listener) {
      this._listeners.splice(this._listeners.indexOf(listener), 1);
    }
    clearScreen() {
      this.ctx.save();
      this.ctx.resetTransform();
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.restore();
    }
    get canvas() {
      return this.ctx.canvas;
    }
    get listeners() {
      return this._listeners.slice();
    }
  };
  function event_listeners(space2, canvas2) {
    let pointers = {};
    canvas2.addEventListener("contextmenu", (event) => event.preventDefault());
    canvas2.addEventListener("pointerdown", (event) => {
      pointers[event.pointerId] = {
        pos: vec2_exports.fromValues(event.offsetX, event.offsetY),
        button: event.button
      };
    });
    canvas2.addEventListener("pointerup", (event) => {
      delete pointers[event.pointerId];
    });
    canvas2.addEventListener("pointermove", (event) => {
      const pointer = pointers[event.pointerId];
      if (!pointer)
        return;
      let last = vec2_exports.clone(pointer.pos);
      vec2_exports.set(pointer.pos, event.offsetX, event.offsetY);
      switch (Object.keys(pointers).length) {
        case 1:
          if (pointer.button === 2 && space2.config.rotating) {
            space2.rotateAround([canvas2.width / 2, canvas2.height / 2], space2.config.rotation_sensitivity * (pointer.pos[0] - last[0]));
          }
          if (pointer.button == 0 && space2.config.panning) {
            space2.translate(vec2_exports.sub(vec2_exports.create(), pointer.pos, last));
          }
          space2.updateTransform();
          break;
        case 2:
          const anchor = Object.values(pointers).find((p) => p !== pointer);
          if (anchor === void 0)
            throw new Error("something is really wrong bro, good luck debugging ts");
          let center = vec2_exports.add(vec2_exports.create(), pointer.pos, anchor.pos);
          vec2_exports.scale(center, center, 0.5);
          let diff = vec2_exports.sub(vec2_exports.create(), pointer.pos, anchor.pos);
          let last_diff = vec2_exports.sub(vec2_exports.create(), last, anchor.pos);
          if (space2.config.panning) {
            let movement = vec2_exports.sub(vec2_exports.create(), pointer.pos, last);
            space2.translate(vec2_exports.scale(movement, movement, 0.5));
          }
          if (space2.config.zooming) {
            space2.zoomInto(center, vec2_exports.len(diff) / vec2_exports.len(last_diff));
          }
          if (space2.config.rotating) {
            space2.rotateAround(center, signedAngle(last_diff, diff));
          }
          space2.updateTransform();
          break;
      }
    });
    canvas2.addEventListener("wheel", (event) => {
      if (!space2.config.zooming)
        return;
      let zoom = Math.pow(space2.config.scroll_sensitivity, -event.deltaY);
      space2.zoomInto([event.offsetX, event.offsetY], zoom);
      space2.updateTransform();
      event.preventDefault();
    }, { passive: false });
  }

  // src/game_of_life/simulators/sparse_encoding.ts
  var grid = /* @__PURE__ */ new Map();
  function getCellState(x, y) {
    return grid.get(x)?.has?.(y) ?? false;
  }
  function setCellState(x, y, alive) {
    let col = grid.get(x);
    if (col === void 0) {
      col = /* @__PURE__ */ new Set();
      grid.set(x, col);
    }
    if (alive) col.add(y);
    else col.delete(y);
  }
  function clearGrid() {
    grid.clear();
  }
  function forEachAliveCell(f) {
    for (let [x, set3] of grid) {
      for (let y of set3) {
        f(x, y);
      }
    }
  }
  function step(generations) {
    for (let i = 0; i < generations; i++) {
      single_step();
    }
  }
  function single_step() {
    let next_grid = /* @__PURE__ */ new Map();
    for (let [x, set3] of grid) {
      for (let y of set3) {
        for (let i = -1; i <= 1; i++) {
          let col = next_grid.get(x + i);
          if (col === void 0) {
            col = /* @__PURE__ */ new Set();
            next_grid.set(x + i, col);
          }
          col.add(y - 1);
          col.add(y);
          col.add(y + 1);
        }
      }
    }
    for (let [x, set3] of next_grid) {
      for (let y of set3) {
        let neighbors = 0;
        for (let i = -1; i <= 1; i++) {
          let col = grid.get(x + i);
          if (col === void 0) continue;
          neighbors += col.has(y - 1) ? 1 : 0;
          neighbors += col.has(y) ? 1 : 0;
          neighbors += col.has(y + 1) ? 1 : 0;
        }
        if (neighbors < 3 || neighbors > 4) next_grid.get(x).delete(y);
        if (neighbors === 4 && !grid.get(x)?.has?.(y)) next_grid.get(x).delete(y);
      }
    }
    grid = next_grid;
  }

  // src/game_of_life/pattern_loader.ts
  function load(data, format) {
    switch (format) {
      case "rle":
        load_rle(data);
        return true;
      case "mc":
        load_mc(data);
        return true;
      default:
        return false;
    }
  }
  function load_rle(rle) {
    const lines = rle.split("\n");
    while (lines[0][0] === "#") lines.shift();
    const [_, a, b] = lines.shift().match(/x ?= ?(\d+) ?, ?y ?= ?(\d+)/);
    const [width, height] = [Number(a), Number(b)];
    const pattern = [];
    for (let i = 0; i < height; i++) {
      pattern.push([]);
    }
    let counter = "";
    let row = 0;
    let data = lines.join();
    for (let i = 0; i < data.length; i++) {
      if (data[i] === "!") break;
      if (!isNaN(parseInt(data[i]))) {
        counter += data[i];
        continue;
      }
      for (let j = 0; j < parseInt(counter || "1"); j++) {
        switch (data[i]) {
          case "$":
            row++;
            break;
          case "b":
            pattern[row].push(false);
            break;
          case "o":
          case "x":
          case "y":
          case "z":
            pattern[row].push(true);
            break;
        }
      }
      counter = "";
    }
    const center = view_center();
    const offset_x = Math.round(center[0] - width / 2);
    const offset_y = Math.round(center[1] - height / 2);
    for (let y = 0; y < pattern.length; y++) {
      for (let x = 0; x < pattern[y].length; x++) {
        setCellState(x + offset_x, y + offset_y, pattern[y][x]);
      }
    }
  }
  function load_mc(data) {
    let lines = data.trim().split("\n");
    do {
      lines.shift();
    } while (lines[0][0] === "#");
    function load_node(x, y, node_num) {
      if (node_num === 0) return;
      let node = lines[node_num - 1];
      if (".*$".includes(node[0])) {
        let curr_x = x;
        let curr_y = y;
        for (let char of node) {
          switch (char) {
            case "*":
            case ".":
              setCellState(curr_x, curr_y, char === "*");
              curr_x++;
              break;
            case "$":
              curr_x = x;
              curr_y++;
              break;
          }
        }
      } else {
        let [s, a, b, c, d] = node.split(" ").map((str3) => Number(str3));
        let off = 2 ** (s - 1);
        load_node(x, y, a);
        load_node(x + off, y, b);
        load_node(x, y + off, c);
        load_node(x + off, y + off, d);
      }
    }
    const size = 2 ** Number(lines[lines.length - 1].split(" ")[0]);
    const center = view_center();
    load_node(center[0] - size / 2, center[1] - size / 2, lines.length);
  }

  // src/game_of_life/index.ts
  var canvas = document.getElementById("canvas");
  var space = new RenderSpace(canvas);
  var ctx = space.ctx;
  space.config.rotating = false;
  space.zoomInto([0, 0], 100);
  space.translate([window.innerWidth / 2, window.innerHeight / 2]);
  function view_center() {
    let center = space.screenToRenderSpace([window.innerWidth / 2, window.innerHeight / 2]);
    return [Math.round(center[0]), Math.round(center[1])];
  }
  function render() {
    const aabb = space.getScreenAABB();
    space.clearScreen();
    ctx.fillStyle = "#404040";
    forEachAliveCell((x, y) => {
      ctx.fillRect(x - 0.5, y - 0.5, 1, 1);
    });
    const w = 0.05;
    ctx.strokeStyle = "black";
    ctx.lineCap = "square";
    ctx.lineWidth = w;
    for (let x = Math.round(aabb[0][0] - w / 2) + 0.5; x <= aabb[1][0] + w / 2; x++) {
      ctx.beginPath();
      ctx.moveTo(x, aabb[0][1]);
      ctx.lineTo(x, aabb[1][1]);
      ctx.stroke();
    }
    for (let y = Math.round(aabb[0][1] - w / 2) + 0.5; y <= aabb[1][1] + w / 2; y++) {
      ctx.beginPath();
      ctx.moveTo(aabb[0][0], y);
      ctx.lineTo(aabb[1][0], y);
      ctx.stroke();
    }
  }
  var running = false;
  var speed = 1;
  var last_step = performance.now();
  var last_frame = performance.now();
  function frame() {
    if (running) {
      let now = performance.now();
      if (speed > 1e3 / (now - last_frame)) {
        for (let i = 0; performance.now() - now < 17 && i < speed * (now - last_frame) / 1e3; i++) step(1);
        last_step = now;
      } else if (speed > 1e3 / (now - last_step)) {
        step(1);
        last_step = now;
      }
    }
    render();
    last_frame = performance.now();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    space.updateTransform();
    render();
  }
  window.addEventListener("resize", resize);
  resize();
  document.getElementById("start").addEventListener("click", () => running = !running);
  document.getElementById("step").addEventListener("click", () => step(1));
  document.getElementById("clear").addEventListener("click", () => clearGrid());
  document.getElementById("speed").addEventListener("input", () => speed = 2 ** Number(document.getElementById("speed").value));
  canvas.addEventListener("click", (event) => {
    let [i, j] = space.screenToRenderSpace([event.x, event.y]);
    [i, j] = [Math.round(i), Math.round(j)];
    setCellState(i, j, !getCellState(i, j));
    render();
  });
  document.getElementById("file").addEventListener("change", async () => {
    const input = document.getElementById("file");
    const file = input.files[0];
    if (file === void 0) return;
    const data = await file.text();
    const success = load(data, file.name.split(".").at(-1));
    if (!success) alert("unsupported file format");
    input.value = "";
  });
})();
//# sourceMappingURL=index.js.map
