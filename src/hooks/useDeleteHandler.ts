import { useEffect } from 'react';
import Konva from 'konva';

export const useDeleteHandler = (
  stageRef: React.RefObject<Konva.Stage>,
  selectedTool: string
) => {
  useEffect(() => {
    if (!stageRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't delete during drawing mode
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedTool !== 'draw') {
        const stage = stageRef.current;
        if (!stage) return;

        // For now, we'll implement a simple delete for all objects
        // This will be enhanced when we implement proper selection
        const layers = stage.getLayers();
        layers.forEach(layer => {
          const children = layer.getChildren();
          children.forEach(child => {
            if (child.draggable()) {
              child.destroy();
            }
          });
        });
        stage.draw();
        console.log('Deleted objects');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stageRef, selectedTool]);
};