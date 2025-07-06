import { useEffect } from 'react';
import Konva from 'konva';

export const useObjectStateManager = (
  stageRef: React.RefObject<Konva.Stage>,
  selectedTool: string
) => {
  useEffect(() => {
    if (!stageRef.current) return;

    // FREEZE: Skip everything during drawing mode - let Konva handle it natively
    if (selectedTool === 'draw') {
      console.log('ObjectStateManager: Frozen during drawing mode');
      return;
    }

    // Function to update object selectability based on current tool
    const updateObjectSelectability = () => {
      console.log('Updating object selectability for tool:', selectedTool);
      
      const stage = stageRef.current;
      if (!stage) return;

      // Get all layers except background
      const layers = stage.getLayers();
      layers.forEach(layer => {
        if (layer.name() === 'background') return; // Skip background layer
        
        const objects = layer.getChildren();
        objects.forEach((obj) => {
          if (selectedTool === 'select') {
            // In select mode, all objects should be selectable
            obj.draggable(true);
          } else if (selectedTool === 'hand') {
            // In hand mode, disable object selection to prevent conflicts with panning
            obj.draggable(false);
          } else if (selectedTool === 'frame') {
            // In frame mode, no object should be selectable (not even frames)
            obj.draggable(false);
          } else {
            // For other tools (text, etc.), disable selection temporarily
            obj.draggable(false);
          }
        });
      });
      
      if (selectedTool === 'frame') {
        console.log('Frame mode: all objects unselectable (creation only)');
      }
      
      stage.draw();
    };

    // Update all existing objects
    updateObjectSelectability();

    // Listen for new objects being added and update their selectability
    const handleObjectAdded = () => {
      console.log('Object added, updating selectability for tool:', selectedTool);
      updateObjectSelectability();
    };

    stageRef.current.on('add', handleObjectAdded);

    return () => {
      if (stageRef.current) {
        stageRef.current.off('add', handleObjectAdded);
      }
    };
  }, [selectedTool, stageRef]);
};
