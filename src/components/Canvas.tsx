import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Stage, Layer, Rect, Image as KonvaImage } from 'react-konva';
import Konva from 'konva';
import { useCanvasInitialization } from '@/hooks/useCanvasInitialization';
import { useSimpleToolSwitching } from '@/hooks/useSimpleToolSwitching';

interface CanvasProps {
  className?: string;
  selectedTool?: string;
  onSelectedImageSrcChange?: (src: string | null) => void;
}

export interface CanvasHandle {
  getKonvaStage: () => Konva.Stage | null;
  getKonvaLayer: () => Konva.Layer | null;
}

export const Canvas = forwardRef<CanvasHandle, CanvasProps>(
  ({ className = '', selectedTool = 'select', onSelectedImageSrcChange }, ref) => {
    const stageRef = useRef<Konva.Stage>(null);
    const layerRef = useRef<Konva.Layer>(null);
    const [stageSize, setStageSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);

    // Initialize Konva stage
    const isInitialized = useCanvasInitialization(stageRef);
    
    // Tool switching
    useSimpleToolSwitching(stageRef, selectedTool);

    // Expose Konva stage and layer to parent
    useImperativeHandle(ref, () => ({
      getKonvaStage: () => stageRef.current,
      getKonvaLayer: () => layerRef.current
    }), []);

    // Handle window resize
    useEffect(() => {
      const handleResize = () => {
        setStageSize({ width: window.innerWidth, height: window.innerHeight });
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Create grid pattern
    const createGridPattern = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const gridSize = 20;
      
      canvas.width = gridSize;
      canvas.height = gridSize;
      
      if (ctx) {
        ctx.fillStyle = '#1E1E1E';
        ctx.fillRect(0, 0, gridSize, gridSize);
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, gridSize);
        ctx.lineTo(gridSize, gridSize);
        ctx.lineTo(gridSize, 0);
        ctx.stroke();
      }
      
      return canvas;
    };

    // Register global image import handler for TopBar
    useEffect(() => {
      const handleImageImport = (file: File) => {
        console.log('Canvas: Received image import request for:', file.name);
        
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          console.log('Canvas: FileReader loaded, creating Konva image');
          
          const img = document.createElement('img');
          img.onload = () => {
            console.log('Canvas: Image loaded, adding to canvas');
            if (layerRef.current) {
              const konvaImage = new Konva.Image({
                x: 100,
                y: 100,
                image: img,
                scaleX: 0.5,
                scaleY: 0.5,
                draggable: true,
                selectable: true,
              });
              layerRef.current.add(konvaImage);
              layerRef.current.draw();
              console.log('Canvas: Image added successfully');
            }
          };
          img.src = result;
        };
        
        reader.onerror = (error) => {
          console.error('Canvas: FileReader error:', error);
        };
        
        reader.readAsDataURL(file);
      };

      // Register handler on window object for TopBar to use
      (window as any).handleCanvasImageImport = handleImageImport;
      console.log('Canvas: Image import handler registered on window');

      return () => {
        delete (window as any).handleCanvasImageImport;
        console.log('Canvas: Image import handler removed from window');
      };
    }, []);

    // Handle image selection for parent components
    useEffect(() => {
      if (!onSelectedImageSrcChange) return;

              const handleSelection = () => {
          // For now, we'll implement selection handling later
          // This is a placeholder for the selection logic
          onSelectedImageSrcChange(null);
        };

      if (stageRef.current) {
        stageRef.current.on('selection:created', handleSelection);
        stageRef.current.on('selection:updated', handleSelection);
        stageRef.current.on('selection:cleared', handleSelection);
      }

      return () => {
        if (stageRef.current) {
          stageRef.current.off('selection:created', handleSelection);
          stageRef.current.off('selection:updated', handleSelection);
          stageRef.current.off('selection:cleared', handleSelection);
        }
      };
    }, [onSelectedImageSrcChange]);

    return (
      <div className={`fixed inset-0 z-0 overflow-hidden ${className}`}>
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          style={{ 
            cursor: selectedTool === 'draw' ? 'crosshair' : 'default',
            touchAction: 'none',
            pointerEvents: 'auto'
          }}
        >
          {/* Background Layer with Grid */}
          <Layer>
            <Rect
              x={0}
              y={0}
              width={stageSize.width}
              height={stageSize.height}
              fillPatternImage={createGridPattern() as any}
              fillPatternRepeat="repeat"
            />
          </Layer>
          
          {/* Main Content Layer */}
          <Layer ref={layerRef} />
        </Stage>
      </div>
    );
  }
);
