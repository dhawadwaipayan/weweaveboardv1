import { useEffect } from 'react';
import { Canvas as FabricCanvas } from 'fabric';

export const useSimpleToolSwitching = (
  fabricCanvas: FabricCanvas | null,
  selectedTool: string
) => {
  useEffect(() => {
    if (!fabricCanvas) return;

    console.log('Simple tool switch to:', selectedTool);

    // COMPLETE RESET OF ALL EVENT HANDLERS FIRST
    fabricCanvas.off(); // Remove ALL existing event handlers
    
    // Reset canvas state completely
    fabricCanvas.selection = false;
    fabricCanvas.isDrawingMode = false;
    
    // Configure canvas properties based on tool
    switch (selectedTool) {
      case 'draw':
        // Clean coordinate system reset
        fabricCanvas.viewportTransform = [1, 0, 0, 1, 0, 0];
        fabricCanvas.setZoom(1);
        
        // Enable drawing mode FIRST
        fabricCanvas.isDrawingMode = true;
        fabricCanvas.selection = false;
        fabricCanvas.hoverCursor = 'crosshair';
        fabricCanvas.moveCursor = 'crosshair';
        
        // Simple background for drawing
        fabricCanvas.backgroundColor = '#f8f8f8';
        
        // Configure brush IMMEDIATELY after drawing mode enabled
        fabricCanvas.freeDrawingBrush.color = '#000000';
        fabricCanvas.freeDrawingBrush.width = 3;
        
        // Add ONLY drawing event debugging
        fabricCanvas.on('mouse:down', (e) => {
          console.log('DRAWING mouse:down at:', e.pointer);
          console.log('Drawing mode active:', fabricCanvas.isDrawingMode);
          console.log('Brush exists:', !!fabricCanvas.freeDrawingBrush);
        });
        
        fabricCanvas.on('path:created', (e) => {
          console.log('Path created successfully:', e.path);
          console.log('Path object:', e.path);
        });
        
        console.log('DRAWING MODE FULLY CONFIGURED - brush ready');
        break;
        
      case 'select':
        fabricCanvas.isDrawingMode = false;
        fabricCanvas.selection = true;
        fabricCanvas.hoverCursor = 'move';
        fabricCanvas.moveCursor = 'move';
        fabricCanvas.backgroundColor = '#1E1E1E';
        console.log('SELECT MODE - drawing disabled');
        break;
        
      case 'hand':
        fabricCanvas.isDrawingMode = false;
        fabricCanvas.selection = false;
        fabricCanvas.hoverCursor = 'grab';
        fabricCanvas.moveCursor = 'grab';
        fabricCanvas.backgroundColor = '#1E1E1E';
        console.log('HAND MODE - drawing disabled');
        break;
        
      case 'frame':
      case 'text':
        fabricCanvas.isDrawingMode = false;
        fabricCanvas.selection = false;
        fabricCanvas.hoverCursor = 'crosshair';
        fabricCanvas.moveCursor = 'crosshair';
        fabricCanvas.backgroundColor = '#1E1E1E';
        console.log('FRAME/TEXT MODE - drawing disabled');
        break;
        
      default:
        fabricCanvas.isDrawingMode = false;
        fabricCanvas.selection = true;
        fabricCanvas.hoverCursor = 'move';
        fabricCanvas.moveCursor = 'move';
        fabricCanvas.backgroundColor = '#1E1E1E';
        console.log('DEFAULT MODE - drawing disabled');
        break;
    }

    fabricCanvas.renderAll();
  }, [selectedTool, fabricCanvas]);
};