import { Group, FabricObject, Canvas as FabricCanvas, Point } from 'fabric';

export class FrameContainer extends Group {
  public isFrameContainer: boolean = true;
  private fabricCanvas: FabricCanvas | null = null;

  constructor(objects: FabricObject[] = [], options: any = {}) {
    super(objects, {
      ...options,
      name: 'frame-container',
      selectable: true,
      evented: true,
    });

    this.on('moving', this.handleFrameMove.bind(this));
    this.on('scaling', this.handleFrameScale.bind(this));
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

  // Automatically detect and add/remove children based on position
  updateChildren() {
    if (!this.fabricCanvas) return;

    const allObjects = this.fabricCanvas.getObjects();
    const currentChildren = this.getObjects();

    allObjects.forEach(obj => {
      if (obj === this || (obj as any).isFrameContainer) return;

      const isInside = this.isObjectInside(obj);
      const isCurrentChild = currentChildren.includes(obj);

      if (isInside && !isCurrentChild) {
        // Add object as child
        this.add(obj);
        console.log('Added object to frame:', obj);
      } else if (!isInside && isCurrentChild) {
        // Remove object from frame
        this.remove(obj);
        console.log('Removed object from frame:', obj);
      }
    });
  }

  // Handle frame movement - move all children accordingly
  private handleFrameMove() {
    // Children automatically move with the group in Fabric.js
    console.log('Frame moved, children moved automatically');
  }

  // Handle frame scaling - adjust children positions
  private handleFrameScale() {
    console.log('Frame scaled, children scaled automatically');
  }

  // Ensure frame is always at the back (lowest z-index)
  sendToBack() {
    if (this.fabricCanvas) {
      this.fabricCanvas.sendObjectToBack(this);
      console.log('Frame sent to back');
    }
  }
}