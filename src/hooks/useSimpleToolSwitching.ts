import { useEffect, useRef } from 'react';
import Konva from 'konva';

export const useSimpleToolSwitching = (
  stageRef: React.RefObject<Konva.Stage>,
  selectedTool: string
) => {
  const drawingModeRef = useRef(false);
  const drawingLayerRef = useRef<Konva.Layer | null>(null);
  const isDrawingRef = useRef(false);
  const lastLineRef = useRef<Konva.Line | null>(null);

  useEffect(() => {
    if (!stageRef.current) return;

    console.log('Simple tool switch to:', selectedTool);
    const stage = stageRef.current;

    // Get or create drawing layer
    if (!drawingLayerRef.current) {
      drawingLayerRef.current = stage.findOne('Layer[data-name="drawing"]') as Konva.Layer;
      if (!drawingLayerRef.current) {
        drawingLayerRef.current = new Konva.Layer({ name: 'drawing' });
        stage.add(drawingLayerRef.current);
      }
    }

    // Configure canvas-level properties based on selected tool
    switch (selectedTool) {
      case 'draw':
        console.log('Setting up drawing mode...');
        drawingModeRef.current = true;
        
        // Set cursor
        stage.container().style.cursor = 'crosshair';
        
        // Disable selection during drawing
        stage.draggable(false);
        
        console.log('Drawing mode enabled:', {
          drawingMode: drawingModeRef.current,
          cursor: stage.container().style.cursor,
          draggable: stage.draggable()
        });
        break;
        
      case 'select':
        drawingModeRef.current = false;
        stage.container().style.cursor = 'default';
        stage.draggable(false);
        console.log('Select mode enabled');
        break;
        
      case 'hand':
        drawingModeRef.current = false;
        stage.container().style.cursor = 'grab';
        stage.draggable(true);
        console.log('Hand mode enabled:', {
          cursor: stage.container().style.cursor,
          draggable: stage.draggable()
        });
        break;
        
      case 'frame':
        drawingModeRef.current = false;
        stage.container().style.cursor = 'crosshair';
        stage.draggable(false);
        console.log('Frame mode enabled - only frame creation allowed');
        break;
        
      case 'text':
        drawingModeRef.current = false;
        stage.container().style.cursor = 'crosshair';
        stage.draggable(false);
        break;
        
      default:
        drawingModeRef.current = false;
        stage.container().style.cursor = 'default';
        stage.draggable(false);
        break;
    }

    stage.draw();
  }, [selectedTool, stageRef]);

  // Drawing functionality
  useEffect(() => {
    if (!stageRef.current || !drawingLayerRef.current) return;
    if (selectedTool !== 'draw') return;

    const stage = stageRef.current;
    const drawingLayer = drawingLayerRef.current;

    const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!drawingModeRef.current) return;
      
      isDrawingRef.current = true;
      const pos = stage.getPointerPosition();
      if (!pos) return;

      lastLineRef.current = new Konva.Line({
        stroke: '#00FF00',
        strokeWidth: 5,
        globalCompositeOperation: 'source-over',
        points: [pos.x, pos.y, pos.x, pos.y],
        draggable: false,
        selectable: true,
      });

      drawingLayer.add(lastLineRef.current);
      drawingLayer.draw();
    };

    const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!isDrawingRef.current || !lastLineRef.current) return;

      const pos = stage.getPointerPosition();
      if (!pos) return;

      const newPoints = lastLineRef.current.points().concat([pos.x, pos.y]);
      lastLineRef.current.points(newPoints);
      drawingLayer.batchDraw();
    };

    const handleMouseUp = () => {
      isDrawingRef.current = false;
      lastLineRef.current = null;
    };

    stage.on('mousedown', handleMouseDown);
    stage.on('mousemove', handleMouseMove);
    stage.on('mouseup', handleMouseUp);

    return () => {
      stage.off('mousedown', handleMouseDown);
      stage.off('mousemove', handleMouseMove);
      stage.off('mouseup', handleMouseUp);
    };
  }, [selectedTool, stageRef]);

  return {
    drawingMode: drawingModeRef.current,
    drawingLayer: drawingLayerRef.current
  };
};