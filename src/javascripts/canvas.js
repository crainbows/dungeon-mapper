import { HexBase64Latin1Encoding } from "crypto";

/**
 * Returns maximum dimentions for an image without distorting the aspect ratio.
 * 
 * @param {number} idealWidth
 * @param {number} idealHeight
 * @param {number} maxWidth
 * @param {number} maxHeight
 * @return {array} An array of dimentions and their ratio [Width, Height, Ratio]
 */
export function getOptimalDimensions(idealWidth, idealHeight, maxWidth, maxHeight) {
  console.log(idealWidth, idealHeight, maxWidth, maxHeight);
  let ratio = Math.min(maxWidth / idealWidth, (maxHeight - 150) / idealHeight);

  return [
    idealWidth * ratio, // Width
    idealHeight * ratio,// Height
    ratio               // Ratio
  ];
}

/**
 * Creates a canvas.
 *
 * @param {string} type
 * @param {number} zIndex
 * @param {number} width
 * @param {number} height
 * @returns {HTMLCanvasElement}
 */
function createCanvas(type, zIndex, width, height) {
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

/**
 * Create multiple canvases required for the map.
 *
 * @export
 * @param {number} width
 * @param {number} height
 * @returns {array} Array of canvas elements
 */
export function createCanvases(width, height){
  return [
    createCanvas('map-image-canvas', 1, width, height),
    createCanvas('fow-canvas', 2, width, height),
    createCanvas('cursor-canvas', 3, width, height),
  ]

}

/**
 *
 *
 * @export
 * @param {HTMLCanvasElement} bottomCanvas
 * @param {HTMLCanvasElement} topCanvas
 * @param {number} width
 * @param {number} height
 * @returns {HTMLCanvasElement} A merged canvas element.
 */
export function mergeCanvas(bottomCanvas, topCanvas, width, height) {
  let mergedCanvas = document.createElement('canvas');
  let mergedContext = mergedCanvas.getContext('2d');
  mergedCanvas.width = width;
  mergedCanvas.height = height;
  mergedContext.drawImage(bottomCanvas, 0, 0, width, height);
  mergedContext.drawImage(topCanvas, 0, 0, width, height);
  return mergedCanvas;
}

/**
 * Creates and returns a HTML element to contain the canvases.
 *
 * @export
 * @returns {HTMLElement}
 */
export function getContainer() {
  let container = document.getElementById('canvasContainer') || document.createElement('div');

  container.id = 'canvasContainer'; //TODO: wont work for multiple containers
  container.style.position = 'relative';
  container.style.top = '0';
  container.style.left = '0';
  container.style.margin = 'auto';
  return container;
}

/**
 *
 *
 * @export
 * @param {HTMLCanvasElement} canvas
 * @returns {HexBase64Latin1Encoding}
 */
export function convertCanvasToImage(canvas) {
  let image = new Image();
  image.src = canvas.toDataURL('image/png');
  return image;
}

/**
 * Creates a canvas from an image
 *
 * @export
 * @param {*} img
 * @param {number} width
 * @param {number} height
 * @returns
 */
export function createImageCanvas(img, width, height) {
  let imageCanvas = document.createElement('canvas');
  let imageContext = imageCanvas.getContext('2d');
  imageCanvas.width = width;
  imageCanvas.height = height;
  imageContext.drawImage(img, 0, 0, width, height);
  return imageCanvas;
}