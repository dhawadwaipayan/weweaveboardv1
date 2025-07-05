import { useEffect } from 'react';
import { Canvas as FabricCanvas } from 'fabric';

export const useDeleteHandler = (
  fabricCanvas: FabricCanvas | null,
  selectedTool: string
) => {
  useEffect(() => {
    if (!fabricCanvas) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't delete during drawing mode
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedTool !== 'draw') {
        const activeObjects = fabricCanvas.getActiveObjects();
        if (activeObjects.length > 0) {
          activeObjects.forEach(obj => {
            fabricCanvas.remove(obj);
          });
          fabricCanvas.discardActiveObject();
          fabricCanvas.renderAll();
          console.log('Deleted selected objects');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fabricCanvas, selectedTool]);
};