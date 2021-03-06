/*
 * A paper.js script to display Penrose Tiles using two
 * Rhombuses.
 *
 * Key objects are:
 *  - RSide = a side of a Robinson Triangle
 *  - RTriangle = A Robinson triangle (3 RSides)
 *    - deflate : "deflates" into multiple smaller triangles
 * 
 * The deflation algorithm is explained in detail here:
 *  - https://tartarus.org/~simon/20110412-penrose/penrose.xhtml
 * 
 */

const TWO_PI = 2 * Math.PI;
const PI = Math.PI;

// Returns a Point describing a unit vector with the given angle
const unitPoint = (angle) => new Point(Math.cos(angle), Math.sin(angle));

// arePenroseLines : Flag to display lines between all tiles
var arePenroseLines = false;
var penroseLineColor = new Color(0, 0, 0, 0);

// isPenroseFill : Flag to display 
var isPenroseFill = true;
// Color for the Large Rhombus (triangle pattern = 4)
globals.penroseLargeRhombusColor = "#1EE69C";
// Color for the Small Rhombus (triangle pattern = 3)
globals.penroseSmallRhombusColor = "#9C3E16";

// RSide: A side of a Robinson Triangle
const RSide = function (from, to, pattern) {
  this.from = from;
  this.to = to;
  this.pattern = pattern;

  this.vector = this.to - this.from;
  this.length = this.vector.length;
  this.angle = this.vector.angle * (TWO_PI / 360);
};

// RTriangle: A Robinson Triangle consisting of 3 RSides
const RTriangle = function (side1, side2, side3) {
  // Sort sides by increasing pattern
  this.sides = [side1, side2, side3].sort((a, b) => a.pattern - b.pattern);
  this.pattern = this.sides[2].pattern;

  this.draw = function () {
    const path = new Path();
    if (isPenroseFill) {
      path.strokeWidth = 0.4;
      path.strokeCap = "round";
      path.strokeColor =
        this.pattern === 4
          ? globals.penroseLargeRhombusColor
          : globals.penroseSmallRhombusColor;
    }
    path.add(this.sides[2].from, this.sides[2].to);
    path.insert(1, this.sides[1].from);
    path.closed = true;
    if (isPenroseFill) {
      path.fillColor =
        this.pattern === 4
          ? globals.penroseLargeRhombusColor
          : globals.penroseSmallRhombusColor;
    }
  };

  this.deflate = function () {
    // returns new Robinson Triangles
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
  // Pattern 4 = a mix of large and small, and is yet
  //  to be implemented
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

// Move draggable layer on mouse drag
function onMouseDrag(event) {
  if (globals.dragType === "dragTiling") {
    draggableLayer.position += event.delta;
  } else {
    staticLayer.position += event.delta;
    draggableLayer.position += event.delta;
  }
}

function deflatePenroseTilings() {
  var staticLayerPosition = staticLayer.position;

  firstPenrose.deflate();

  var draggableLayerPosition = draggableLayer.position;
  project.layers.forEach((layer) => layer.removeChildren());

  staticLayer.activate();
  firstPenrose.draw();

  var staticImage = staticLayer.rasterize();

  project.layers.forEach((layer) => layer.removeChildren());

  staticLayer.addChild(staticImage);
  draggableImage = staticImage.copyTo(draggableLayer);

  staticLayer.position = staticLayerPosition;
  draggableLayer.position = draggableLayerPosition;
}

function resetPenroseTilings() {
  var staticLayerPosition = staticLayer.position;

  firstPenrose = new PenroseTiling(view.center, length, 3);

  var draggableLayerPosition = draggableLayer.position;
  project.layers.forEach((layer) => layer.removeChildren());

  staticLayer.activate();
  firstPenrose.draw();

  var staticImage = staticLayer.rasterize();

  project.layers.forEach((layer) => layer.removeChildren());

  staticLayer.addChild(staticImage);
  draggableImage = staticImage.copyTo(draggableLayer);

  staticLayer.position = staticLayerPosition;
  draggableLayer.position = draggableLayerPosition;
}

function onResize(event) {
  staticLayer.position += event.delta / 2;
  draggableLayer.position += event.delta / 2;
}

function setZoom() {
  view.zoom = globals.zoomFactor ? globals.zoomFactor : 1;
}

globals.setZoom = setZoom;

var background = new Path.Rectangle(view.bounds);
background.fillColor = "white";

minViewDimension = Math.max(view.viewSize.width, view.viewSize.height);

width = minViewDimension / 2.5;
length = width * (2 / 3);
basePoint = new Point(width / 6, width * (2 / 3));
tilingOffset = [Math.cos((2 * PI) / 5) * length, 0];

var staticLayer = new Layer();
firstPenrose = new PenroseTiling(view.center, length, 3);
firstPenrose.draw();
staticLayer.position -= tilingOffset;

var draggableLayer = new Layer();

secondPenrose = new PenroseTiling(view.center, length, 3);
secondPenrose.draw();
draggableLayer.position += tilingOffset;

deflatePenroseTilings();
globals.deflate = deflatePenroseTilings;
globals.resetDeflation = resetPenroseTilings;

staticLayer.blendMode = "color";
draggableLayer.blendMode = "color";
