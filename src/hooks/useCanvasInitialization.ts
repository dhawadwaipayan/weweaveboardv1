import { useEffect, useState } from 'react';
import { Canvas as FabricCanvas, Pattern } from 'fabric';

export const useCanvasInitialization = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#1E1E1E',
    });

    // Create grid pattern using Fabric.js Pattern
    const createGridPattern = () => {
      const patternCanvas = document.createElement('canvas');
      const patternCtx = patternCanvas.getContext('2d');
      const gridSize = 20;
      
      patternCanvas.width = gridSize;
      patternCanvas.height = gridSize;
      
      if (patternCtx) {
        patternCtx.fillStyle = '#1E1E1E';
        patternCtx.fillRect(0, 0, gridSize, gridSize);
        patternCtx.strokeStyle = '#333333';
        patternCtx.lineWidth = 0.5;
        patternCtx.beginPath();
        patternCtx.moveTo(0, gridSize);
        patternCtx.lineTo(gridSize, gridSize);
        patternCtx.lineTo(gridSize, 0);
        patternCtx.stroke();
      }
      
      return patternCanvas;
    };

    // Set grid background using Fabric.js Pattern
    const gridCanvas = createGridPattern();
    const pattern = new Pattern({
      source: gridCanvas,
      repeat: 'repeat'
    });
    canvas.backgroundColor = pattern;

    // Initialize the freeDrawingBrush properly
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = '#FF0000';
      canvas.freeDrawingBrush.width = 3;
    }

    setFabricCanvas(canvas);

    // Handle window resize
    const handleResize = () => {
      canvas.setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
      canvas.renderAll();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
  }, [canvasRef]);

  return fabricCanvas;
};