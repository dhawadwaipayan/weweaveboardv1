import React, { useRef, useEffect } from 'react';
import { Image as FabricImage } from 'fabric';
import { useCanvasTool } from '@/hooks/useCanvasTool';
import { CanvasToolIndicator } from './CanvasToolIndicator';

interface CanvasProps {
  className?: string;
  selectedTool?: string;
}

export const Canvas: React.FC<CanvasProps> = ({ className = '', selectedTool = 'select' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Use consolidated tool hook
  const fabricCanvas = useCanvasTool(canvasRef, selectedTool);

  // Register global image import handler for TopBar
  useEffect(() => {
    if (!fabricCanvas) return;

    const handleImageImport = (file: File) => {
      console.log('Canvas: Received image import request for:', file.name);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        console.log('Canvas: FileReader loaded, creating Fabric image');
        
        FabricImage.fromURL(result)
          .then((img) => {
            console.log('Canvas: Fabric image created, adding to canvas');
            img.set({
              left: 100,
              top: 100,
              scaleX: 0.5,
              scaleY: 0.5,
              selectable: true,
              evented: true,
            });
            fabricCanvas.add(img);
            fabricCanvas.renderAll();
            console.log('Canvas: Image added successfully');
          })
          .catch((error) => {
            console.error('Canvas: Error creating Fabric image:', error);
          });
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
