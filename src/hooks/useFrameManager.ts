import { useEffect } from 'react';
import { Canvas as FabricCanvas } from 'fabric';
import { FrameContainer } from '@/lib/FrameContainer';

export const useFrameManager = (fabricCanvas: FabricCanvas | null) => {
  useEffect(() => {
    if (!fabricCanvas) return;

    // Update frame children when objects move
    const handleObjectMoving = () => {
      const frames = fabricCanvas.getObjects().filter(obj => 
        (obj as any).isFrameContainer
      );

      frames.forEach(frame => {
        (frame as FrameContainer).updateChildren();
      });
    };

    // Ensure frames stay at the back when objects are added
    const handleObjectAdded = () => {
      const frames = fabricCanvas.getObjects().filter(obj => 
        (obj as any).isFrameContainer
      );

      frames.forEach(frame => {
        (frame as FrameContainer).sendToBack();
      });
    };

    fabricCanvas.on('object:moving', handleObjectMoving);
    fabricCanvas.on('object:added', handleObjectAdded);

    return () => {
      fabricCanvas.off('object:moving', handleObjectMoving);
      fabricCanvas.off('object:added', handleObjectAdded);
    };
  }, [fabricCanvas]);
};