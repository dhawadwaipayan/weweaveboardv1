import React, { useRef, useState } from 'react';
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
