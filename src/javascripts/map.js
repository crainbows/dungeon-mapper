import jquery from 'jquery';
const $ = jquery;
import Brush from './brush';
import * as canvas from './canvas';
export default class Map {
  constructor(parentElem, imgPath){
    this.parentElem = parentElem;
    this.imgPath = imgPath;
    this.cursorContext;
    this.cursorCanvas;
    this.fowContext;
    this.fowCanvas;
    this.mapImageContext;
    this.mapImageCanvas;
    this.brush;
    this.mapImage;
    this.width = 1400;
    this.height = 8000;
    this.originalcoords;
    this.create(parentElem);
  }
  create(parentElem) {
    const parent = this;
    this.mapImage = new Image();
    this.mapImage.onerror = () => console.error('error creating map');
    this.mapImage.onload = function () {

      let container;
      // TODO: make this more readable
      [parent.width, parent.height] = canvas.getOptimalDimensions(parent.mapImage.width, parent.mapImage.height, parent.width, parent.height);
      container = canvas.getContainer();
      parentElem.appendChild(container);
  
      [parent.mapImageCanvas, parent.fowCanvas,parent.cursorCanvas] = canvas.createCanvases(parent.width, parent.height);
  
      container.appendChild(parent.mapImageCanvas);
      container.appendChild(parent.fowCanvas);
      container.appendChild(parent.cursorCanvas);
  
      parent.mapImageContext = parent.mapImageCanvas.getContext('2d');
      parent.fowContext = parent.fowCanvas.getContext('2d');
      parent.cursorContext = parent.cursorCanvas.getContext('2d');
      parent.mapImageContext.drawImage(canvas.createImageCanvas(parent.mapImage, parent.width, parent.height), 0, 0, parent.width, parent.height);
  
      parent.brush = new Brush(parent.fowContext);
      parent.fowContext.strokeStyle = parent.brush.getCurrent();
  
      parent.fogMap();
      parent.createRender();
      parent.setUpDrawingEvents();
      parent.createDMToolbarListeners(parentElem);
      parent.setupCursorTracking();
      parent.fitMapToWindow();
      window.addEventListener('resize', () => this.fitMapToWindow());
    };
    this.mapImage.crossOrigin = 'Anonymous'; // to prevent tainted canvas errors
    this.mapImage.src = this.imgPath;
  }

  getMouseCoordinates(e) {
    let viewportOffset = this.fowCanvas.getBoundingClientRect(),
      borderTop = parseInt($(this.fowCanvas).css('border-top-width')),
      borderLeft = parseInt($(this.fowCanvas).css('border-left-width'));
  
    return {
      x: (e.clientX - viewportOffset.left - borderLeft) / this.getMapDisplayRatio(),
      y: (e.clientY - viewportOffset.top - borderTop) / this.getMapDisplayRatio()
    };
  }
  
  resetMap(context, brushType, brush) {
    context.save();
    context.fillStyle = brush.getPattern(brushType);
    context.fillRect(0, 0, this.width, this.height);
    context.restore();
  }
  
  fogMap() {
    this.resetMap(this.fowContext, 'fog', this.brush);
  }
  
  clearMap() {
    this.resetMap(this.fowContext, 'clear', this.brush);
  }
  
  resize(displayWidth, displayHeight) {
    this.fowCanvas.style.width = displayWidth + 'px';
    this.fowCanvas.style.height = displayHeight + 'px';
    this.mapImageCanvas.style.width = displayWidth + 'px';
    this.mapImageCanvas.style.height = displayHeight + 'px';
    this.cursorCanvas.style.width = displayWidth + 'px';
    this.cursorCanvas.style.height = displayHeight + 'px';
  
    if ($(window).width() > displayWidth) {
      let offset = ($(window).width() - displayWidth) / 2;
      this.fowCanvas.style.left = offset + 'px';
      this.mapImageCanvas.style.left = offset + 'px';
      this.cursorCanvas.style.left = offset + 'px';
    }
  }
  
  // Maybe having this here violates cohesion
  fitMapToWindow() {
    let newDims = canvas.getOptimalDimensions(this.mapImageCanvas.width, this.mapImageCanvas.height, $(window).width(), $(window).height());
    this.resize(newDims[0], newDims[1]);
  }
  
  remove() {
    this.mapImageCanvas.remove();
    this.fowCanvas.remove();
    this.cursorCanvas.remove();
  }
  
  getMapDisplayRatio() {
    return parseFloat(this.mapImageCanvas.style.width, 10) / this.mapImageCanvas.width;
  }
  
  findOptimalRhombus(pointCurrent, pointPrevious) {
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
      rhombusCoords[0].x = pointCurrent.x + this.brush.lineWidth / 2;
      rhombusCoords[0].y = pointCurrent.y + this.brush.lineWidth / 2;
      rhombusCoords[1].x = pointPrevious.x + this.brush.lineWidth / 2;
      rhombusCoords[1].y = pointPrevious.y + this.brush.lineWidth / 2;
      rhombusCoords[2].x = pointPrevious.x - this.brush.lineWidth / 2;
      rhombusCoords[2].y = pointPrevious.y - this.brush.lineWidth / 2;
      rhombusCoords[3].x = pointCurrent.x - this.brush.lineWidth / 2;
      rhombusCoords[3].y = pointCurrent.y - this.brush.lineWidth / 2;
      return rhombusCoords;
    } else if ((pointCurrent.x > pointPrevious.x && pointCurrent.y > pointPrevious.y) || (pointCurrent.x < pointPrevious.x && pointCurrent.y < pointPrevious.y)) {
      // Moving NW or SE \
      rhombusCoords[0].x = pointCurrent.x - this.brush.lineWidth / 2;
      rhombusCoords[0].y = pointCurrent.y + this.brush.lineWidth / 2;
      rhombusCoords[1].x = pointPrevious.x - this.brush.lineWidth / 2;
      rhombusCoords[1].y = pointPrevious.y + this.brush.lineWidth / 2;
      rhombusCoords[2].x = pointPrevious.x + this.brush.lineWidth / 2;
      rhombusCoords[2].y = pointPrevious.y - this.brush.lineWidth / 2;
      rhombusCoords[3].x = pointCurrent.x + this.brush.lineWidth / 2;
      rhombusCoords[3].y = pointCurrent.y - this.brush.lineWidth / 2;
      return rhombusCoords;
    }
  }
  
  setupCursorTracking() {
    const parent = this;
    // Mouse Click
    this.cursorCanvas.onmousedown = function (e) {
      // Start drawing
      parent.brush.isDrawing = true;
  
      // Get correct coords from mouse click
      let coords = parent.getMouseCoordinates(e);
  
      // Draw initial Shape
      // set lineWidth to 0 for initial drawing of shape to prevent screwing up of size/placement
      parent.fowCanvas.drawInitial(coords)
    };
  
    // Mouse Move
    this.cursorCanvas.onmousemove = function (e) {
      //get coords and points
      let newcoords = parent.getMouseCoordinates(e);
      if (parent.brush.isDrawing) {
        parent.fowCanvas.draw(newcoords);
      }
      // Draw cursor and fow
      parent.cursorCanvas.drawCursor(newcoords);
    };
  
    this.cursorCanvas.drawCursor = function (coords) {
      // Cleanup
      parent.cursorContext.clearRect(0, 0, parent.cursorCanvas.width, parent.cursorCanvas.height);
  
      // Construct circle dimensions
      let cursorMask = parent.brush.getMask(coords);
  
      parent.cursorContext.strokeStyle = cursorMask.line;
      parent.cursorContext.fillStyle = cursorMask.fill;
      parent.cursorContext.lineWidth = cursorMask.lineWidth;
  
      parent.cursorContext.beginPath();
      if (parent.brush.shape == 'round') {
        parent.cursorContext.arc(
          cursorMask.x,
          cursorMask.y,
          cursorMask.r,
          cursorMask.startingAngle,
          cursorMask.endingAngle,
          true
        );
      } else if (parent.brush.shape == 'square') {
        parent.cursorContext.rect(
          cursorMask.centerX,
          cursorMask.centerY,
          cursorMask.height,
          cursorMask.width);
      }
  
      parent.cursorContext.fill();
      parent.cursorContext.stroke();
    }
  
  }
  
  setUpDrawingEvents() {
    const parent = this;
    this.fowCanvas.drawInitial = function (coords) {
      parent.originalcoords = coords;
      // Construct mask dimensions
      let fowMask = parent.brush.getMask(coords);
      parent.fowContext.lineWidth = fowMask.lineWidth;
  
      parent.fowContext.beginPath();
      if (parent.brush.shape == 'round') {
        parent.fowContext.arc(
          fowMask.x,
          fowMask.y,
          fowMask.r,
          fowMask.startingAngle,
          fowMask.endingAngle,
          true
        );
      } else if (parent.brush.shape == 'square') {
        parent.fowContext.rect(
          fowMask.centerX,
          fowMask.centerY,
          fowMask.height,
          fowMask.width);
      }
  
      parent.fowContext.fill();
      parent.fowContext.stroke();
    };
  
    this.fowCanvas.draw = function (newcoords) {
      if (!parent.brush.isDrawing) return;
      if (newcoords == parent.originalcoords) return;
      if (parent.brush.shape == 'round') {
  
        // Start Path
        parent.fowContext.lineWidth = parent.brush.lineWidth;
        parent.fowContext.lineJoin = parent.fowContext.lineCap = 'round';
        parent.fowContext.beginPath();
  
        parent.fowContext.moveTo(newcoords.x, newcoords.y);
  
        // Coordinates
        parent.fowContext.lineTo(parent.originalcoords.x, parent.originalcoords.y);
        parent.fowContext.stroke();
        parent.originalcoords = newcoords;
      } else if (parent.brush.shape == 'square') {
  
        parent.fowContext.lineWidth = 1
        parent.fowContext.beginPath();
  
        // draw rectangle at current point
        let fowMask = parent.brush.getMask(newcoords);
        parent.fowContext.fillRect(
          fowMask.centerX,
          fowMask.centerY,
          fowMask.height,
          fowMask.width);
  
        // optimal polygon to draw to connect two square
        let optimalPoints = parent.findOptimalRhombus(newcoords, parent.originalcoords);
        if (optimalPoints) {
          parent.fowContext.moveTo(optimalPoints[0].x, optimalPoints[0].y);
          parent.fowContext.lineTo(optimalPoints[1].x, optimalPoints[1].y);
          parent.fowContext.lineTo(optimalPoints[2].x, optimalPoints[2].y);
          parent.fowContext.lineTo(optimalPoints[3].x, optimalPoints[3].y);
          parent.fowContext.fill();
        }
        parent.originalcoords = newcoords;
      }
    };
  
    //TODO: move all of this jquery stuff somewhere else
    
  
  
    document.addEventListener('mouseup', function () {
      parent.brush.isDrawing = false;
    });
  }
  
  createDMToolbarListeners(parentElem){
    $(parentElem).find('.btn-shroud-all').click(function () {
      parent.fogMap();
      parent.createRender();
    });
    
    $(parentElem).find('.btn-clear-all').click(function () {
      parent.clearMap();
      parent.createRender();
    });
  
    $(parentElem).find('.btn-toggle-this.brush').click(function () {
      if (this.innerHTML === 'Clear this.brush') {
        this.innerHTML = 'Shadow this.brush';
      } else {
        this.innerHTML = 'Clear this.brush';
      }
      parent.brush.toggle();
    });
    
    $(parentElem).find('.btn-shrink-this.brush').click(function () {
      parent.brush.shrink();
    });
    
    $(parentElem).find('.btn-enlarge-this.brush').click(function () {
      parent.brush.enlarge();
    });
    
    $(parentElem).find('.btn-shape-this.brush').click(function () {
      if (this.innerHTML === 'Square this.brush') {
        this.innerHTML = 'Circle this.brush';
        parent.brush.shape = 'square'
      } else {
        this.innerHTML = 'Square this.brush';
        parent.brush.shape = 'round'
      }
  
    });
  }
  
  //todo: move this functionality elsewhere
  createRender() {
    this.removeRender();
    this.createPlayermapImage(this.mapImageCanvas, this.fowCanvas);
  }
  
  removeRender() {
    $('#render').remove();
  }
  
  createPlayermapImage(bottomCanvas, topCanvas) {
    let mergedCanvas = canvas.mergeCanvas(bottomCanvas, topCanvas, this.width, this.height),
      mergedImage = canvas.convertCanvasToImage(mergedCanvas);
  
    mergedImage.id = 'render';
  
    //todo: refactor this functionality outside
    document.querySelector('#map-wrapper').appendChild(mergedImage);
  }
  
}