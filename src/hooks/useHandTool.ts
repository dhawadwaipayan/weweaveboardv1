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

  useEffect(() => {
    if (!fabricCanvas) return;
    
    // ABSOLUTE GUARD: Never interfere with drawing mode
    if (selectedTool === 'draw') {
      console.log('HandTool: COMPLETELY DISABLED during drawing mode');
      return;
    }
    
    if (selectedTool !== 'hand') return;
    
    console.log('HandTool: Activating hand tool event handlers');

    const handleMouseDown = (opt: any) => {
      const pointer = fabricCanvas.getPointer(opt.e);
      panningRef.current = true;
      lastPanPointRef.current = { x: pointer.x, y: pointer.y };
      setIsPanning(true);
      fabricCanvas.setCursor('grabbing');
    };

    const handleMouseMove = (opt: any) => {
      if (!panningRef.current) return;
      
      const pointer = fabricCanvas.getPointer(opt.e);
      const deltaX = pointer.x - lastPanPointRef.current.x;
      const deltaY = pointer.y - lastPanPointRef.current.y;
      
      // Use relativePan for smoother panning
      fabricCanvas.relativePan(new Point(deltaX, deltaY));
      
      lastPanPointRef.current = { x: pointer.x, y: pointer.y };
    };

    const handleMouseUp = () => {
      if (panningRef.current) {
        panningRef.current = false;
        setIsPanning(false);
        fabricCanvas.setCursor('grab');
      }
    };

    const handleMouseLeave = () => {
      if (panningRef.current) {
        panningRef.current = false;
        setIsPanning(false);
        fabricCanvas.setCursor('grab');
      }
    };

    const handleWheel = (opt: any) => {
      const delta = opt.e.deltaY;
      let zoom = fabricCanvas.getZoom();
      zoom *= 0.999 ** delta;
      
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
    fabricCanvas.on('mouse:out', handleMouseLeave);
    fabricCanvas.on('mouse:wheel', handleWheel);

    return () => {
      fabricCanvas.off('mouse:down', handleMouseDown);
      fabricCanvas.off('mouse:move', handleMouseMove);
      fabricCanvas.off('mouse:up', handleMouseUp);
      fabricCanvas.off('mouse:out', handleMouseLeave);
      fabricCanvas.off('mouse:wheel', handleWheel);
      
      // Reset panning state when cleaning up
      panningRef.current = false;
    };
  }, [fabricCanvas, selectedTool]); // Removed state dependencies to prevent re-renders
};