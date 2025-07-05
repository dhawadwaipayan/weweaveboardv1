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
        // In hand mode, disable object selection to prevent conflicts with panning
        obj.selectable = false;
      } else if (selectedTool === 'frame') {
        // In frame mode, only frames should be selectable
        if ((obj as any).name === 'frame-rectangle') {
          obj.selectable = true;
        } else {
          obj.selectable = false;
        }
      } else {
        // For other tools (text, etc.), disable selection temporarily
        obj.selectable = false;
      }
    });

    fabricCanvas.renderAll();
  }, [selectedTool, fabricCanvas]);
};
