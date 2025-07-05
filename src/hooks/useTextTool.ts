import { useEffect } from 'react';
import { Canvas as FabricCanvas, IText } from 'fabric';

export const useTextTool = (
  fabricCanvas: FabricCanvas | null,
  selectedTool: string
) => {
  useEffect(() => {
    if (!fabricCanvas || selectedTool !== 'text') return;

    const handleTextCreation = (opt: any) => {
      const pointer = fabricCanvas.getPointer(opt.e);
      console.log('Adding text at:', pointer.x, pointer.y);
      
      const text = new IText('Click to edit text', {
        left: pointer.x,
        top: pointer.y,
        fontSize: 16,
        fill: '#FFFFFF',
        fontFamily: 'Arial',
        selectable: true,
        evented: true,
      });
      
      fabricCanvas.add(text);
      fabricCanvas.setActiveObject(text);
      text.enterEditing();
      fabricCanvas.renderAll();
    };

    fabricCanvas.on('mouse:down', handleTextCreation);

    return () => {
      fabricCanvas.off('mouse:down', handleTextCreation);
    };
  }, [fabricCanvas, selectedTool]);
};