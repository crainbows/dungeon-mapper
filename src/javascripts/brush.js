/**
 *
 *
 * @export
 * @class Brush
 */
export default class Brush {

  /**
   * Creates an instance of Brush.
   * @param {HTMLCanvasElement} context Canvas element to create the brush under.
   * @memberof Brush
   */
  constructor(context){
    if (!context) {
      throw new Error('Invalid args');
    }
    this.context = context;
    this.modes = ["clear", "fog"];
    this.currentMode = this.modes[0];
    this.lineWidth = 15;
    this.shape = 'round';
    this.isDrawing = false;
  }

  // Future implementation
  // setBrushType() {
  //   console.error("Doesn't exist yet");
  // }

  /**
   * Toggle the mode of the brush between clear and fog
   *
   * @memberof Brush
   */
  toggle() {
    if (this.currentMode === this.modes[0]) {
      this.currentMode = this.modes[1];
    } else if (this.currentMode === this.modes[1]) {
      this.currentMode = this.modes[0];
    }
    this.context.strokeStyle = this.getCurrent();
  }

  /**
   *
   *
   * @param {string} brushMode clear or fog
   * @returns {string} colour of the fog - rgba(0,0,0,1) 
   * @memberof Brush
   */
  getPattern(brushMode) {
    if (brushMode === this.modes[0]) {
      this.context.globalCompositeOperation = 'destination-out';
      return 'rgba(0,0,0,1)';
    } else if (brushMode === this.modes[1]) {
      this.context.globalCompositeOperation = 'source-over';
      return 'rgba(0,0,0,1)';
    }
  }

  getCurrent() {
    return this.getPattern(this.currentMode);
  }

  /**
   *
   *
   * @param {object} coords
   * @param {number} coords.x - X coordinate.
   * @param {number} coords.y - Y coordinate.
   * @returns {object} Dimentions of current brush depending on shape.
   * @memberof Brush
   */
  getMask(coords) {
    let maskDimensions = {
      x: coords.x,
      y: coords.y,
      lineWidth: 2,
      line: 'aqua',
      fill: 'transparent'
    };
  
    if (this.shape == 'round') {
      maskDimensions.r = this.lineWidth / 2;
      maskDimensions.startingAngle = 0;
      maskDimensions.endingAngle = Math.PI * 2
    } else if (this.shape == 'square') {
      maskDimensions.centerX = maskDimensions.x - this.lineWidth / 2;
      maskDimensions.centerY = maskDimensions.y - this.lineWidth / 2;
      maskDimensions.height = this.lineWidth;
      maskDimensions.width = this.lineWidth;
    } else {
      throw new Error('brush shape not found')
    }
    return maskDimensions
  }

  shrink() {
    // If the new width would be over 200, set it to 200
    this.lineWidth = (this.lineWidth / 2 < 1) ? 1 : this.lineWidth / 2;
  }

  enlarge() {
    // If the new width would be less than 1, set it to 1
    this.lineWidth = (this.lineWidth * 2 > 200) ? 200 : this.lineWidth * 2;
  }
}