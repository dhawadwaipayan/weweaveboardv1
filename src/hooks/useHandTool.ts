import { useEffect, useRef } from 'react';
import Konva from 'konva';

interface UseHandToolProps {
  stageRef: React.RefObject<Konva.Stage>;
  selectedTool: string;
}

export const useHandTool = ({
  stageRef,
  selectedTool,
}: UseHandToolProps) => {
  const isPanningRef = useRef(false);
  const lastScreenPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (!stageRef.current) return;
    if (selectedTool !== 'hand') {
      isPanningRef.current = false;
      return;
    }

    const stage = stageRef.current;

    const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
      isPanningRef.current = true;
      lastScreenPos.current = { x: e.evt.clientX, y: e.evt.clientY };
      stage.container().style.cursor = 'grabbing';
      e.evt.preventDefault();
    };

    const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!isPanningRef.current) return;
      const { x, y } = lastScreenPos.current;
      const deltaX = e.evt.clientX - x;
      const deltaY = e.evt.clientY - y;
      
      const newPos = {
        x: stage.x() + deltaX,
        y: stage.y() + deltaY
      };
      
      stage.position(newPos);
      lastScreenPos.current = { x: e.evt.clientX, y: e.evt.clientY };
      e.evt.preventDefault();
    };

    const handleMouseUp = () => {
      isPanningRef.current = false;
      stage.container().style.cursor = 'grab';
    };

    // Handle zoom with mouse wheel
    const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();

      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      const direction = e.evt.deltaY > 0 ? -1 : 1;
      const scaleBy = 1.1;
      const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

      stage.scale({ x: newScale, y: newScale });

      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };
      stage.position(newPos);
    };

    stage.on('mousedown', handleMouseDown);
    stage.on('mousemove', handleMouseMove);
    stage.on('mouseup', handleMouseUp);
    stage.on('mouseleave', handleMouseUp);
    stage.on('wheel', handleWheel);

    return () => {
      stage.off('mousedown', handleMouseDown);
      stage.off('mousemove', handleMouseMove);
      stage.off('mouseup', handleMouseUp);
      stage.off('mouseleave', handleMouseUp);
      stage.off('wheel', handleWheel);
    };
  }, [stageRef, selectedTool]);
};