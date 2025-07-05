import { useEffect } from 'react';
import { Canvas as FabricCanvas, Rect } from 'fabric';
import { FrameContainer } from '@/lib/FrameContainer';

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

      // Create frame container with proper initial properties
      const frameContainer = new FrameContainer([], {
        left: startX,
        top: startY,
        width: 0,
        height: 0,
        selectable: false, // Temporary during creation
        evented: true,     // Keep events enabled
        fill: '#EDEDED',   // Frame fill color
        stroke: undefined, // No border
        strokeWidth: 0,    // No border
      });

      frameContainer.setCanvas(fabricCanvas);
      fabricCanvas.add(frameContainer);
      
      // Always keep frames at the back
      frameContainer.sendToBack();
      let isDrawing = true;

      const onMouseMove = (opt: any) => {
        if (!isDrawing) return;
        const pointer = fabricCanvas.getPointer(opt.e);
        
        const width = Math.abs(pointer.x - startX);
        const height = Math.abs(pointer.y - startY);
        const left = Math.min(startX, pointer.x);
        const top = Math.min(startY, pointer.y);

        frameContainer.set({ left, top, width, height });
        fabricCanvas.renderAll();
      };

      const onMouseUp = () => {
        isDrawing = false;
        setIsCreatingFrame(false);
        
        fabricCanvas.off('mouse:move', onMouseMove);
        fabricCanvas.off('mouse:up', onMouseUp);
        
        if ((frameContainer.width || 0) > 10 && (frameContainer.height || 0) > 10) {
          console.log('Frame created successfully, making selectable');
          
          // Make frame selectable and add metadata to prevent override
          frameContainer.set({ 
            selectable: true, 
            evented: true,
          });
          
          // Update children after frame is created
          setTimeout(() => {
            frameContainer.updateChildren();
          }, 100);
          
          const newFrame: Frame = {
            id: Date.now().toString(),
            x: frameContainer.left || 0,
            y: frameContainer.top || 0,
            width: frameContainer.width || 0,
            height: frameContainer.height || 0,
          };
          setFrames(prev => [...prev, newFrame]);
        } else {
          console.log('Frame too small, removing');
          fabricCanvas.remove(frameContainer);
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