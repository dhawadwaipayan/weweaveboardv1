import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas as FabricCanvas, Circle, Rect, Point } from 'fabric';

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

export const Canvas: React.FC<CanvasProps> = ({ className = '', selectedTool = 'select' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [isCreatingFrame, setIsCreatingFrame] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  // Initialize Fabric.js canvas
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
  }, []);

  // Handle tool changes and mode switching
  useEffect(() => {
    if (!fabricCanvas) return;

    console.log('Switching to tool:', selectedTool);

    // Clear any existing temporary states
    setIsCreatingFrame(false);
    setIsPanning(false);

    // Remove ALL event handlers to prevent conflicts
    fabricCanvas.off();

    // Reset canvas state
    fabricCanvas.isDrawingMode = false;
    fabricCanvas.selection = true;
    fabricCanvas.hoverCursor = 'move';
    fabricCanvas.moveCursor = 'move';

    // Configure canvas based on selected tool
    switch (selectedTool) {
      case 'draw':
        console.log('Activating drawing mode - ISOLATING ALL OTHER FEATURES');
        fabricCanvas.isDrawingMode = true;
        fabricCanvas.selection = false;
        fabricCanvas.hoverCursor = 'crosshair';
        fabricCanvas.moveCursor = 'crosshair';
        
        // Disable ALL object interactions during drawing
        fabricCanvas.forEachObject((obj) => {
          obj.selectable = false;
          obj.evented = false;
        });
        
        // Ensure brush is properly configured
        if (fabricCanvas.freeDrawingBrush) {
          fabricCanvas.freeDrawingBrush.color = '#FF0000';
          fabricCanvas.freeDrawingBrush.width = 3;
        }
        break;
        
      case 'select':
        console.log('Activating select mode');
        fabricCanvas.selection = true;
        fabricCanvas.hoverCursor = 'move';
        fabricCanvas.moveCursor = 'move';
        
        // Re-enable object interactions
        fabricCanvas.forEachObject((obj) => {
          obj.selectable = true;
          obj.evented = true;
        });
        break;
        
      case 'hand':
        console.log('Activating hand mode');
        fabricCanvas.selection = false;
        fabricCanvas.hoverCursor = 'grab';
        fabricCanvas.moveCursor = 'grab';
        
        // Disable object selection but keep events for panning
        fabricCanvas.forEachObject((obj) => {
          obj.selectable = false;
          obj.evented = false;
        });
        break;
        
      case 'frame':
        console.log('Activating frame mode');
        fabricCanvas.selection = false;
        fabricCanvas.hoverCursor = 'crosshair';
        fabricCanvas.moveCursor = 'crosshair';
        
        // Disable object selection for frame creation
        fabricCanvas.forEachObject((obj) => {
          obj.selectable = false;
          obj.evented = false;
        });
        break;
        
      case 'text':
        console.log('Activating text mode');
        fabricCanvas.selection = false;
        fabricCanvas.hoverCursor = 'text';
        fabricCanvas.moveCursor = 'text';
        
        // Disable object selection for text creation
        fabricCanvas.forEachObject((obj) => {
          obj.selectable = false;
          obj.evented = false;
        });
        break;
        
      default:
        fabricCanvas.selection = true;
        // Re-enable object interactions for default mode
        fabricCanvas.forEachObject((obj) => {
          obj.selectable = true;
          obj.evented = true;
        });
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

  // Handle object movement and frame children (only for select mode)
  useEffect(() => {
    if (!fabricCanvas || selectedTool !== 'select') return;

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
  }, [fabricCanvas, selectedTool]);

  // Add delete key functionality
  useEffect(() => {
    if (!fabricCanvas) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeObjects = fabricCanvas.getActiveObjects();
        if (activeObjects.length > 0) {
          activeObjects.forEach(obj => {
            fabricCanvas.remove(obj);
          });
          fabricCanvas.discardActiveObject();
          fabricCanvas.renderAll();
          console.log('Deleted selected objects');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [fabricCanvas]);

  // Handle pan functionality for hand tool
  useEffect(() => {
    if (!fabricCanvas || selectedTool !== 'hand') return;

    const handleMouseDown = (opt: any) => {
      setIsPanning(true);
      const pointer = fabricCanvas.getPointer(opt.e);
      setLastPanPoint({ x: pointer.x, y: pointer.y });
      fabricCanvas.setCursor('grabbing');
    };

    const handleMouseMove = (opt: any) => {
      if (!isPanning) return;
      
      const pointer = fabricCanvas.getPointer(opt.e);
      const deltaX = pointer.x - lastPanPoint.x;
      const deltaY = pointer.y - lastPanPoint.y;
      
      const currentTransform = fabricCanvas.viewportTransform;
      if (currentTransform) {
        currentTransform[4] += deltaX;
        currentTransform[5] += deltaY;
        fabricCanvas.requestRenderAll();
      }
      
      setLastPanPoint({ x: pointer.x, y: pointer.y });
    };

    const handleMouseUp = () => {
      setIsPanning(false);
      fabricCanvas.setCursor('grab');
    };

    const handleWheel = (opt: any) => {
      const delta = opt.e.deltaY;
      let zoom = fabricCanvas.getZoom();
      zoom *= 0.999 ** delta;
      
      // Set zoom limits
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      
      const pointer = fabricCanvas.getPointer(opt.e);
      fabricCanvas.zoomToPoint(new Point(pointer.x, pointer.y), zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    };

    fabricCanvas.on('mouse:down', handleMouseDown);
    fabricCanvas.on('mouse:move', handleMouseMove);
    fabricCanvas.on('mouse:up', handleMouseUp);
    fabricCanvas.on('mouse:wheel', handleWheel);

    return () => {
      fabricCanvas.off('mouse:down', handleMouseDown);
      fabricCanvas.off('mouse:move', handleMouseMove);
      fabricCanvas.off('mouse:up', handleMouseUp);
      fabricCanvas.off('mouse:wheel', handleWheel);
    };
  }, [fabricCanvas, selectedTool, isPanning, lastPanPoint]);

  // Main mouse event handler for frame tool only
  useEffect(() => {
    if (!fabricCanvas || selectedTool !== 'frame') return;

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
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
      />
      
      {/* Tool indicator */}
      {selectedTool && (
        <div className="absolute bottom-4 right-4 z-20 bg-[rgba(0,0,0,0.8)] text-[#E1FF00] text-xs px-3 py-2 rounded-md pointer-events-none border border-[rgba(255,255,255,0.1)]">
          {selectedTool === 'draw' && 'Drawing mode active'}
          {selectedTool === 'frame' && 'Frame creation mode'}
          {selectedTool === 'select' && 'Select/Move mode'}
          {selectedTool === 'hand' && 'Pan & Zoom mode - Drag to pan, wheel to zoom'}
          {selectedTool === 'shape' && 'Shape mode'}
          {selectedTool === 'text' && 'Text mode'}
        </div>
      )}
    </div>
  );
};
