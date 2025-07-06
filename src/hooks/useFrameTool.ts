import { useEffect } from 'react';
import Konva from 'konva';

interface Frame {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface UseFrameToolProps {
  stageRef: React.RefObject<Konva.Stage>;
  selectedTool: string;
  isCreatingFrame: boolean;
  setIsCreatingFrame: (creating: boolean) => void;
  setFrames: (frames: Frame[] | ((prev: Frame[]) => Frame[])) => void;
}

export const useFrameTool = ({
  stageRef,
  selectedTool,
  isCreatingFrame,
  setIsCreatingFrame,
  setFrames
}: UseFrameToolProps) => {
  useEffect(() => {
    if (!stageRef.current) return;
    
    // FREEZE: Skip during drawing mode
    if (selectedTool === 'draw') {
      console.log('FrameTool: Frozen during drawing mode');
      return;
    }
    
    if (selectedTool !== 'frame') return;

    const stage = stageRef.current;
    const layer = stage.findOne('Layer') as Konva.Layer;

    const handleFrameInteraction = (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (isCreatingFrame) return;
      
      const target = e.target;
      
      // If clicking on an existing frame, do nothing for now
      if (target && target.name() === 'frame-rectangle') {
        return;
      }
      
      // Otherwise, create a new frame
      const pos = stage.getPointerPosition();
      if (!pos || !layer) return;
      
      setIsCreatingFrame(true);

      const startX = pos.x;
      const startY = pos.y;

      // Create a proper rectangle for the frame
      const frameRect = new Konva.Rect({
        x: startX,
        y: startY,
        width: 0,
        height: 0,
        fill: '#EDEDED',   // Frame fill color - light gray
        stroke: undefined, // No border
        strokeWidth: 0,    // No border
        draggable: false,  // Temporary during creation
        selectable: false, // Temporary during creation
        name: 'frame-rectangle',
      });

      layer.add(frameRect);
      
      // Always keep frames at the back
      frameRect.moveToBottom();
      let isDrawing = true;

      const onMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!isDrawing) return;
        const pos = stage.getPointerPosition();
        if (!pos) return;
        
        const width = Math.abs(pos.x - startX);
        const height = Math.abs(pos.y - startY);
        const x = Math.min(startX, pos.x);
        const y = Math.min(startY, pos.y);

        frameRect.setAttrs({ x, y, width, height });
        stage.draw();
      };

      const onMouseUp = () => {
        isDrawing = false;
        setIsCreatingFrame(false);
        
        stage.off('mousemove', onMouseMove);
        stage.off('mouseup', onMouseUp);
        
        if ((frameRect.width() || 0) > 10 && (frameRect.height() || 0) > 10) {
          console.log('Frame created successfully, making selectable');
          
          // Make frame selectable and ensure it stays at the back
          frameRect.setAttrs({ 
            draggable: true, 
            selectable: true,
          });
          
          // Ensure frame stays at the back
          frameRect.moveToBottom();
          
          const newFrame: Frame = {
            id: Date.now().toString(),
            x: frameRect.x(),
            y: frameRect.y(),
            width: frameRect.width(),
            height: frameRect.height(),
          };
          setFrames(prev => [...prev, newFrame]);
        } else {
          console.log('Frame too small, removing');
          frameRect.destroy();
        }
        
        stage.draw();
      };

      stage.on('mousemove', onMouseMove);
      stage.on('mouseup', onMouseUp);
    };

    stage.on('mousedown', handleFrameInteraction);

    return () => {
      stage.off('mousedown', handleFrameInteraction);
    };
  }, [stageRef, selectedTool, isCreatingFrame, setIsCreatingFrame, setFrames]);
};