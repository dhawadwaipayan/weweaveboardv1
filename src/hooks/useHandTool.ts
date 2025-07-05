import { useEffect, useRef } from 'react';
import { Canvas as FabricCanvas, Point } from 'fabric';

interface UseHandToolProps {
  fabricCanvas: FabricCanvas | null;
  selectedTool: string;
}

export const useHandTool = ({
  fabricCanvas,
  selectedTool,
}: UseHandToolProps) => {
  const isPanningRef = useRef(false);
  const lastScreenPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (!fabricCanvas) return;
    if (selectedTool !== 'hand') {
      isPanningRef.current = false;
      return;
    }

    const handleMouseDown = (opt: any) => {
      isPanningRef.current = true;
      lastScreenPos.current = { x: opt.e.clientX, y: opt.e.clientY };
      fabricCanvas.setCursor('grabbing');
      opt.e.preventDefault();
    };

    const handleMouseMove = (opt: any) => {
      if (!isPanningRef.current) return;
      const { x, y } = lastScreenPos.current;
      const deltaX = opt.e.clientX - x;
      const deltaY = opt.e.clientY - y;
      fabricCanvas.relativePan(new Point(deltaX, deltaY));
      lastScreenPos.current = { x: opt.e.clientX, y: opt.e.clientY };
      opt.e.preventDefault();
    };

    const handleMouseUp = () => {
      isPanningRef.current = false;
      fabricCanvas.setCursor('grab');
    };

    fabricCanvas.on('mouse:down', handleMouseDown);
    fabricCanvas.on('mouse:move', handleMouseMove);
    fabricCanvas.on('mouse:up', handleMouseUp);
    fabricCanvas.on('mouse:out', handleMouseUp);

    return () => {
      fabricCanvas.off('mouse:down', handleMouseDown);
      fabricCanvas.off('mouse:move', handleMouseMove);
      fabricCanvas.off('mouse:up', handleMouseUp);
      fabricCanvas.off('mouse:out', handleMouseUp);
    };
  }, [fabricCanvas, selectedTool]);
};