import React, { useRef, useState, useEffect } from 'react';
import { Image as FabricImage } from 'fabric';
import { useCanvasInitialization } from '@/hooks/useCanvasInitialization';
import { useToolSwitching } from '@/hooks/useToolSwitching';
import { useToolEventHandlers } from '@/hooks/useToolEventHandlers';
import { CanvasToolIndicator } from './CanvasToolIndicator';

interface CanvasProps {
  className?: string;
  selectedTool?: string;
}

interface Frame {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const Canvas: React.FC<CanvasProps> = ({ className = '', selectedTool = 'select' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [isCreatingFrame, setIsCreatingFrame] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  // Initialize Fabric.js canvas
  const fabricCanvas = useCanvasInitialization(canvasRef);

  // Handle tool switching
  useToolSwitching(fabricCanvas, selectedTool, setIsCreatingFrame, setIsPanning);

  // Handle tool-specific events
  useToolEventHandlers({
    fabricCanvas,
    selectedTool,
    isCreatingFrame,
    setIsCreatingFrame,
    isPanning,
    setIsPanning,
    lastPanPoint,
    setLastPanPoint,
    setFrames
  });

  // Global image import handler
  useEffect(() => {
    if (!fabricCanvas) return;

    const handleImageImport = (event: CustomEvent) => {
      const file = event.detail;
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const imgElement = new Image();
        imgElement.onload = () => {
          FabricImage.fromURL(e.target?.result as string)
            .then((img) => {
              img.set({
                left: 100,
                top: 100,
                scaleX: 0.5,
                scaleY: 0.5,
              });
              fabricCanvas.add(img);
              fabricCanvas.renderAll();
            });
        };
        imgElement.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    };

    window.addEventListener('importImage', handleImageImport as EventListener);
    return () => {
      window.removeEventListener('importImage', handleImageImport as EventListener);
    };
  }, [fabricCanvas]);

  return (
    <div className={`fixed inset-0 z-0 overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
      />
      
      <CanvasToolIndicator selectedTool={selectedTool} />
    </div>
  );
};
