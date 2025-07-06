import { useEffect } from 'react';
import Konva from 'konva';

export const useTextTool = (
  stageRef: React.RefObject<Konva.Stage>,
  selectedTool: string
) => {
  useEffect(() => {
    if (!stageRef.current) return;
    
    // FREEZE: Skip during drawing mode
    if (selectedTool === 'draw') {
      console.log('TextTool: Frozen during drawing mode');
      return;
    }
    
    if (selectedTool !== 'text') return;

    const stage = stageRef.current;
    const layer = stage.findOne('Layer') as Konva.Layer;

    const handleTextCreation = (e: Konva.KonvaEventObject<MouseEvent>) => {
      const pos = stage.getPointerPosition();
      if (!pos || !layer) return;
      
      console.log('Adding text at:', pos.x, pos.y);
      
      const text = new Konva.Text({
        x: pos.x,
        y: pos.y,
        text: 'Click to edit text',
        fontSize: 16,
        fill: '#FFFFFF',
        fontFamily: 'Arial',
        draggable: true,
        selectable: true,
      });
      
      layer.add(text);
      stage.draw();
      
      // Make text editable
      text.on('dblclick', () => {
        // Create textarea over the text
        const textPosition = text.absolutePosition();
        const stageBox = stage.container().getBoundingClientRect();
        
        const areaPosition = {
          x: stageBox.left + textPosition.x,
          y: stageBox.top + textPosition.y,
        };
        
        const textarea = document.createElement('textarea');
        document.body.appendChild(textarea);
        
        textarea.value = text.text();
        textarea.style.position = 'absolute';
        textarea.style.top = areaPosition.y + 'px';
        textarea.style.left = areaPosition.x + 'px';
        textarea.style.width = text.width() - text.padding() * 2 + 'px';
        textarea.style.height = text.height() - text.padding() * 2 + 'px';
        textarea.style.fontSize = text.fontSize() + 'px';
        textarea.style.border = 'none';
        textarea.style.padding = '0px';
        textarea.style.margin = '0px';
        textarea.style.overflow = 'hidden';
        textarea.style.background = 'none';
        textarea.style.outline = 'none';
        textarea.style.resize = 'none';
        textarea.style.lineHeight = text.lineHeight().toString();
        textarea.style.fontFamily = text.fontFamily();
        textarea.style.transformOrigin = 'left top';
        textarea.style.textAlign = text.align();
                 textarea.style.color = text.fill() as string;
        
        const rotation = text.rotation();
        let transform = '';
        if (rotation) {
          transform += 'rotateZ(' + rotation + 'deg)';
        }
        
        let px = 0;
        let py = 0;
        const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
        if (isFirefox) {
          px += 2 + Math.round(text.fontSize() / 20);
          py += 2;
        }
        transform += 'translateY(-' + py + 'px)';
        
        textarea.style.transform = transform;
        
        textarea.focus();
        
        const removeTextarea = () => {
          textarea.parentNode?.removeChild(textarea);
          window.removeEventListener('click', handleOutsideClick);
          text.off('blur', removeTextarea);
          text.off('keydown', handleKeyDown);
        };
        
        const handleOutsideClick = (e: Event) => {
          if (e.target !== textarea) {
            text.text(textarea.value);
            removeTextarea();
          }
        };
        
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            text.text(textarea.value);
            removeTextarea();
          }
          if (e.key === 'Escape') {
            removeTextarea();
          }
        };
        
        textarea.addEventListener('blur', removeTextarea);
        textarea.addEventListener('keydown', handleKeyDown);
        window.addEventListener('click', handleOutsideClick);
      });
    };

    stage.on('mousedown', handleTextCreation);

    return () => {
      stage.off('mousedown', handleTextCreation);
    };
  }, [stageRef, selectedTool]);
};