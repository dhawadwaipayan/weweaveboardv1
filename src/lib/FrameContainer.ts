import { Rect, FabricObject, Canvas as FabricCanvas } from 'fabric';

export class FrameContainer extends Rect {
  public isFrameContainer: boolean = true;
  private fabricCanvas: FabricCanvas | null = null;
  private childIds: Set<string> = new Set();
  private lastLeft: number = 0;
  private lastTop: number = 0;

  constructor(options: any = {}) {
    super({
      ...options,
      name: 'frame-container',
      backgroundColor: '#1A1A1A',
      stroke: '#333333',
      strokeWidth: 2,
      fill: '#1A1A1A',
      selectable: true,
      evented: true,
    });
    this.on('moving', this.handleFrameMove.bind(this));
    this.lastLeft = this.left || 0;
    this.lastTop = this.top || 0;
  }

  setCanvas(canvas: FabricCanvas) {
    this.fabricCanvas = canvas;
  }

  // Check if an object is inside this frame's boundaries
  isObjectInside(obj: FabricObject): boolean {
    if (!obj.left || !obj.top || !this.left || !this.top || !this.width || !this.height) {
      return false;
    }
    const frameLeft = this.left;
    const frameTop = this.top;
    const frameRight = frameLeft + (this.width * (this.scaleX || 1));
    const frameBottom = frameTop + (this.height * (this.scaleY || 1));
    const objLeft = obj.left;
    const objTop = obj.top;
    const objRight = objLeft + ((obj.width || 0) * (obj.scaleX || 1));
    const objBottom = objTop + ((obj.height || 0) * (obj.scaleY || 1));
    // Check if object is mostly inside frame (at least 50% overlap)
    const overlapLeft = Math.max(frameLeft, objLeft);
    const overlapTop = Math.max(frameTop, objTop);
    const overlapRight = Math.min(frameRight, objRight);
    const overlapBottom = Math.min(frameBottom, objBottom);
    if (overlapLeft < overlapRight && overlapTop < overlapBottom) {
      const overlapArea = (overlapRight - overlapLeft) * (overlapBottom - overlapTop);
      const objArea = (objRight - objLeft) * (objBottom - objTop);
      return overlapArea / objArea > 0.5; // 50% overlap threshold
    }
    return false;
  }

  // Track children by ID, do not group
  updateChildren() {
    if (!this.fabricCanvas) return;
    const allObjects = this.fabricCanvas.getObjects();
    const newChildren: Set<string> = new Set();
    allObjects.forEach(obj => {
      if (obj === this || (obj as any).isFrameContainer) return;
      if (this.isObjectInside(obj)) {
        if (!(obj as any).id) (obj as any).id = 'obj-' + Math.random().toString(36).slice(2);
        newChildren.add((obj as any).id);
      }
    });
    this.childIds = newChildren;
  }

  // Move all children by the same delta as the frame
  private handleFrameMove() {
    if (!this.fabricCanvas) return;
    const dx = (this.left || 0) - this.lastLeft;
    const dy = (this.top || 0) - this.lastTop;
    if (dx === 0 && dy === 0) return;
    const allObjects = this.fabricCanvas.getObjects();
    allObjects.forEach(obj => {
      const id = (obj as any).id;
      if (id && this.childIds.has(id)) {
        obj.left = (obj.left || 0) + dx;
        obj.top = (obj.top || 0) + dy;
        obj.setCoords && obj.setCoords();
      }
    });
    this.lastLeft = this.left || 0;
    this.lastTop = this.top || 0;
    this.fabricCanvas.renderAll();
  }

  // Ensure frame is always at the back (lowest z-index)
  sendToBack() {
    if (this.fabricCanvas) {
      this.fabricCanvas.sendObjectToBack(this);
      console.log('Frame sent to back');
    }
  }
}