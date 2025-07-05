import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas as FabricCanvas, Circle, Rect } from 'fabric';

interface CanvasProps {
  className?: string;
  selectedTool?: string;
}

interface Frame {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const Canvas: React.FC<CanvasProps> = ({ className = '', selectedTool = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [frames, setFrames] = useState<Frame[]>([]);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 'rgba(33, 33, 33, 1)',
    });

    // Initialize the freeDrawingBrush
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = '#E1FF00';
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
  }, []);

  // Handle tool changes
  useEffect(() => {
    if (!fabricCanvas) return;

    // Reset all modes
    fabricCanvas.isDrawingMode = false;
    fabricCanvas.selection = true;
    fabricCanvas.hoverCursor = 'move';
    fabricCanvas.moveCursor = 'move';

    switch (selectedTool) {
      case 'draw':
        fabricCanvas.isDrawingMode = true;
        fabricCanvas.hoverCursor = 'crosshair';
        fabricCanvas.moveCursor = 'crosshair';
        if (fabricCanvas.freeDrawingBrush) {
          fabricCanvas.freeDrawingBrush.color = '#E1FF00';
          fabricCanvas.freeDrawingBrush.width = 3;
        }
        break;
      case 'move':
        fabricCanvas.selection = true;
        fabricCanvas.hoverCursor = 'move';
        fabricCanvas.moveCursor = 'move';
        break;
      case 'frame':
        fabricCanvas.hoverCursor = 'crosshair';
        fabricCanvas.moveCursor = 'crosshair';
        break;
      default:
        break;
    }
  }, [selectedTool, fabricCanvas]);

  // Handle frame creation
  const handleCanvasMouseDown = useCallback((opt: any) => {
    if (selectedTool !== 'frame' || !fabricCanvas) return;

    const pointer = fabricCanvas.getPointer(opt.e);
    const startX = pointer.x;
    const startY = pointer.y;

    // Create a temporary frame rectangle
    const frame = new Rect({
      left: startX,
      top: startY,
      width: 0,
      height: 0,
      fill: 'transparent',
      stroke: '#E1FF00',
      strokeWidth: 2,
      strokeDashArray: [10, 5],
      selectable: true,
      evented: true,
    });

    fabricCanvas.add(frame);
    fabricCanvas.setActiveObject(frame);

    let isDrawing = true;

    const onMouseMove = (opt: any) => {
      if (!isDrawing) return;
      const pointer = fabricCanvas.getPointer(opt.e);
      
      const width = Math.abs(pointer.x - startX);
      const height = Math.abs(pointer.y - startY);
      const left = Math.min(startX, pointer.x);
      const top = Math.min(startY, pointer.y);

      frame.set({
        left: left,
        top: top,
        width: width,
        height: height,
      });
      
      fabricCanvas.renderAll();
    };

    const onMouseUp = () => {
      isDrawing = false;
      fabricCanvas.off('mouse:move', onMouseMove);
      fabricCanvas.off('mouse:up', onMouseUp);
      
      // Add frame to frames state
      const newFrame: Frame = {
        id: Date.now().toString(),
        x: frame.left || 0,
        y: frame.top || 0,
        width: frame.width || 0,
        height: frame.height || 0,
      };
      
      if (newFrame.width > 10 && newFrame.height > 10) {
        setFrames(prev => [...prev, newFrame]);
      } else {
        fabricCanvas.remove(frame);
      }
    };

    fabricCanvas.on('mouse:move', onMouseMove);
    fabricCanvas.on('mouse:up', onMouseUp);
  }, [selectedTool, fabricCanvas]);

  // Add canvas event listeners
  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.on('mouse:down', handleCanvasMouseDown);

    return () => {
      fabricCanvas.off('mouse:down', handleCanvasMouseDown);
    };
  }, [fabricCanvas, handleCanvasMouseDown]);

  return (
    <div className={`fixed inset-0 z-0 overflow-hidden ${className}`}>
      {/* Grid background */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: `20px 20px`,
          backgroundColor: 'rgba(33, 33, 33, 1)',
        }}
      />
      
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
      />
      
      {/* Tool indicator */}
      {selectedTool && (
        <div className="absolute bottom-4 right-4 z-20 bg-[rgba(0,0,0,0.8)] text-[#E1FF00] text-xs px-3 py-2 rounded-md pointer-events-none border border-[rgba(255,255,255,0.1)]">
          {selectedTool === 'draw' && 'Drawing mode active'}
          {selectedTool === 'frame' && 'Frame creation mode'}
          {selectedTool === 'move' && 'Move/Select mode'}
          {selectedTool === 'shape' && 'Shape mode'}
          {selectedTool === 'text' && 'Text mode'}
        </div>
      )}
    </div>
  );
};
