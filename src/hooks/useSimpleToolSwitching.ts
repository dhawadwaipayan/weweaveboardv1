import { useEffect } from 'react';
import { Canvas as FabricCanvas, PencilBrush } from 'fabric';

export const useSimpleToolSwitching = (
  fabricCanvas: FabricCanvas | null,
  selectedTool: string
) => {
  useEffect(() => {
    if (!fabricCanvas) return;

    console.log('Simple tool switch to:', selectedTool);

    // Configure ONLY canvas-level properties, never remove event handlers
    switch (selectedTool) {
      case 'draw':
        console.log('Setting up drawing mode...');
        
        // Ensure we have a proper drawing brush
        if (!fabricCanvas.freeDrawingBrush || !(fabricCanvas.freeDrawingBrush instanceof PencilBrush)) {
          console.log('Creating new PencilBrush for drawing');
          const brush = new PencilBrush(fabricCanvas);
          brush.color = '#00FF00'; // Bright green for visibility
          brush.width = 5;
          fabricCanvas.freeDrawingBrush = brush;
        } else {
          // Update existing brush properties
          fabricCanvas.freeDrawingBrush.color = '#00FF00';
          fabricCanvas.freeDrawingBrush.width = 5;
        }
        
        // Enable drawing mode
        fabricCanvas.isDrawingMode = true;
        fabricCanvas.selection = false;
        fabricCanvas.hoverCursor = 'crosshair';
        fabricCanvas.moveCursor = 'crosshair';
        
        // Additional drawing mode configurations
        fabricCanvas.skipTargetFind = true; // Prevent object selection during drawing
        fabricCanvas.selection = false; // Disable selection
        
        console.log('Drawing mode enabled:', {
          isDrawingMode: fabricCanvas.isDrawingMode,
          brush: fabricCanvas.freeDrawingBrush,
          brushColor: fabricCanvas.freeDrawingBrush?.color,
          brushWidth: fabricCanvas.freeDrawingBrush?.width,
          selection: fabricCanvas.selection,
          skipTargetFind: fabricCanvas.skipTargetFind
        });
        break;
        
      case 'select':
        fabricCanvas.isDrawingMode = false;
        fabricCanvas.selection = true;
        fabricCanvas.skipTargetFind = false;
        fabricCanvas.hoverCursor = 'move';
        fabricCanvas.moveCursor = 'move';
        console.log('Select mode enabled');
        break;
        
      case 'hand':
        fabricCanvas.isDrawingMode = false;
        fabricCanvas.selection = false; // Disable selection for pure panning
        fabricCanvas.skipTargetFind = true; // Prevent object targeting during panning
        fabricCanvas.hoverCursor = 'grab';
        fabricCanvas.moveCursor = 'grab';
        fabricCanvas.defaultCursor = 'grab';
        console.log('Hand mode enabled:', {
          selection: fabricCanvas.selection,
          skipTargetFind: fabricCanvas.skipTargetFind,
          hoverCursor: fabricCanvas.hoverCursor,
          moveCursor: fabricCanvas.moveCursor
        });
        break;
        
      case 'frame':
        fabricCanvas.isDrawingMode = false;
        fabricCanvas.selection = false; // Disable canvas selection during frame creation
        fabricCanvas.skipTargetFind = true; // Prevent object targeting during frame creation
        fabricCanvas.hoverCursor = 'crosshair';
        fabricCanvas.moveCursor = 'crosshair';
        console.log('Frame mode enabled - only frame creation allowed');
        break;
        
      case 'text':
        fabricCanvas.isDrawingMode = false;
        fabricCanvas.selection = false;
        fabricCanvas.skipTargetFind = false;
        fabricCanvas.hoverCursor = 'crosshair';
        fabricCanvas.moveCursor = 'crosshair';
        break;
        
      default:
        fabricCanvas.isDrawingMode = false;
        fabricCanvas.selection = true;
        fabricCanvas.skipTargetFind = false;
        fabricCanvas.hoverCursor = 'move';
        fabricCanvas.moveCursor = 'move';
        break;
    }

    fabricCanvas.renderAll();
  }, [selectedTool, fabricCanvas]);
};