import { useEffect } from 'react';
import { Canvas as FabricCanvas } from 'fabric';

export const useObjectStateManager = (
  fabricCanvas: FabricCanvas | null,
  selectedTool: string
) => {
  useEffect(() => {
    if (!fabricCanvas) return;

    // FREEZE: Skip everything during drawing mode - let Fabric.js handle it natively
    if (selectedTool === 'draw') {
      console.log('ObjectStateManager: Frozen during drawing mode');
      return;
    }

    // Only manage object selectability for non-drawing modes
    fabricCanvas.forEachObject((obj) => {
      if (selectedTool === 'select') {
        // In select mode, all objects should be selectable
        obj.selectable = true;
      } else if (selectedTool === 'hand') {
        // In hand mode, allow object selection but disable during panning
        obj.selectable = true;
      } else {
        // For other tools (frame, text), disable selection temporarily
        // But preserve frame objects that were just created
        if (!(obj as any).isFrameObject || selectedTool !== 'frame') {
          obj.selectable = false;
        }
      }
    });

    fabricCanvas.renderAll();
  }, [selectedTool, fabricCanvas]);
};
