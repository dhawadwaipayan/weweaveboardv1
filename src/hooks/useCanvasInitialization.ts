import { useEffect, useState } from 'react';
import { Canvas as FabricCanvas } from 'fabric';

export const useCanvasInitialization = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#1E1E1E',
    });

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