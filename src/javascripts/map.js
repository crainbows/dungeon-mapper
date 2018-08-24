import jquery from 'jquery';
const $ = jquery;
import Brush from './brush';
import * as canvas from './canvas';
export {create, remove, createRender};
let cursorContext;
let cursorCanvas;
let fowContext;
let fowCanvas;
let mapImageContext;
let mapImageCanvas;
let brush;
let mapImage;
let width = 1400;
let height = 8000;
let originalcoords;

function create(parentElem) {
  mapImage = new Image();
  mapImage.onerror = () => console.error('error creating map');
  mapImage.onload = function () {
    let container;

    // TODO: make this more readable
    [width, height] = canvas.getOptimalDimensions(mapImage.width, mapImage.height, width, height);
    container = canvas.getContainer();
    parentElem.appendChild(container);

    [mapImageCanvas, fowCanvas,cursorCanvas] = canvas.createCanvases(width, height);

    container.appendChild(mapImageCanvas);
    container.appendChild(fowCanvas);
    container.appendChild(cursorCanvas);

    mapImageContext = mapImageCanvas.getContext('2d');
    fowContext = fowCanvas.getContext('2d');
    cursorContext = cursorCanvas.getContext('2d');
    mapImageContext.drawImage(canvas.createImageCanvas(mapImage, width, height), 0, 0, width, height);

    brush = new Brush(fowContext);
    fowContext.strokeStyle = brush.getCurrent();

    fogMap();
    createRender();
    setUpDrawingEvents();
    createDMToolbar(parentElem);
    setupCursorTracking();
    fitMapToWindow();
    window.addEventListener('resize', () => fitMapToWindow());
  };
  mapImage.crossOrigin = 'Anonymous'; // to prevent tainted canvas errors
  mapImage.src = '/dm/map';
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

function resetMap(context, brushType, brush) {
  context.save();
  context.fillStyle = brush.getPattern(brushType);
  context.fillRect(0, 0, width, height);
  context.restore();
}

function fogMap() {
  resetMap(fowContext, 'fog', brush);
}

function clearMap() {
  resetMap(fowContext, 'clear', brush);
}

function resize(displayWidth, displayHeight) {
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
function fitMapToWindow() {
  let newDims = canvas.getOptimalDimensions(mapImageCanvas.width, mapImageCanvas.height, $(window).width(), $(window).height());
  resize(newDims[0], newDims[1]);
}

function remove() {
  mapImageCanvas.remove();
  fowCanvas.remove();
  cursorCanvas.remove();
}

function getMapDisplayRatio() {
  return parseFloat(mapImageCanvas.style.width, 10) / mapImageCanvas.width;
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
    rhombusCoords[0].x = pointCurrent.x + brush.lineWidth / 2;
    rhombusCoords[0].y = pointCurrent.y + brush.lineWidth / 2;
    rhombusCoords[1].x = pointPrevious.x + brush.lineWidth / 2;
    rhombusCoords[1].y = pointPrevious.y + brush.lineWidth / 2;
    rhombusCoords[2].x = pointPrevious.x - brush.lineWidth / 2;
    rhombusCoords[2].y = pointPrevious.y - brush.lineWidth / 2;
    rhombusCoords[3].x = pointCurrent.x - brush.lineWidth / 2;
    rhombusCoords[3].y = pointCurrent.y - brush.lineWidth / 2;
    return rhombusCoords;
  } else if ((pointCurrent.x > pointPrevious.x && pointCurrent.y > pointPrevious.y) || (pointCurrent.x < pointPrevious.x && pointCurrent.y < pointPrevious.y)) {
    // Moving NW or SE \
    rhombusCoords[0].x = pointCurrent.x - brush.lineWidth / 2;
    rhombusCoords[0].y = pointCurrent.y + brush.lineWidth / 2;
    rhombusCoords[1].x = pointPrevious.x - brush.lineWidth / 2;
    rhombusCoords[1].y = pointPrevious.y + brush.lineWidth / 2;
    rhombusCoords[2].x = pointPrevious.x + brush.lineWidth / 2;
    rhombusCoords[2].y = pointPrevious.y - brush.lineWidth / 2;
    rhombusCoords[3].x = pointCurrent.x + brush.lineWidth / 2;
    rhombusCoords[3].y = pointCurrent.y - brush.lineWidth / 2;
    return rhombusCoords;
  }
}

function setupCursorTracking() {

  // Mouse Click
  cursorCanvas.onmousedown = function (e) {
    // Start drawing
    brush.isDrawing = true;

    // Get correct coords from mouse click
    let coords = getMouseCoordinates(e);

    // Draw initial Shape
    // set lineWidth to 0 for initial drawing of shape to prevent screwing up of size/placement
    fowCanvas.drawInitial(coords)
  };

  // Mouse Move
  cursorCanvas.onmousemove = function (e) {
    //get coords and points
    let newcoords = getMouseCoordinates(e);
    if (brush.isDrawing) {
      fowCanvas.draw(newcoords);
    }
    // Draw cursor and fow
    cursorCanvas.drawCursor(newcoords);
  };

  cursorCanvas.drawCursor = function (coords) {
    // Cleanup
    cursorContext.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);

    // Construct circle dimensions
    let cursorMask = brush.getMask(coords);

    cursorContext.strokeStyle = cursorMask.line;
    cursorContext.fillStyle = cursorMask.fill;
    cursorContext.lineWidth = cursorMask.lineWidth;

    cursorContext.beginPath();
    if (brush.shape == 'round') {
      cursorContext.arc(
        cursorMask.x,
        cursorMask.y,
        cursorMask.r,
        cursorMask.startingAngle,
        cursorMask.endingAngle,
        true
      );
    } else if (brush.shape == 'square') {
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
    originalcoords = coords;
    // Construct mask dimensions
    let fowMask = brush.getMask(coords);
    fowContext.lineWidth = fowMask.lineWidth;

    fowContext.beginPath();
    if (brush.shape == 'round') {
      fowContext.arc(
        fowMask.x,
        fowMask.y,
        fowMask.r,
        fowMask.startingAngle,
        fowMask.endingAngle,
        true
      );
    } else if (brush.shape == 'square') {
      fowContext.rect(
        fowMask.centerX,
        fowMask.centerY,
        fowMask.height,
        fowMask.width);
    }

    fowContext.fill();
    fowContext.stroke();
  };

  fowCanvas.draw = function (newcoords) {
    if (!brush.isDrawing) return;
    if (newcoords == originalcoords) return;
    if (brush.shape == 'round') {

      // Start Path
      fowContext.lineWidth = brush.lineWidth;
      fowContext.lineJoin = fowContext.lineCap = 'round';
      fowContext.beginPath();

      fowContext.moveTo(newcoords.x, newcoords.y);

      // Coordinates
      fowContext.lineTo(originalcoords.x, originalcoords.y);
      fowContext.stroke();
      originalcoords = newcoords;
    } else if (brush.shape == 'square') {

      fowContext.lineWidth = 1
      fowContext.beginPath();

      // draw rectangle at current point
      let fowMask = brush.getMask(newcoords);
      fowContext.fillRect(
        fowMask.centerX,
        fowMask.centerY,
        fowMask.height,
        fowMask.width);

      // optimal polygon to draw to connect two square
      let optimalPoints = findOptimalRhombus(newcoords, originalcoords);
      if (optimalPoints) {
        fowContext.moveTo(optimalPoints[0].x, optimalPoints[0].y);
        fowContext.lineTo(optimalPoints[1].x, optimalPoints[1].y);
        fowContext.lineTo(optimalPoints[2].x, optimalPoints[2].y);
        fowContext.lineTo(optimalPoints[3].x, optimalPoints[3].y);
        fowContext.fill();
      }
      originalcoords = newcoords;
    }
  };

  //TODO: move all of this jquery stuff somewhere else
  


  document.addEventListener('mouseup', function () {
    brush.isDrawing = false;
  });
}

function createDMToolbar(parentElem){
  $(parentElem).find('.btn-shroud-all').click(function () {
    fogMap();
    createRender();
  });
  
  $(parentElem).find('.btn-clear-all').click(function () {
    clearMap();
    createRender();
  });

  $(parentElem).find('.btn-toggle-brush').click(function () {
    if (this.innerHTML === 'Clear Brush') {
      this.innerHTML = 'Shadow Brush';
    } else {
      this.innerHTML = 'Clear Brush';
    }
    brush.toggle();
  });
  
  $(parentElem).find('.btn-shrink-brush').click(function () {
    brush.shrink();
  });
  
  $(parentElem).find('.btn-enlarge-brush').click(function () {
    brush.enlarge();
  });
  
  $(parentElem).find('.btn-shape-brush').click(function () {
    if (this.innerHTML === 'Square Brush') {
      this.innerHTML = 'Circle Brush';
      brush.shape = 'square'
    } else {
      this.innerHTML = 'Square Brush';
      brush.shape = 'round'
    }

  });
}

//todo: move this functionality elsewhere
function createRender() {
  removeRender();
  createPlayerMapImage(mapImageCanvas, fowCanvas);
}

function removeRender() {
  $('#render').remove();
}

function createPlayerMapImage(bottomCanvas, topCanvas) {
  let mergedCanvas = canvas.mergeCanvas(bottomCanvas, topCanvas, width, height),
    mergedImage = canvas.convertCanvasToImage(mergedCanvas);

  mergedImage.id = 'render';

  //todo: refactor this functionality outside
  document.querySelector('#map-wrapper').appendChild(mergedImage);
}
