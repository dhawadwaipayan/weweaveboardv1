import { useEffect } from 'react';
import { Canvas as FabricCanvas } from 'fabric';

export const useObjectStateManager = (
  fabricCanvas: FabricCanvas | null,
  selectedTool: string
) => {
  useEffect(() => {
    if (!fabricCanvas) return;

    // Only manage object selectability, don't touch evented property
    fabricCanvas.forEachObject((obj) => {
      if (selectedTool === 'select') {
        // In select mode, all objects should be selectable
        obj.selectable = true;
      } else if (selectedTool === 'draw') {
        // In draw mode, disable selection but keep events
        obj.selectable = false;
      } else {
        // For other tools (frame, text, hand), disable selection temporarily
        obj.selectable = false;
      }
    });

    fabricCanvas.renderAll();
  }, [selectedTool, fabricCanvas]);
};
