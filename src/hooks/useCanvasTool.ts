import { useEffect, useRef } from 'react';
import { Canvas as FabricCanvas, Point } from 'fabric';

export const useCanvasTool = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  selectedTool: string
) => {
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const panningRef = useRef(false);
  const lastPanPointRef = useRef({ x: 0, y: 0 });

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#1E1E1E',
    });

    // Initialize brush with visible settings
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = '#FFFFFF'; // White for visibility
      canvas.freeDrawingBrush.width = 5; // Thicker for visibility
    }

    fabricCanvasRef.current = canvas;

    // Handle resize
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

  // Handle tool switching and events
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    console.log('Tool switched to:', selectedTool);

    // Clear all event handlers first
    canvas.off('mouse:down');
    canvas.off('mouse:move');
    canvas.off('mouse:up');
    canvas.off('mouse:out');
    canvas.off('mouse:wheel');

    // Reset canvas properties
    canvas.isDrawingMode = false;
    canvas.selection = true;
    canvas.hoverCursor = 'move';
    canvas.moveCursor = 'move';

    switch (selectedTool) {
      case 'draw':
        console.log('Enabling drawing mode');
        canvas.isDrawingMode = true;
        canvas.selection = false;
        canvas.hoverCursor = 'crosshair';
        canvas.moveCursor = 'crosshair';
        
        // Ensure brush is properly configured
        if (canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush.color = '#FFFFFF';
          canvas.freeDrawingBrush.width = 5;
          console.log('Brush configured:', canvas.freeDrawingBrush.color, canvas.freeDrawingBrush.width);
        }

        // Add path creation handler
        const handlePathCreated = (e: any) => {
          const path = e.path;
          if (path) {
            path.set({
              selectable: true,
              evented: true,
            });
            console.log('Path created and made selectable:', path);
          }
        };
        canvas.on('path:created', handlePathCreated);
        break;

      case 'hand':
        canvas.selection = false;
        canvas.hoverCursor = 'grab';
        canvas.moveCursor = 'grab';

        // Pan handlers
        const handleMouseDown = (opt: any) => {
          const pointer = canvas.getPointer(opt.e);
          panningRef.current = true;
          lastPanPointRef.current = { x: pointer.x, y: pointer.y };
          canvas.setCursor('grabbing');
        };

        const handleMouseMove = (opt: any) => {
          if (!panningRef.current) return;
          
          const pointer = canvas.getPointer(opt.e);
          const deltaX = pointer.x - lastPanPointRef.current.x;
          const deltaY = pointer.y - lastPanPointRef.current.y;
          
          canvas.relativePan(new Point(deltaX, deltaY));
          lastPanPointRef.current = { x: pointer.x, y: pointer.y };
        };

        const handleMouseUp = () => {
          if (panningRef.current) {
            panningRef.current = false;
            canvas.setCursor('grab');
          }
        };

        const handleWheel = (opt: any) => {
          const delta = opt.e.deltaY;
          let zoom = canvas.getZoom();
          zoom = zoom + delta / 1000;
          
          if (zoom > 3) zoom = 3;
          if (zoom < 0.1) zoom = 0.1;
          
          const pointer = canvas.getPointer(opt.e);
          canvas.zoomToPoint(new Point(pointer.x, pointer.y), zoom);
          opt.e.preventDefault();
          opt.e.stopPropagation();
        };

        canvas.on('mouse:down', handleMouseDown);
        canvas.on('mouse:move', handleMouseMove);
        canvas.on('mouse:up', handleMouseUp);
        canvas.on('mouse:out', handleMouseUp);
        canvas.on('mouse:wheel', handleWheel);
        break;

      case 'text':
      case 'frame':
        canvas.selection = false;
        canvas.hoverCursor = 'crosshair';
        canvas.moveCursor = 'crosshair';
        break;

      default: // select
        canvas.selection = true;
        canvas.hoverCursor = 'move';
        canvas.moveCursor = 'move';
        break;
    }

    canvas.renderAll();

    return () => {
      // Cleanup specific to current tool
      canvas.off('path:created');
      canvas.off('mouse:down');
      canvas.off('mouse:move');
      canvas.off('mouse:up');
      canvas.off('mouse:out');
      canvas.off('mouse:wheel');
    };
  }, [selectedTool]);

  return fabricCanvasRef.current;
};