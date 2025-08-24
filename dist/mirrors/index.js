(() => {
  // src/mirrors/index.ts
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  var ma = Math.PI / 3;
  var oa = Math.PI / 6;
  var od = 200;
  var c = (x) => od * Math.cos(x);
  var s = (x) => od * Math.sin(x);
  var p = (x, y) => {
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();
  };
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.fillStyle = ctx.strokeStyle = "white";
  ctx.scale(1, -1);
  ctx.translate(window.innerWidth / 2, -window.innerHeight / 2);
  var render = () => {
    ctx.clearRect(-window.innerWidth / 2, -window.innerHeight / 2, window.innerWidth, window.innerHeight);
    ctx.beginPath();
    ctx.arc(0, 0, od, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(od, 0);
    ctx.lineTo(0, 0);
    ctx.lineTo(c(ma), s(ma));
    ctx.stroke();
    let processed_points = [];
    let points = [oa];
    for (let i = 0; i < 100 && points.length > 0; i++) {
      let new_points = [];
      for (let point of points) {
        if (point < Math.PI) {
          new_points.push(2 * Math.PI - point);
        }
        if (point < ma || point > Math.PI + ma) {
          new_points.push((2 * ma - point + 6 * Math.PI) % (2 * Math.PI));
        }
      }
      processed_points = processed_points.concat(points);
      points = new_points;
    }
    processed_points.forEach((pt) => p(c(pt), s(pt)));
  };
  render();
  var X = 0;
  window.onpointerdown = (e) => X = Math.floor((3 - 1e-10) * e.x / window.innerWidth);
  window.onpointermove = (e) => {
    if (X === 0) {
      ma += e.movementY / 500 + 2 * Math.PI;
      ma %= Math.PI;
    }
    if (X === 2) {
      oa += e.movementY / 1e3 + 2 * Math.PI;
      oa %= Math.PI;
    }
    if (X === 1) {
      let k = oa / ma;
      ma += e.movementY / 500 + 2 * Math.PI;
      ma %= Math.PI;
      oa = k * ma;
    }
    render();
  };
})();
//# sourceMappingURL=index.js.map
