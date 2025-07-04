import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CanvasProps {
  className?: string;
  canvasMode?: boolean;
  brushMode?: boolean;
  onImageImport?: (file: File) => void;
}

interface DrawnPath {
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

interface ImageObject {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const Canvas: React.FC<CanvasProps> = ({ className = '', canvasMode = true, brushMode = false, onImageImport }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTransform, setLastTransform] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [drawnPaths, setDrawnPaths] = useState<DrawnPath[]>([]);
  const [images, setImages] = useState<ImageObject[]>([]);

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    return {
      x: (screenX - transform.x) / transform.scale,
      y: (screenY - transform.y) / transform.scale
    };
  }, [transform]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (brushMode) {
      setIsDrawing(true);
      const canvasPoint = screenToCanvas(e.clientX, e.clientY);
      setCurrentPath([canvasPoint]);
      return;
    }
    
    if (!canvasMode) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setLastTransform({ x: transform.x, y: transform.y });
  }, [transform.x, transform.y, canvasMode, brushMode, screenToCanvas]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (brushMode && isDrawing) {
      const canvasPoint = screenToCanvas(e.clientX, e.clientY);
      setCurrentPath(prev => [...prev, canvasPoint]);
      return;
    }

    if (!isDragging || !canvasMode) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setTransform(prev => ({
      ...prev,
      x: lastTransform.x + deltaX,
      y: lastTransform.y + deltaY
    }));
  }, [isDragging, dragStart, lastTransform, canvasMode, brushMode, isDrawing, screenToCanvas]);

  const handleMouseUp = useCallback(() => {
    if (isDrawing && currentPath.length > 1) {
      setDrawnPaths(prev => [...prev, {
        points: currentPath,
        color: '#ffffff',
        width: 2
      }]);
      setCurrentPath([]);
    }
    setIsDragging(false);
    setIsDrawing(false);
  }, [isDrawing, currentPath]);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (!canvasMode) return;
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(5, transform.scale * delta));
    
    setTransform(prev => ({
      ...prev,
      scale: newScale
    }));
  }, [transform.scale, canvasMode]);

  // Redraw canvas content
  const redrawCanvas = useCallback(() => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all completed paths
    drawnPaths.forEach(path => {
      if (path.points.length < 2) return;
      
      ctx.beginPath();
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const firstPoint = path.points[0];
      ctx.moveTo(
        firstPoint.x * transform.scale + transform.x,
        firstPoint.y * transform.scale + transform.y
      );

      path.points.slice(1).forEach(point => {
        ctx.lineTo(
          point.x * transform.scale + transform.x,
          point.y * transform.scale + transform.y
        );
      });

      ctx.stroke();
    });

    // Draw current path being drawn
    if (currentPath.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const firstPoint = currentPath[0];
      ctx.moveTo(
        firstPoint.x * transform.scale + transform.x,
        firstPoint.y * transform.scale + transform.y
      );

      currentPath.slice(1).forEach(point => {
        ctx.lineTo(
          point.x * transform.scale + transform.x,
          point.y * transform.scale + transform.y
        );
      });

      ctx.stroke();
    }
  }, [drawnPaths, currentPath, transform]);

  // Handle image import
  const handleImageImport = useCallback((file: File) => {
    console.log('Canvas: handleImageImport called with file:', file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const img = new Image();
        img.onload = () => {
          console.log('Canvas: Image loaded, dimensions:', img.width, 'x', img.height);
          const newImage: ImageObject = {
            id: Date.now().toString(),
            src: e.target!.result as string,
            x: 100,
            y: 100,
            width: img.width,
            height: img.height
          };
          console.log('Canvas: Adding new image to state:', newImage);
          setImages(prev => [...prev, newImage]);
        };
        img.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  }, []);

  // Expose image import function globally
  useEffect(() => {
    console.log('Canvas: Setting up global image import handler');
    (window as any).handleCanvasImageImport = handleImageImport;
    
    return () => {
      delete (window as any).handleCanvasImageImport;
    };
  }, [handleImageImport]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleMouseMove, handleMouseUp, handleWheel]);

  useEffect(() => {
    const canvas = drawingCanvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }, []);

  // Redraw when transform or paths change
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const getCursorClass = () => {
    if (brushMode) return 'cursor-crosshair';
    if (canvasMode) return isDragging ? 'cursor-grabbing' : 'cursor-grab';
    return 'cursor-default';
  };

  return (
    <div
      ref={canvasRef}
      className={`fixed inset-0 z-0 overflow-hidden ${getCursorClass()} ${className}`}
      onMouseDown={handleMouseDown}
      style={{ userSelect: 'none' }}
    >
      {/* Infinite grid background with 10% visibility */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${transform.x % (20 * transform.scale)}px, ${transform.y % (20 * transform.scale)}px)`,
          width: '100vw',
          height: '100vh',
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: `${20 * transform.scale}px ${20 * transform.scale}px`,
          backgroundColor: 'rgba(33, 33, 33, 1)',
          pointerEvents: 'none',
        }}
      />

      {/* Images */}
      {images.map(img => {
        console.log('Canvas: Rendering image:', img.id, 'at position:', img.x, img.y);
        return (
          <img
            key={img.id}
            src={img.src}
            className="absolute pointer-events-none"
            style={{
              left: img.x * transform.scale + transform.x,
              top: img.y * transform.scale + transform.y,
              width: img.width * transform.scale,
              height: img.height * transform.scale,
            }}
            alt="Imported"
          />
        );
      })}
      
      {/* Drawing canvas for brush tool */}
      <canvas
        ref={drawingCanvasRef}
        className="absolute inset-0 z-5"
        style={{ 
          pointerEvents: brushMode ? 'auto' : 'none',
        }}
      />
      
      
      {/* Mode indicators */}
      {!canvasMode && (
        <div className="absolute bottom-4 left-4 z-20 bg-[rgba(255,69,0,0.9)] text-white text-xs px-3 py-2 rounded-md pointer-events-none border border-[rgba(255,255,255,0.1)]">
          Canvas movement disabled
        </div>
      )}
      
      {brushMode && (
        <div className="absolute bottom-4 right-4 z-20 bg-[rgba(0,255,0,0.9)] text-white text-xs px-3 py-2 rounded-md pointer-events-none border border-[rgba(255,255,255,0.1)]">
          Brush mode active
        </div>
      )}
    </div>
  );
};
