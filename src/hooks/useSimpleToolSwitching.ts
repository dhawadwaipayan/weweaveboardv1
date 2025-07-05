import { useEffect } from 'react';
import { Canvas as FabricCanvas } from 'fabric';

export const useSimpleToolSwitching = (
  fabricCanvas: FabricCanvas | null,
  selectedTool: string
) => {
  useEffect(() => {
    if (!fabricCanvas) return;

    console.log('Simple tool switch to:', selectedTool);

    // Configure canvas properties and handle background switching
    switch (selectedTool) {
      case 'draw':
        fabricCanvas.isDrawingMode = true;
        fabricCanvas.selection = false;
        fabricCanvas.hoverCursor = 'crosshair';
        fabricCanvas.moveCursor = 'crosshair';
        
        // Switch to solid background during drawing for better performance
        fabricCanvas.backgroundColor = '#f8f8f8';
        
        // Configure brush with high contrast
        if (fabricCanvas.freeDrawingBrush) {
          fabricCanvas.freeDrawingBrush.color = '#000000'; // Black brush like reference
          fabricCanvas.freeDrawingBrush.width = 3;
          console.log('Brush configured: color=black, width=3');
        }
        
        // Add drawing event debugging
        fabricCanvas.on('mouse:down', (e) => console.log('Drawing mouse:down', e));
        fabricCanvas.on('mouse:move', (e) => console.log('Drawing mouse:move (drawing)', fabricCanvas.isDrawingMode));
        fabricCanvas.on('mouse:up', (e) => console.log('Drawing mouse:up', e));
        fabricCanvas.on('path:created', (e) => console.log('Path created successfully:', e.path));
        
        console.log('Drawing mode enabled, background simplified, debugging added');
        break;
        
      case 'select':
        fabricCanvas.isDrawingMode = false;
        fabricCanvas.selection = true;
        fabricCanvas.hoverCursor = 'move';
        fabricCanvas.moveCursor = 'move';
        
        // Restore grid background when leaving drawing mode
        fabricCanvas.backgroundColor = '#1E1E1E';
        
        // Remove drawing event listeners to prevent conflicts
        fabricCanvas.off('mouse:down');
        fabricCanvas.off('mouse:move');
        fabricCanvas.off('mouse:up');
        fabricCanvas.off('path:created');
        break;
        
      case 'hand':
        fabricCanvas.isDrawingMode = false;
        fabricCanvas.selection = false;
        fabricCanvas.hoverCursor = 'grab';
        fabricCanvas.moveCursor = 'grab';
        
        // Remove drawing event listeners
        fabricCanvas.off('mouse:down');
        fabricCanvas.off('mouse:move');
        fabricCanvas.off('mouse:up');
        fabricCanvas.off('path:created');
        break;
        
      case 'frame':
      case 'text':
        fabricCanvas.isDrawingMode = false;
        fabricCanvas.selection = false;
        fabricCanvas.hoverCursor = 'crosshair';
        fabricCanvas.moveCursor = 'crosshair';
        
        // Remove drawing event listeners
        fabricCanvas.off('mouse:down');
        fabricCanvas.off('mouse:move');
        fabricCanvas.off('mouse:up');
        fabricCanvas.off('path:created');
        break;
        
      default:
        fabricCanvas.isDrawingMode = false;
        fabricCanvas.selection = true;
        fabricCanvas.hoverCursor = 'move';
        fabricCanvas.moveCursor = 'move';
        
        // Remove drawing event listeners
        fabricCanvas.off('mouse:down');
        fabricCanvas.off('mouse:move');
        fabricCanvas.off('mouse:up');
        fabricCanvas.off('path:created');
        break;
    }

    fabricCanvas.renderAll();
  }, [selectedTool, fabricCanvas]);
};