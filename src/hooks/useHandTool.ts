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
  const isPanningRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!fabricCanvas) return;
    
    // Only activate for hand tool
    if (selectedTool !== 'hand') {
      // Clean up any existing panning state
      if (isPanningRef.current) {
        isPanningRef.current = false;
        setIsPanning(false);
        fabricCanvas.setCursor('default');
      }
      return;
    }

    console.log('HandTool: Setting up hand tool');

    const handleMouseDown = (e: any) => {
      // Don't start panning if an object is selected
      if (fabricCanvas.getActiveObject()) {
        return;
      }

      const pointer = fabricCanvas.getPointer(e.e);
      isPanningRef.current = true;
      lastPointRef.current = { x: pointer.x, y: pointer.y };
      setIsPanning(true);
      fabricCanvas.setCursor('grabbing');
      
      // Prevent default to avoid conflicts
      e.e.preventDefault();
      e.e.stopPropagation();
    };

    const handleMouseMove = (e: any) => {
      if (!isPanningRef.current) return;

      const pointer = fabricCanvas.getPointer(e.e);
      const deltaX = pointer.x - lastPointRef.current.x;
      const deltaY = pointer.y - lastPointRef.current.y;

      // Use Fabric.js built-in panning method
      fabricCanvas.relativePan(new Point(deltaX, deltaY));
      
      lastPointRef.current = { x: pointer.x, y: pointer.y };
      
      // Prevent default
      e.e.preventDefault();
      e.e.stopPropagation();
    };

    const handleMouseUp = () => {
      if (isPanningRef.current) {
        isPanningRef.current = false;
        setIsPanning(false);
        fabricCanvas.setCursor('grab');
      }
    };

    const handleMouseLeave = () => {
      if (isPanningRef.current) {
        isPanningRef.current = false;
        setIsPanning(false);
        fabricCanvas.setCursor('grab');
      }
    };

    const handleWheel = (e: any) => {
      const delta = e.e.deltaY;
      let zoom = fabricCanvas.getZoom();
      zoom *= 0.999 ** delta;
      
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      
      const pointer = fabricCanvas.getPointer(e.e);
      fabricCanvas.zoomToPoint(new Point(pointer.x, pointer.y), zoom);
      e.e.preventDefault();
      e.e.stopPropagation();
    };

    // Remove any existing handlers first
    fabricCanvas.off('mouse:down', handleMouseDown);
    fabricCanvas.off('mouse:move', handleMouseMove);
    fabricCanvas.off('mouse:up', handleMouseUp);
    fabricCanvas.off('mouse:out', handleMouseLeave);
    fabricCanvas.off('mouse:wheel', handleWheel);

    // Add new handlers
    fabricCanvas.on('mouse:down', handleMouseDown);
    fabricCanvas.on('mouse:move', handleMouseMove);
    fabricCanvas.on('mouse:up', handleMouseUp);
    fabricCanvas.on('mouse:out', handleMouseLeave);
    fabricCanvas.on('mouse:wheel', handleWheel);

    return () => {
      // Clean up handlers
      fabricCanvas.off('mouse:down', handleMouseDown);
      fabricCanvas.off('mouse:move', handleMouseMove);
      fabricCanvas.off('mouse:up', handleMouseUp);
      fabricCanvas.off('mouse:out', handleMouseLeave);
      fabricCanvas.off('mouse:wheel', handleWheel);
      
      // Reset state
      isPanningRef.current = false;
      setIsPanning(false);
    };
  }, [fabricCanvas, selectedTool, setIsPanning]);
};