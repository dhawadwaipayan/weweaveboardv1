import { useEffect } from 'react';
import { Canvas as FabricCanvas, Rect, Point } from 'fabric';

interface Frame {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface UseToolEventHandlersProps {
  fabricCanvas: FabricCanvas | null;
  selectedTool: string;
  isCreatingFrame: boolean;
  setIsCreatingFrame: (value: boolean) => void;
  isPanning: boolean;
  setIsPanning: (value: boolean) => void;
  lastPanPoint: { x: number; y: number };
  setLastPanPoint: (point: { x: number; y: number }) => void;
  setFrames: React.Dispatch<React.SetStateAction<Frame[]>>;
}

export const useToolEventHandlers = ({
  fabricCanvas,
  selectedTool,
  isCreatingFrame,
  setIsCreatingFrame,
  isPanning,
  setIsPanning,
  lastPanPoint,
  setLastPanPoint,
  setFrames
}: UseToolEventHandlersProps) => {
  // CENTRALIZED MOUSE EVENT HANDLER - Only one active at a time
  useEffect(() => {
    if (!fabricCanvas) return;

    console.log(`Setting up centralized events for tool: ${selectedTool}`);

    // Centralized mouse event handler that routes based on selectedTool
    const handleMouseDown = (opt: any) => {
      const pointer = fabricCanvas.getPointer(opt.e);

      switch (selectedTool) {
        case 'frame':
          if (isCreatingFrame) return;
          console.log('Starting frame creation');
          setIsCreatingFrame(true);

          const startX = pointer.x;
          const startY = pointer.y;

          // Create frame rectangle
          const frame = new Rect({
            left: startX,
            top: startY,
            width: 0,
            height: 0,
            fill: '#1A1A1A',
            stroke: '',
            strokeWidth: 0,
            selectable: false,
            evented: false,
            name: 'frame',
          });

          fabricCanvas.add(frame);
          let isDrawing = true;

          const onMouseMove = (opt: any) => {
            if (!isDrawing) return;
            const pointer = fabricCanvas.getPointer(opt.e);
            
            const width = Math.abs(pointer.x - startX);
            const height = Math.abs(pointer.y - startY);
            const left = Math.min(startX, pointer.x);
            const top = Math.min(startY, pointer.y);

            frame.set({ left, top, width, height });
            fabricCanvas.renderAll();
          };

          const onMouseUp = () => {
            isDrawing = false;
            setIsCreatingFrame(false);
            
            fabricCanvas.off('mouse:move', onMouseMove);
            fabricCanvas.off('mouse:up', onMouseUp);
            
            if ((frame.width || 0) > 10 && (frame.height || 0) > 10) {
              console.log('Frame created successfully');
              const newFrame: Frame = {
                id: Date.now().toString(),
                x: frame.left || 0,
                y: frame.top || 0,
                width: frame.width || 0,
                height: frame.height || 0,
              };
              setFrames(prev => [...prev, newFrame]);
              frame.set({ selectable: true, evented: true });
            } else {
              console.log('Frame too small, removing');
              fabricCanvas.remove(frame);
            }
            
            fabricCanvas.renderAll();
          };

          fabricCanvas.on('mouse:move', onMouseMove);
          fabricCanvas.on('mouse:up', onMouseUp);
          break;

        case 'text':
          console.log('Adding text at:', pointer.x, pointer.y);
          const { IText } = require('fabric');
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
          break;

        case 'hand':
          setIsPanning(true);
          setLastPanPoint({ x: pointer.x, y: pointer.y });
          fabricCanvas.setCursor('grabbing');
          break;

        case 'draw':
          // Drawing is handled by Fabric.js natively when isDrawingMode = true
          // No additional handling needed here
          break;

        case 'select':
          // Selection is handled by Fabric.js natively when selection = true
          // No additional handling needed here
          break;
      }
    };

    const handleMouseMove = (opt: any) => {
      if (selectedTool === 'hand' && isPanning) {
        const pointer = fabricCanvas.getPointer(opt.e);
        const deltaX = pointer.x - lastPanPoint.x;
        const deltaY = pointer.y - lastPanPoint.y;
        
        const currentTransform = fabricCanvas.viewportTransform;
        if (currentTransform) {
          currentTransform[4] += deltaX;
          currentTransform[5] += deltaY;
          fabricCanvas.requestRenderAll();
        }
        
        setLastPanPoint({ x: pointer.x, y: pointer.y });
      }
    };

    const handleMouseUp = () => {
      if (selectedTool === 'hand' && isPanning) {
        setIsPanning(false);
        fabricCanvas.setCursor('grab');
      }
    };

    const handleWheel = (opt: any) => {
      if (selectedTool === 'hand') {
        const delta = opt.e.deltaY;
        let zoom = fabricCanvas.getZoom();
        zoom *= 0.999 ** delta;
        
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        
        const pointer = fabricCanvas.getPointer(opt.e);
        fabricCanvas.zoomToPoint(new Point(pointer.x, pointer.y), zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
      }
    };

    // Object interaction handlers (only for select mode)
    const handleObjectMoving = (e: any) => {
      if (selectedTool !== 'select') return;
      const obj = e.target;
      if (!obj || obj.name !== 'frame') return;
      fabricCanvas.renderAll();
    };

    const handleObjectSelected = (e: any) => {
      if (selectedTool !== 'select') return;
      const obj = e.target;
      if (obj && obj.name === 'frame') {
        console.log('Frame selected');
      }
    };

    // Add event listeners based on tool
    if (selectedTool !== 'draw') {
      fabricCanvas.on('mouse:down', handleMouseDown);
    }
    
    if (selectedTool === 'hand') {
      fabricCanvas.on('mouse:move', handleMouseMove);
      fabricCanvas.on('mouse:up', handleMouseUp);
      fabricCanvas.on('mouse:wheel', handleWheel);
    }
    
    if (selectedTool === 'select') {
      fabricCanvas.on('object:moving', handleObjectMoving);
      fabricCanvas.on('selection:created', handleObjectSelected);
      fabricCanvas.on('selection:updated', handleObjectSelected);
    }

    return () => {
      // Clean up ALL event listeners
      fabricCanvas.off('mouse:down', handleMouseDown);
      fabricCanvas.off('mouse:move', handleMouseMove);
      fabricCanvas.off('mouse:up', handleMouseUp);
      fabricCanvas.off('mouse:wheel', handleWheel);
      fabricCanvas.off('object:moving', handleObjectMoving);
      fabricCanvas.off('selection:created', handleObjectSelected);
      fabricCanvas.off('selection:updated', handleObjectSelected);
    };
  }, [selectedTool, fabricCanvas, isCreatingFrame, isPanning, lastPanPoint, setIsCreatingFrame, setIsPanning, setLastPanPoint, setFrames]);

  // Delete key functionality (works across all modes except draw)
  useEffect(() => {
    if (!fabricCanvas) return;

    const handleKeyDown = (e: KeyboardEvent) => {
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