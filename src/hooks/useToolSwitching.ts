import { useEffect } from 'react';
import { Canvas as FabricCanvas } from 'fabric';

export const useToolSwitching = (
  fabricCanvas: FabricCanvas | null,
  selectedTool: string,
  setIsCreatingFrame: (value: boolean) => void,
  setIsPanning: (value: boolean) => void
) => {
  useEffect(() => {
    if (!fabricCanvas) return;

    console.log('Switching to tool:', selectedTool);

    // Clear any existing temporary states
    setIsCreatingFrame(false);
    setIsPanning(false);

    // Remove ALL event handlers to prevent conflicts
    fabricCanvas.off();

    // Reset canvas state
    fabricCanvas.isDrawingMode = false;
    fabricCanvas.selection = true;
    fabricCanvas.hoverCursor = 'move';
    fabricCanvas.moveCursor = 'move';

    // Configure canvas based on selected tool
    switch (selectedTool) {
      case 'draw':
        console.log('Activating drawing mode - ISOLATING ALL OTHER FEATURES');
        fabricCanvas.isDrawingMode = true;
        fabricCanvas.selection = false;
        fabricCanvas.hoverCursor = 'crosshair';
        fabricCanvas.moveCursor = 'crosshair';
        
        // Disable ALL object interactions during drawing
        fabricCanvas.forEachObject((obj) => {
          obj.selectable = false;
          obj.evented = false;
        });
        
        // Ensure brush is properly configured
        if (fabricCanvas.freeDrawingBrush) {
          fabricCanvas.freeDrawingBrush.color = '#FF0000';
          fabricCanvas.freeDrawingBrush.width = 3;
        }
        break;
        
      case 'select':
        console.log('Activating select mode');
        fabricCanvas.selection = true;
        fabricCanvas.hoverCursor = 'move';
        fabricCanvas.moveCursor = 'move';
        
        // Re-enable object interactions
        fabricCanvas.forEachObject((obj) => {
          obj.selectable = true;
          obj.evented = true;
        });
        break;
        
      case 'hand':
        console.log('Activating hand mode');
        fabricCanvas.selection = false;
        fabricCanvas.hoverCursor = 'grab';
        fabricCanvas.moveCursor = 'grab';
        
        // Disable object selection but keep events for panning
        fabricCanvas.forEachObject((obj) => {
          obj.selectable = false;
          obj.evented = false;
        });
        break;
        
      case 'frame':
        console.log('Activating frame mode');
        fabricCanvas.selection = false;
        fabricCanvas.hoverCursor = 'crosshair';
        fabricCanvas.moveCursor = 'crosshair';
        
        // Disable object selection for frame creation
        fabricCanvas.forEachObject((obj) => {
          obj.selectable = false;
          obj.evented = false;
        });
        break;
        
      case 'text':
        console.log('Activating text mode');
        fabricCanvas.selection = false;
        fabricCanvas.hoverCursor = 'text';
        fabricCanvas.moveCursor = 'text';
        
        // Disable object selection for text creation
        fabricCanvas.forEachObject((obj) => {
          obj.selectable = false;
          obj.evented = false;
        });
        break;
        
      default:
        fabricCanvas.selection = true;
        // Re-enable object interactions for default mode
        fabricCanvas.forEachObject((obj) => {
          obj.selectable = true;
          obj.evented = true;
        });
        break;
    }

    fabricCanvas.renderAll();
  }, [selectedTool, fabricCanvas, setIsCreatingFrame, setIsPanning]);
};
