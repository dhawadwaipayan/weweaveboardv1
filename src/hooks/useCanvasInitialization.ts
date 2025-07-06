import { useEffect, useState } from 'react';
import Konva from 'konva';

export const useCanvasInitialization = (stageRef: React.RefObject<Konva.Stage>) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!stageRef.current) return;

    console.log('Initializing Konva stage with dimensions:', {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    });

    const stage = stageRef.current;

    // Create grid pattern
    const createGridPattern = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const gridSize = 20;
      
      canvas.width = gridSize;
      canvas.height = gridSize;
      
      if (ctx) {
        ctx.fillStyle = '#1E1E1E';
        ctx.fillRect(0, 0, gridSize, gridSize);
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, gridSize);
        ctx.lineTo(gridSize, gridSize);
        ctx.lineTo(gridSize, 0);
        ctx.stroke();
      }
      
      return canvas;
    };

    // Set up grid background - this will be handled in the Canvas component
    // The grid pattern is already set up in the Canvas component's JSX

    // Enable retina scaling
    Konva.pixelRatio = window.devicePixelRatio || 1;

    console.log('Konva stage initialized:', {
      stage: stage,
      pixelRatio: Konva.pixelRatio,
      stageDimensions: {
        width: stage.width(),
        height: stage.height()
      }
    });

    setIsInitialized(true);

    // Handle window resize
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      console.log('Resizing Konva stage to:', { newWidth, newHeight });
      
      stage.width(newWidth);
      stage.height(newHeight);
      stage.draw();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [stageRef]);

  return isInitialized;
};