export default class Brush {

  constructor(context){
    if (!context) {
      throw new Error('Invalid args');
    }
    this.context = context;
    this.brushTypes = ["clear", "fog"];
    this.currentBrushType = this.brushTypes[0];
  }

  // Future implementation
  // setBrushType() {
  //   console.error("Doesn't exist yet");
  // }

  toggle() {
    if (this.currentBrushType === this.brushTypes[0]) {
      this.currentBrushType = this.brushTypes[1];
    } else if (this.currentBrushType === this.brushTypes[1]) {
      this.currentBrushType = this.brushTypes[0];
    }
    this.context.strokeStyle = this.getCurrent();
  }

  getPattern(brushType) {
    if (brushType === this.brushTypes[0]) {
      this.context.globalCompositeOperation = 'destination-out';
      return 'rgba(0,0,0,1)';
    } else if (brushType === this.brushTypes[1]) {
      this.context.globalCompositeOperation = 'source-over';
      return 'rgba(0,0,0,1)';
    }
  }

  getCurrent() {
    return this.getPattern(this.currentBrushType);
  }
}