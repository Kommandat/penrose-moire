const chevrons = false;
const penrose = true;

const TWO_PI = 2 * Math.PI;
const PI = Math.PI;

const unitPoint = (angle) => new Point(Math.cos(angle), Math.sin(angle));

const Chevron = function (point, angle, length) {
  this.point = point;
  this.angle = angle;
  this.length = length;

  this.draw = function () {
    const start = this.point + unitPoint(this.angle - TWO_PI / 3) * this.length;
    const end = this.point + unitPoint(this.angle + TWO_PI / 3) * this.length;

    const path = new Path();
    path.strokeColor = "black";
    path.moveTo(start);
    path.lineTo(this.point);
    path.lineTo(end);
  };
};

const RSide = function (from, to, pattern) {
  this.from = from;
  this.to = to;
  this.pattern = pattern;

  this.vector = this.to - this.from;
  this.length = this.vector.length;
  this.angle = this.vector.angle * (TWO_PI / 360);

  this.chevrons = [];

  let chevPoint;
  let step = this.length / 12;
  let chevLength = this.length / 2 - step * ((this.pattern - 1) / 2);
  let chevWidth = 8;

  for (let i = 0; i < this.pattern; i++) {
    chevPoint = new Point(this.from + unitPoint(this.angle) * chevLength);
    this.chevrons.push(new Chevron(chevPoint, this.angle, chevWidth));
    chevLength += step;
  }

  this.draw = function () {
    const path = new Path();
    path.strokeColor = new Color(0, 0, 0, 0.5);
    path.strokeWidth = 0.2;
    path.moveTo(from);
    path.lineTo(to);

    if (chevrons) {
      this.chevrons.forEach((chev) => chev.draw());
    }
  };
};

const RTriangle = function (side1, side2, side3) {
  // Sort sides by increasing pattern
  this.sides = [side1, side2, side3].sort((a, b) => a.pattern - b.pattern);
  this.pattern = this.sides[2].pattern;

  this.draw = function () {
    this.sides.forEach((side) => {
      if (penrose) {
        if (!(side.pattern === 3 || side.pattern === 4)) {
          side.draw();
        }
      } else {
        side.draw();
      }
    });
  };

  this.deflate = function () {
    // returns new RobinsonTriangles
    const newTriangles = [];

    if (this.pattern === 4) {
      // Create two new points (from & to)

      oneSide = this.sides[0];
      twoSide = this.sides[1];
      fourSide = this.sides[2];

      newOneLength = fourSide.length - oneSide.length;
      newFourLength = oneSide.length;

      newFrom = fourSide.from + unitPoint(fourSide.angle) * newFourLength;
      newTo = newFrom + unitPoint(twoSide.angle - PI) * newOneLength;

      // Create 3 triangles and add to newTriangles

      newTriangles.push(
        new RTriangle(
          new RSide(newTo, oneSide.from, 2),
          new RSide(newFrom, newTo, 1),
          new RSide(newFrom, oneSide.from, 4)
        )
      );

      newTriangles.push(
        new RTriangle(
          new RSide(newFrom, newTo, 1),
          new RSide(oneSide.to, newTo, 3),
          new RSide(newFrom, oneSide.to, 2)
        )
      );

      newTriangles.push(
        new RTriangle(
          new RSide(newFrom, oneSide.to, 2),
          new RSide(fourSide.to, twoSide.from, 4),
          new RSide(fourSide.to, newFrom, 1)
        )
      );
    } else if (this.pattern === 3) {
      oneSide = this.sides[0];
      twoSide = this.sides[1];
      threeSide = this.sides[2];

      newTwoLength = threeSide.length;

      newFrom = threeSide.from.clone();
      newTo = oneSide.from + unitPoint(oneSide.angle) * newTwoLength;

      newTriangles.push(
        new RTriangle(
          new RSide(newFrom, newTo, 1),
          new RSide(newFrom, threeSide.to, 2),
          new RSide(threeSide.to, newTo, 3)
        )
      );

      newTriangles.push(
        new RTriangle(
          new RSide(newFrom, newTo, 1),
          new RSide(newTo, oneSide.from, 2),
          new RSide(newFrom, oneSide.from, 4)
        )
      );
    } else {
      throw `Triangle has a pattern of ${this.pattern} instead of 3 or 4`;
    }

    return newTriangles;
  };
};

const PenroseTiling = function (basePoint, length, pattern) {
  this.basePoint = basePoint;
  this.length = length;
  this.pattern = pattern;

  this.triangles = [];

  // Pattern 3 = 10 small triangles
  // Other pattern is a mix
  if ((this.pattern = 3)) {
    let p1 = basePoint;
    let p2;
    let p3;

    for (let i = 0; i < 10; i++) {
      p2 = new Point(length, 0);
      p2.angle += (i % 2 === 0 ? 18 : -18) + 36 * i;
      p2 += p1;

      p3 = new Point(length, 0);
      p3.angle += (i % 2 === 0 ? -18 : 18) + 36 * i;
      p3 += p1;

      const s1 = new RSide(p1, p3, 1);
      const s2 = new RSide(p1, p2, 2);
      const s3 = new RSide(p2, p3, 3);

      this.triangles.push(new RTriangle(s1, s2, s3));
    }
  } else {
  }

  this.draw = function () {
    this.triangles.forEach((triangle) => triangle.draw());
  };

  this.deflate = function () {
    this.triangles = this.triangles.flatMap((triangle) => triangle.deflate());
  };

  this.translate = function (vector) {
    this.basePoint += vector;

    this.triangles.forEach((triangle) => {
      triangle.sides = triangle.sides.map(
        (side) => new RSide(side.from + vector, side.to + vector, side.pattern)
      );
    });
  };
};

width = 300;
length = width * (2 / 3);
basePoint = new Point(width / 6, width * (2 / 3));

firstPenrose = new PenroseTiling(view.center, length, 3);
firstPenrose.draw();

var staticLayer = project.layers[0];
var draggableLayer = new Layer();

secondPenrose = new PenroseTiling(view.center + [0, 100], length, 3);
secondPenrose.draw();

function onMouseDrag(event) {
  draggableLayer.position += event.delta;
  // draggable.translate(event.point - draggable.basePoint);
  // project.clear();
  // fixed.draw();
  // draggable.draw();
}

function onKeyUp(event) {
  if (event.key === "space") {
    firstPenrose.deflate();
    secondPenrose.deflate();

    var draggableLayerPosition = draggableLayer.position;
    project.layers.forEach((layer) => layer.removeChildren());

    staticLayer.activate();
    firstPenrose.draw();
    draggableLayer.activate();
    secondPenrose.draw();
    draggableLayer.position = draggableLayerPosition;

    staticLayer.activate();
    var staticImage = staticLayer.rasterize();
    draggableLayer.activate();
    var draggableImage = draggableLayer.rasterize();

    project.layers.forEach((layer) => layer.removeChildren());

    staticLayer.addChild(staticImage);
    draggableLayer.addChild(draggableImage);
  }
}
