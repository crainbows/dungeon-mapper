import jquery from 'jquery';
const $ = jquery;
import Brush from './brush';
let cursorContext;
let cursorCanvas;
let fowContext;
let fowCanvas;
let mapImageContext;
let mapImageCanvas;
let fowBrush;
let mapImage;
let width = 1400;
let height = 8000;
let isDrawing = false;
let originalCords;
let lineWidth = 15;
let brushShape = 'round';

export function create(parentElem, opts) {
  let callback = opts.callback,
    error = opts.error;

  mapImage = new Image();
  mapImage.onerror = error;
  mapImage.onload = function () {
    let container,
      canvases,
      dimensions;

    console.log('mapImage loaded');

    // TODO: make this more readable
    dimensions = getOptimalDimensions(mapImage.width, mapImage.height, width, height);
    width = dimensions.width;
    height = dimensions.height;
    container = getContainer();
    canvases = createCanvases();
    parentElem.appendChild(container);
    mapImageCanvas = canvases.mapImageCanvas;
    fowCanvas = canvases.fowCanvas;
    cursorCanvas = canvases.cursorCanvas;
    container.appendChild(mapImageCanvas);
    container.appendChild(fowCanvas);
    container.appendChild(cursorCanvas);
    mapImageContext = mapImageCanvas.getContext('2d');
    fowContext = fowCanvas.getContext('2d');
    cursorContext = cursorCanvas.getContext('2d');
    copyCanvas(mapImageContext, createImageCanvas(mapImage));
    fowBrush = new Brush(fowContext, opts);
    fowContext.strokeStyle = fowBrush.getCurrent();
    fogMap();
    createRender();
    setUpDrawingEvents();
    setupCursorTracking();
    callback();
  };
  mapImage.crossOrigin = 'Anonymous'; // to prevent tainted canvas errors
  mapImage.src = '/dm/map';
}

// TODO: account for multiple containers
function getContainer() {
  let container = document.getElementById('canvasContainer') || document.createElement('div');

  container.id = 'canvasContainer'; //TODO: wont work for multiple containers
  container.style.position = 'relative';
  container.style.top = '0';
  container.style.left = '0';
  container.style.margin = 'auto';
  return container;
}

function createCanvases() {

  function createCanvas(type, zIndex) {
    let canvas = document.createElement('canvas');

    console.log('creating canvas ' + type);
    canvas.width = width;
    canvas.height = height;
    canvas.id = type + Math.floor(Math.random() * 100000);
    canvas.className = type + ' map-canvas';
    canvas.style.position = 'absolute';
    canvas.style.left = '0';
    canvas.style.top = '0';
    canvas.style.zIndex = zIndex;
    return canvas;
  }

  return {
    mapImageCanvas: createCanvas('map-image-canvas', 1),
    fowCanvas: createCanvas('fow-canvas', 2),
    cursorCanvas: createCanvas('cursor-canvas', 3)
  };
}

function getMouseCoordinates(e) {
  let viewportOffset = fowCanvas.getBoundingClientRect(),
    borderTop = parseInt($(fowCanvas).css('border-top-width')),
    borderLeft = parseInt($(fowCanvas).css('border-left-width'));

  return {
    x: (e.clientX - viewportOffset.left - borderLeft) / getMapDisplayRatio(),
    y: (e.clientY - viewportOffset.top - borderTop) / getMapDisplayRatio()
  };
}

function getOptimalDimensions(idealWidth, idealHeight, maxWidth, maxHeight) {
  let ratio = Math.min(maxWidth / idealWidth, (maxHeight - 150) / idealHeight);

  return {
    ratio: ratio,
    width: idealWidth * ratio,
    height: idealHeight * ratio
  };
}

function convertCanvasToImage(canvas) {
  let image = new Image();
  image.src = canvas.toDataURL('image/png');
  return image;
}

function copyCanvas(context, canvasToCopy) {
  context.drawImage(canvasToCopy, 0, 0, width, height);
}

function mergeCanvas(bottomCanvas, topCanvas) {
  let mergedCanvas = document.createElement('canvas');
  let mergedContext = mergedCanvas.getContext('2d');
  mergedCanvas.width = width;
  mergedCanvas.height = height;
  copyCanvas(mergedContext, bottomCanvas);
  copyCanvas(mergedContext, topCanvas);
  return mergedCanvas;
}

// Creates a canvas from an image
function createImageCanvas(img) {
  let imageCanvas = document.createElement('canvas');
  let imageContext = imageCanvas.getContext('2d');
  imageCanvas.width = width;
  imageCanvas.height = height;
  imageContext.drawImage(img, 0, 0, width, height);
  return imageCanvas;
}

function resetMap(context, brushType, brush) {
  context.save();
  context.fillStyle = brush.getPattern(brushType);
  context.fillRect(0, 0, width, height);
  context.restore();
}

function fogMap() {
  resetMap(fowContext, 'fog', fowBrush);
}

function clearMap() {
  resetMap(fowContext, 'clear', fowBrush);
}

export function resize(displayWidth, displayHeight) {
  fowCanvas.style.width = displayWidth + 'px';
  fowCanvas.style.height = displayHeight + 'px';
  mapImageCanvas.style.width = displayWidth + 'px';
  mapImageCanvas.style.height = displayHeight + 'px';
  cursorCanvas.style.width = displayWidth + 'px';
  cursorCanvas.style.height = displayHeight + 'px';

  if ($(window).width() > displayWidth) {
    let offset = ($(window).width() - displayWidth) / 2;
    fowCanvas.style.left = offset + 'px';
    mapImageCanvas.style.left = offset + 'px';
    cursorCanvas.style.left = offset + 'px';
  }
}

// Maybe having this here violates cohesion
export function fitMapToWindow() {
  let newDims = getOptimalDimensions(mapImageCanvas.width, mapImageCanvas.height, $(window).width(), $(window).height());
  resize(newDims.width, newDims.height);
}

export function toImage() {
  return convertCanvasToImage(mergeCanvas(mapImageCanvas, fowCanvas));
}

export function remove() {
  mapImageCanvas.remove();
  fowCanvas.remove();
  cursorCanvas.remove();
}

function getMapDisplayRatio() {
  return parseFloat(mapImageCanvas.style.width, 10) / mapImageCanvas.width;
}

function constructMask(cords) {
  let maskDimensions = {
    x: cords.x,
    y: cords.y,
    lineWidth: 2,
    line: 'aqua',
    fill: 'transparent'
  };

  if (brushShape == 'round') {
    maskDimensions.r = lineWidth / 2;
    maskDimensions.startingAngle = 0;
    maskDimensions.endingAngle = Math.PI * 2
  } else if (brushShape == 'square') {
    maskDimensions.centerX = maskDimensions.x - lineWidth / 2;
    maskDimensions.centerY = maskDimensions.y - lineWidth / 2;
    maskDimensions.height = lineWidth;
    maskDimensions.width = lineWidth;
  } else {
    throw new Error('brush shape not found')
  }

  return maskDimensions

}

function findOptimalRhombus(pointCurrent, pointPrevious) {
  let rhombusCoords = [{
    x: 0,
    y: 0
  }, {
    x: 0,
    y: 0
  }, {
    x: 0,
    y: 0
  }, {
    x: 0,
    y: 0
  }];
  if ((pointCurrent.x < pointPrevious.x && pointCurrent.y > pointPrevious.y) || (pointCurrent.x > pointPrevious.x && pointCurrent.y < pointPrevious.y)) {
    // Moving NE or SW /
    rhombusCoords[0].x = pointCurrent.x + lineWidth / 2;
    rhombusCoords[0].y = pointCurrent.y + lineWidth / 2;
    rhombusCoords[1].x = pointPrevious.x + lineWidth / 2;
    rhombusCoords[1].y = pointPrevious.y + lineWidth / 2;
    rhombusCoords[2].x = pointPrevious.x - lineWidth / 2;
    rhombusCoords[2].y = pointPrevious.y - lineWidth / 2;
    rhombusCoords[3].x = pointCurrent.x - lineWidth / 2;
    rhombusCoords[3].y = pointCurrent.y - lineWidth / 2;
    return rhombusCoords;
  } else if ((pointCurrent.x > pointPrevious.x && pointCurrent.y > pointPrevious.y) || (pointCurrent.x < pointPrevious.x && pointCurrent.y < pointPrevious.y)) {
    // Moving NW or SE \
    rhombusCoords[0].x = pointCurrent.x - lineWidth / 2;
    rhombusCoords[0].y = pointCurrent.y + lineWidth / 2;
    rhombusCoords[1].x = pointPrevious.x - lineWidth / 2;
    rhombusCoords[1].y = pointPrevious.y + lineWidth / 2;
    rhombusCoords[2].x = pointPrevious.x + lineWidth / 2;
    rhombusCoords[2].y = pointPrevious.y - lineWidth / 2;
    rhombusCoords[3].x = pointCurrent.x + lineWidth / 2;
    rhombusCoords[3].y = pointCurrent.y - lineWidth / 2;
    return rhombusCoords;
  }
}

function setupCursorTracking() {

  // Mouse Click
  cursorCanvas.onmousedown = function (e) {
    // Start drawing
    isDrawing = true;

    // Get correct cords from mouse click
    let cords = getMouseCoordinates(e);

    // Draw initial Shape
    // set lineWidth to 0 for initial drawing of shape to prevent screwing up of size/placement
    fowCanvas.drawInitial(cords)
  };

  // Mouse Move
  cursorCanvas.onmousemove = function (e) {
    //get cords and points
    let newCords = getMouseCoordinates(e);
    if (isDrawing) {
      fowCanvas.draw(newCords);
    }
    // Draw cursor and fow
    cursorCanvas.drawCursor(newCords);
  };

  cursorCanvas.drawCursor = function (cords) {
    // Cleanup
    cursorContext.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);

    // Construct circle dimensions
    let cursorMask = constructMask(cords);

    cursorContext.strokeStyle = cursorMask.line;
    cursorContext.fillStyle = cursorMask.fill;
    cursorContext.lineWidth = cursorMask.lineWidth;

    cursorContext.beginPath();
    if (brushShape == 'round') {
      cursorContext.arc(
        cursorMask.x,
        cursorMask.y,
        cursorMask.r,
        cursorMask.startingAngle,
        cursorMask.endingAngle,
        true
      );
    } else if (brushShape == 'square') {
      cursorContext.rect(
        cursorMask.centerX,
        cursorMask.centerY,
        cursorMask.height,
        cursorMask.width);
    }

    cursorContext.fill();
    cursorContext.stroke();
  }

}

function setUpDrawingEvents() {
  fowCanvas.drawInitial = function (coords) {
    originalCords = coords;
    // Construct mask dimensions
    let fowMask = constructMask(coords);
    fowContext.lineWidth = fowMask.lineWidth;

    fowContext.beginPath();
    if (brushShape == 'round') {
      fowContext.arc(
        fowMask.x,
        fowMask.y,
        fowMask.r,
        fowMask.startingAngle,
        fowMask.endingAngle,
        true
      );
    } else if (brushShape == 'square') {
      fowContext.rect(
        fowMask.centerX,
        fowMask.centerY,
        fowMask.height,
        fowMask.width);
    }

    fowContext.fill();
    fowContext.stroke();
  };

  fowCanvas.draw = function (newCords) {
    if (!isDrawing) return;
    if (newCords == originalCords) return;
    // For each point create a quadraticCurve btweeen each point
    if (brushShape == 'round') {

      // Start Path
      fowContext.lineWidth = lineWidth;
      fowContext.lineJoin = fowContext.lineCap = 'round';
      fowContext.beginPath();

      fowContext.moveTo(newCords.x, newCords.y);

      // Coordinates
      fowContext.lineTo(originalCords.x, originalCords.y);
      fowContext.stroke();
      originalCords = newCords;
    } else if (brushShape == 'square') {

      fowContext.lineWidth = 1
      fowContext.beginPath();

      // draw rectangle at current point
      let fowMask = constructMask(newCords);
      fowContext.fillRect(
        fowMask.centerX,
        fowMask.centerY,
        fowMask.height,
        fowMask.width);

      // optimal polygon to draw to connect two square
      let optimalPoints = findOptimalRhombus(newCords, originalCords);
      if (optimalPoints) {
        fowContext.moveTo(optimalPoints[0].x, optimalPoints[0].y);
        fowContext.lineTo(optimalPoints[1].x, optimalPoints[1].y);
        fowContext.lineTo(optimalPoints[2].x, optimalPoints[2].y);
        fowContext.lineTo(optimalPoints[3].x, optimalPoints[3].y);
        fowContext.fill();
      }
      originalCords = newCords;
    }
  };

  //TODO: move all of this jquery stuff somewhere else

  $('#btn-toggle-brush').click(function () {
    let toggleButton = this;
    if (toggleButton.innerHTML === 'Clear Brush') {
      toggleButton.innerHTML = 'Shadow Brush';
    } else {
      toggleButton.innerHTML = 'Clear Brush';
    }
    fowBrush.toggle();
  });

  $('#btn-shroud-all').click(function () {
    fogMap();
    createRender();
  });

  $('#btn-clear-all').click(function () {
    clearMap();
    createRender();
  });

  $('#btn-enlarge-brush').click(function () {
    // If the new width would be over 200, set it to 200
    lineWidth = (lineWidth * 2 > 200) ? 200 : lineWidth * 2;
  });

  $('#btn-shrink-brush').click(function () {
    // If the new width would be less than 1, set it to 1
    lineWidth = (lineWidth / 2 < 1) ? 1 : lineWidth / 2;
  });

  $('#btn-shape-brush').click(function () {
    let toggleButton = this;
    if (toggleButton.innerHTML === 'Square Brush') {
      toggleButton.innerHTML = 'Circle Brush';
      brushShape = 'square'
    } else {
      toggleButton.innerHTML = 'Square Brush';
      brushShape = 'round'
    }

  });

  $('#btn-render').click(function () {
    createRender();
  });

  document.addEventListener('mouseup', function () {
    isDrawing = false;
  });
}

//todo: move this functionality elsewher
export function createRender() {
  removeRender();
  createPlayerMapImage(mapImageCanvas, fowCanvas);
}

function removeRender() {
  $('#render').remove();
}

function createPlayerMapImage(bottomCanvas, topCanvas) {
  let mergedCanvas = mergeCanvas(bottomCanvas, topCanvas),
    mergedImage = convertCanvasToImage(mergedCanvas);

  mergedImage.id = 'render';

  //todo: refactor this functionality outside
  document.querySelector('#map-wrapper').appendChild(mergedImage);
}