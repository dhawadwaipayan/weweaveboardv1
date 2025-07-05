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

export const Canvas: React.FC<CanvasProps> = ({ className = '', selectedTool = 'move' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [isCreatingFrame, setIsCreatingFrame] = useState(false);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 'transparent',
    });

    // Initialize the freeDrawingBrush properly
    canvas.freeDrawingBrush.color = '#E1FF00';
    canvas.freeDrawingBrush.width = 3;

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

  // Handle tool changes and mode switching
  useEffect(() => {
    if (!fabricCanvas) return;

    console.log('Switching to tool:', selectedTool);

    // Clear any existing temporary states
    setIsCreatingFrame(false);

    // Reset canvas state
    fabricCanvas.isDrawingMode = false;
    fabricCanvas.selection = true;
    fabricCanvas.hoverCursor = 'move';
    fabricCanvas.moveCursor = 'move';

    // Configure canvas based on selected tool
    switch (selectedTool) {
      case 'draw':
        console.log('Activating drawing mode');
        fabricCanvas.isDrawingMode = true;
        fabricCanvas.selection = false;
        fabricCanvas.hoverCursor = 'crosshair';
        fabricCanvas.moveCursor = 'crosshair';
        // Ensure brush is properly configured
        fabricCanvas.freeDrawingBrush.color = '#E1FF00';
        fabricCanvas.freeDrawingBrush.width = 3;
        break;
      case 'move':
        console.log('Activating move mode');
        fabricCanvas.selection = true;
        fabricCanvas.hoverCursor = 'move';
        fabricCanvas.moveCursor = 'move';
        break;
      case 'frame':
        console.log('Activating frame mode');
        fabricCanvas.selection = false;
        fabricCanvas.hoverCursor = 'crosshair';
        fabricCanvas.moveCursor = 'crosshair';
        break;
      default:
        fabricCanvas.selection = true;
        break;
    }

    fabricCanvas.renderAll();
  }, [selectedTool, fabricCanvas]);

  // Handle frame creation
  const handleFrameCreation = useCallback((opt: any) => {
    if (selectedTool !== 'frame' || !fabricCanvas || isCreatingFrame) return;

    console.log('Starting frame creation');
    setIsCreatingFrame(true);

    const pointer = fabricCanvas.getPointer(opt.e);
    const startX = pointer.x;
    const startY = pointer.y;

    // Create frame rectangle
    const frame = new Rect({
      left: startX,
      top: startY,
      width: 0,
      height: 0,
      fill: '#1A1A1A',
      stroke: '',
      strokeWidth: 0,
      selectable: true,
      evented: true,
      name: 'frame',
    });

    fabricCanvas.add(frame);
    let isDrawing = true;

    const onMouseMove = (opt: any) => {
      if (!isDrawing) return;
      const pointer = fabricCanvas.getPointer(opt.e);
      
      const width = Math.abs(pointer.x - startX);
      const height = Math.abs(pointer.y - startY);
      const left = Math.min(startX, pointer.x);
      const top = Math.min(startY, pointer.y);

      frame.set({ left, top, width, height });
      fabricCanvas.renderAll();
    };

    const onMouseUp = () => {
      isDrawing = false;
      setIsCreatingFrame(false);
      
      // Clean up event listeners
      fabricCanvas.off('mouse:move', onMouseMove);
      fabricCanvas.off('mouse:up', onMouseUp);
      
      // Check if frame is large enough
      if ((frame.width || 0) > 10 && (frame.height || 0) > 10) {
        console.log('Frame created successfully');
        const newFrame: Frame = {
          id: Date.now().toString(),
          x: frame.left || 0,
          y: frame.top || 0,
          width: frame.width || 0,
          height: frame.height || 0,
        };
        setFrames(prev => [...prev, newFrame]);
        
        // Make frame selectable
        fabricCanvas.setActiveObject(frame);
      } else {
        console.log('Frame too small, removing');
        fabricCanvas.remove(frame);
      }
      
      fabricCanvas.renderAll();
    };

    fabricCanvas.on('mouse:move', onMouseMove);
    fabricCanvas.on('mouse:up', onMouseUp);
  }, [selectedTool, fabricCanvas, isCreatingFrame]);

  // Handle object movement and frame children
  useEffect(() => {
    if (!fabricCanvas) return;

    const handleObjectMoving = (e: any) => {
      const obj = e.target;
      if (!obj || obj.name !== 'frame') return;

      // Simple frame movement - no complex grouping for now
      fabricCanvas.renderAll();
    };

    const handleObjectSelected = (e: any) => {
      const obj = e.target;
      if (obj && obj.name === 'frame') {
        console.log('Frame selected');
      }
    };

    fabricCanvas.on('object:moving', handleObjectMoving);
    fabricCanvas.on('selection:created', handleObjectSelected);
    fabricCanvas.on('selection:updated', handleObjectSelected);

    return () => {
      fabricCanvas.off('object:moving', handleObjectMoving);
      fabricCanvas.off('selection:created', handleObjectSelected);
      fabricCanvas.off('selection:updated', handleObjectSelected);
    };
  }, [fabricCanvas]);

  // Main mouse event handler
  useEffect(() => {
    if (!fabricCanvas) return;

    const handleMouseDown = (opt: any) => {
      if (selectedTool === 'frame') {
        handleFrameCreation(opt);
      }
    };

    fabricCanvas.on('mouse:down', handleMouseDown);

    return () => {
      fabricCanvas.off('mouse:down', handleMouseDown);
    };
  }, [fabricCanvas, selectedTool, handleFrameCreation]);

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
