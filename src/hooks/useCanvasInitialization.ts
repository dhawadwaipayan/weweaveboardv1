import { useEffect, useState } from 'react';
import { Canvas as FabricCanvas, Pattern } from 'fabric';

export const useCanvasInitialization = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#f8f8f8', // Simple background by default
    });

    // Reset viewport and coordinates to clean state
    canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
    canvas.setZoom(1);

    // Initialize brush immediately
    canvas.freeDrawingBrush.color = '#000000';
    canvas.freeDrawingBrush.width = 3;
    
    console.log('Canvas initialized with clean state');

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