import { useEffect } from 'react';
import { Canvas as FabricCanvas, Rect } from 'fabric';

interface Frame {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface UseFrameToolProps {
  fabricCanvas: FabricCanvas | null;
  selectedTool: string;
  isCreatingFrame: boolean;
  setIsCreatingFrame: (value: boolean) => void;
  setFrames: React.Dispatch<React.SetStateAction<Frame[]>>;
}

export const useFrameTool = ({
  fabricCanvas,
  selectedTool,
  isCreatingFrame,
  setIsCreatingFrame,
  setFrames
}: UseFrameToolProps) => {
  useEffect(() => {
    if (!fabricCanvas) return;
    
    // FREEZE: Skip during drawing mode
    if (selectedTool === 'draw') {
      console.log('FrameTool: Frozen during drawing mode');
      return;
    }
    
    if (selectedTool !== 'frame') return;

    const handleFrameCreation = (opt: any) => {
      if (isCreatingFrame) return;
      
      const pointer = fabricCanvas.getPointer(opt.e);
      setIsCreatingFrame(true);

      const startX = pointer.x;
      const startY = pointer.y;

      // Create a proper rectangle for the frame with correct fill color
      const frameRect = new Rect({
        left: startX,
        top: startY,
        width: 0,
        height: 0,
        fill: '#EDEDED',   // Frame fill color - light gray
        stroke: undefined, // No border
        strokeWidth: 0,    // No border
        selectable: false, // Temporary during creation
        evented: true,     // Keep events enabled
        name: 'frame-rectangle',
      });

      fabricCanvas.add(frameRect);
      
      // Always keep frames at the back
      fabricCanvas.sendObjectToBack(frameRect);
      let isDrawing = true;

      const onMouseMove = (opt: any) => {
        if (!isDrawing) return;
        const pointer = fabricCanvas.getPointer(opt.e);
        
        const width = Math.abs(pointer.x - startX);
        const height = Math.abs(pointer.y - startY);
        const left = Math.min(startX, pointer.x);
        const top = Math.min(startY, pointer.y);

        frameRect.set({ left, top, width, height });
        fabricCanvas.renderAll();
      };

      const onMouseUp = () => {
        isDrawing = false;
        setIsCreatingFrame(false);
        
        fabricCanvas.off('mouse:move', onMouseMove);
        fabricCanvas.off('mouse:up', onMouseUp);
        
        if ((frameRect.width || 0) > 10 && (frameRect.height || 0) > 10) {
          console.log('Frame created successfully, making selectable');
          
          // Make frame selectable and ensure it stays at the back
          frameRect.set({ 
            selectable: true, 
            evented: true,
          });
          
          // Ensure frame stays at the back
          fabricCanvas.sendObjectToBack(frameRect);
          
          const newFrame: Frame = {
            id: Date.now().toString(),
            x: frameRect.left || 0,
            y: frameRect.top || 0,
            width: frameRect.width || 0,
            height: frameRect.height || 0,
          };
          setFrames(prev => [...prev, newFrame]);
        } else {
          console.log('Frame too small, removing');
          fabricCanvas.remove(frameRect);
        }
        
        fabricCanvas.renderAll();
      };

      fabricCanvas.on('mouse:move', onMouseMove);
      fabricCanvas.on('mouse:up', onMouseUp);
    };

    fabricCanvas.on('mouse:down', handleFrameCreation);

    return () => {
      fabricCanvas.off('mouse:down', handleFrameCreation);
    };
  }, [fabricCanvas, selectedTool, isCreatingFrame, setIsCreatingFrame, setFrames]);
};