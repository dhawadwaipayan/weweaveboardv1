import { useEffect } from 'react';
import { Canvas as FabricCanvas } from 'fabric';

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
        fabricCanvas.isDrawingMode = true;
        fabricCanvas.selection = false;
        fabricCanvas.hoverCursor = 'crosshair';
        fabricCanvas.moveCursor = 'crosshair';
        
        // Configure brush
        if (fabricCanvas.freeDrawingBrush) {
          fabricCanvas.freeDrawingBrush.color = '#FF0000';
          fabricCanvas.freeDrawingBrush.width = 3;
        }
        break;
        
      case 'select':
        fabricCanvas.isDrawingMode = false;
        fabricCanvas.selection = true;
        fabricCanvas.hoverCursor = 'move';
        fabricCanvas.moveCursor = 'move';
        break;
        
      case 'hand':
        fabricCanvas.isDrawingMode = false;
        fabricCanvas.selection = false;
        fabricCanvas.hoverCursor = 'grab';
        fabricCanvas.moveCursor = 'grab';
        break;
        
      case 'frame':
      case 'text':
        fabricCanvas.isDrawingMode = false;
        fabricCanvas.selection = false;
        fabricCanvas.hoverCursor = 'crosshair';
        fabricCanvas.moveCursor = 'crosshair';
        break;
        
      default:
        fabricCanvas.isDrawingMode = false;
        fabricCanvas.selection = true;
        fabricCanvas.hoverCursor = 'move';
        fabricCanvas.moveCursor = 'move';
        break;
    }

    fabricCanvas.renderAll();
  }, [selectedTool, fabricCanvas]);
};