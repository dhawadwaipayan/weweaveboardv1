import { useEffect, useRef } from 'react';
import { Canvas as FabricCanvas, Point } from 'fabric';

interface UseHandToolProps {
  fabricCanvas: FabricCanvas | null;
  selectedTool: string;
  isPanning: boolean;
  setIsPanning: (value: boolean) => void;
  lastPanPoint: { x: number; y: number };
  setLastPanPoint: (point: { x: number; y: number }) => void;
}

export const useHandTool = ({
  fabricCanvas,
  selectedTool,
  isPanning,
  setIsPanning,
  lastPanPoint,
  setLastPanPoint
}: UseHandToolProps) => {
  const panningRef = useRef(false);
  const lastPanPointRef = useRef({ x: 0, y: 0 });
  const eventHandlersRef = useRef<{
    handleMouseDown: (opt: any) => void;
    handleMouseMove: (opt: any) => void;
    handleMouseUp: () => void;
    handleMouseLeave: () => void;
    handleWheel: (opt: any) => void;
  } | null>(null);

  useEffect(() => {
    if (!fabricCanvas) return;
    
    // FREEZE: Skip during drawing mode
    if (selectedTool === 'draw') {
      console.log('HandTool: Frozen during drawing mode');
      return;
    }
    
    if (selectedTool !== 'hand') return;

    // Create event handlers only once
    if (!eventHandlersRef.current) {
      eventHandlersRef.current = {
        handleMouseDown: (opt: any) => {
          // Only handle if not already panning and no object is selected
          if (panningRef.current || fabricCanvas.getActiveObject()) return;
          
          const pointer = fabricCanvas.getPointer(opt.e);
          panningRef.current = true;
          lastPanPointRef.current = { x: pointer.x, y: pointer.y };
          setIsPanning(true);
          fabricCanvas.setCursor('grabbing');
          
          // Prevent default behavior
          opt.e.preventDefault();
          opt.e.stopPropagation();
        },

        handleMouseMove: (opt: any) => {
          if (!panningRef.current) return;
          
          const pointer = fabricCanvas.getPointer(opt.e);
          const deltaX = pointer.x - lastPanPointRef.current.x;
          const deltaY = pointer.y - lastPanPointRef.current.y;
          
          // Use absolute panning for smoother movement
          const vpt = fabricCanvas.viewportTransform;
          if (vpt) {
            vpt[4] += deltaX;
            vpt[5] += deltaY;
            fabricCanvas.setViewportTransform(vpt);
            fabricCanvas.requestRenderAll(); // Force immediate render
          }
          
          lastPanPointRef.current = { x: pointer.x, y: pointer.y };
          
          // Prevent default behavior
          opt.e.preventDefault();
          opt.e.stopPropagation();
        },

        handleMouseUp: () => {
          if (panningRef.current) {
            panningRef.current = false;
            setIsPanning(false);
            fabricCanvas.setCursor('grab');
          }
        },

        handleMouseLeave: () => {
          if (panningRef.current) {
            panningRef.current = false;
            setIsPanning(false);
            fabricCanvas.setCursor('grab');
          }
        },

        handleWheel: (opt: any) => {
          const delta = opt.e.deltaY;
          let zoom = fabricCanvas.getZoom();
          zoom *= 0.999 ** delta;
          
          if (zoom > 20) zoom = 20;
          if (zoom < 0.01) zoom = 0.01;
          
          const pointer = fabricCanvas.getPointer(opt.e);
          fabricCanvas.zoomToPoint(new Point(pointer.x, pointer.y), zoom);
          opt.e.preventDefault();
          opt.e.stopPropagation();
        }
      };
    }

    const handlers = eventHandlersRef.current;

    // Remove any existing handlers first
    fabricCanvas.off('mouse:down', handlers.handleMouseDown);
    fabricCanvas.off('mouse:move', handlers.handleMouseMove);
    fabricCanvas.off('mouse:up', handlers.handleMouseUp);
    fabricCanvas.off('mouse:out', handlers.handleMouseLeave);
    fabricCanvas.off('mouse:wheel', handlers.handleWheel);

    // Add handlers
    fabricCanvas.on('mouse:down', handlers.handleMouseDown);
    fabricCanvas.on('mouse:move', handlers.handleMouseMove);
    fabricCanvas.on('mouse:up', handlers.handleMouseUp);
    fabricCanvas.on('mouse:out', handlers.handleMouseLeave);
    fabricCanvas.on('mouse:wheel', handlers.handleWheel);

    return () => {
      if (eventHandlersRef.current) {
        const handlers = eventHandlersRef.current;
        fabricCanvas.off('mouse:down', handlers.handleMouseDown);
        fabricCanvas.off('mouse:move', handlers.handleMouseMove);
        fabricCanvas.off('mouse:up', handlers.handleMouseUp);
        fabricCanvas.off('mouse:out', handlers.handleMouseLeave);
        fabricCanvas.off('mouse:wheel', handlers.handleWheel);
      }
      
      // Reset panning state when cleaning up
      panningRef.current = false;
      setIsPanning(false);
    };
  }, [fabricCanvas, selectedTool, setIsPanning]);
};