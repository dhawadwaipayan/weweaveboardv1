import { useEffect } from 'react';
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
  useEffect(() => {
    if (!fabricCanvas || selectedTool !== 'hand') return;

    const handleMouseDown = (opt: any) => {
      const pointer = fabricCanvas.getPointer(opt.e);
      setIsPanning(true);
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
      if (isPanning) {
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
    fabricCanvas.on('mouse:wheel', handleWheel);

    return () => {
      fabricCanvas.off('mouse:down', handleMouseDown);
      fabricCanvas.off('mouse:move', handleMouseMove);
      fabricCanvas.off('mouse:up', handleMouseUp);
      fabricCanvas.off('mouse:wheel', handleWheel);
    };
  }, [fabricCanvas, selectedTool, isPanning, lastPanPoint, setIsPanning, setLastPanPoint]);
};