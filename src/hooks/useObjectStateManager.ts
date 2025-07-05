import { useEffect } from 'react';
import { Canvas as FabricCanvas } from 'fabric';

export const useObjectStateManager = (
  fabricCanvas: FabricCanvas | null,
  selectedTool: string
) => {
  useEffect(() => {
    if (!fabricCanvas) return;

    // FREEZE: Skip everything during drawing mode - let Fabric.js handle it natively
    if (selectedTool === 'draw') {
      console.log('ObjectStateManager: Frozen during drawing mode');
      return;
    }

    // Function to update object selectability based on current tool
    const updateObjectSelectability = () => {
      console.log('Updating object selectability for tool:', selectedTool);
      
      fabricCanvas.forEachObject((obj) => {
        if (selectedTool === 'select') {
          // In select mode, all objects should be selectable
          obj.selectable = true;
        } else if (selectedTool === 'hand') {
          // In hand mode, disable object selection to prevent conflicts with panning
          obj.selectable = false;
        } else if (selectedTool === 'frame') {
          // In frame mode, no object should be selectable (not even frames)
          obj.selectable = false;
        } else {
          // For other tools (text, etc.), disable selection temporarily
          obj.selectable = false;
        }
      });
      
      if (selectedTool === 'frame') {
        console.log('Frame mode: all objects unselectable (creation only)');
      }
      
      fabricCanvas.renderAll();
    };

    // Update all existing objects
    updateObjectSelectability();

    // Listen for new objects being added and update their selectability
    const handleObjectAdded = () => {
      console.log('Object added, updating selectability for tool:', selectedTool);
      updateObjectSelectability();
    };

    fabricCanvas.on('object:added', handleObjectAdded);

    return () => {
      fabricCanvas.off('object:added', handleObjectAdded);
    };
  }, [selectedTool, fabricCanvas]);
};
