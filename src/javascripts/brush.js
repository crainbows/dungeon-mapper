export default class Brush {

  constructor(context, settings){
    if (!context || !settings) {
      throw new Error('Invalid args');
    }
    this.context = context;
    this.settings = settings;
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
      return 'rgba(' + this.settings.fogRGB + ',' + this.settings.fogOpacity + ')';
    } else if (brushType === this.brushTypes[1]) {
      this.context.globalCompositeOperation = 'source-over';
      return 'rgba(' + this.settings.fogRGB + ',' + this.settings.fogOpacity + ')';
    }
  }

  getCurrent() {
    return this.getPattern(this.currentBrushType);
  }
}