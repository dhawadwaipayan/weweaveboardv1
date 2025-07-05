import React, { useState, useCallback, useRef, useEffect } from 'react';
import { DownloadSimple } from '@phosphor-icons/react';

interface ImageObject {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

interface ImageEditorProps {
  image: ImageObject;
  isSelected: boolean;
  transform: { x: number; y: number; scale: number };
  onSelect: (id: string) => void;
  onUpdate: (image: ImageObject) => void;
  onDeselect: () => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({
  image,
  isSelected,
  transform,
  onSelect,
  onUpdate,
  onDeselect,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, imageX: 0, imageY: 0, imageW: 0, imageH: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    return {
      x: (screenX - transform.x) / transform.scale,
      y: (screenY - transform.y) / transform.scale
    };
  }, [transform]);

  const handleImageClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(image.id);
  }, [image.id, onSelect]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isSelected) {
      onSelect(image.id);
      return;
    }

    const canvasPoint = screenToCanvas(e.clientX, e.clientY);
    setIsDragging(true);
    setDragStart({
      x: canvasPoint.x,
      y: canvasPoint.y,
      imageX: image.x,
      imageY: image.y,
      imageW: image.width,
      imageH: image.height
    });
  }, [isSelected, image, screenToCanvas, onSelect]);

  const handleHandleMouseDown = useCallback((e: React.MouseEvent, handleId: string) => {
    e.stopPropagation();
    
    const canvasPoint = screenToCanvas(e.clientX, e.clientY);
    setIsResizing(true);
    setActiveHandle(handleId);
    setDragStart({
      x: canvasPoint.x,
      y: canvasPoint.y,
      imageX: image.x,
      imageY: image.y,
      imageW: image.width,
      imageH: image.height
    });
  }, [image, screenToCanvas]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging && !isResizing) return;

    const canvasPoint = screenToCanvas(e.clientX, e.clientY);
    const deltaX = canvasPoint.x - dragStart.x;
    const deltaY = canvasPoint.y - dragStart.y;

    if (isDragging) {
      // Move image
      onUpdate({
        ...image,
        x: dragStart.imageX + deltaX,
        y: dragStart.imageY + deltaY
      });
    } else if (isResizing && activeHandle) {
      // Resize image based on handle
      let newWidth = dragStart.imageW;
      let newHeight = dragStart.imageH;
      let newX = dragStart.imageX;
      let newY = dragStart.imageY;

      switch (activeHandle) {
        case 'se': // Bottom-right corner
          newWidth = Math.max(20, dragStart.imageW + deltaX);
          newHeight = Math.max(20, dragStart.imageH + deltaY);
          break;
        case 'sw': // Bottom-left corner
          newWidth = Math.max(20, dragStart.imageW - deltaX);
          newHeight = Math.max(20, dragStart.imageH + deltaY);
          newX = dragStart.imageX + deltaX;
          break;
        case 'ne': // Top-right corner
          newWidth = Math.max(20, dragStart.imageW + deltaX);
          newHeight = Math.max(20, dragStart.imageH - deltaY);
          newY = dragStart.imageY + deltaY;
          break;
        case 'nw': // Top-left corner
          newWidth = Math.max(20, dragStart.imageW - deltaX);
          newHeight = Math.max(20, dragStart.imageH - deltaY);
          newX = dragStart.imageX + deltaX;
          newY = dragStart.imageY + deltaY;
          break;
        case 'e': // Right side
          newWidth = Math.max(20, dragStart.imageW + deltaX);
          break;
        case 'w': // Left side
          newWidth = Math.max(20, dragStart.imageW - deltaX);
          newX = dragStart.imageX + deltaX;
          break;
        case 'n': // Top side
          newHeight = Math.max(20, dragStart.imageH - deltaY);
          newY = dragStart.imageY + deltaY;
          break;
        case 's': // Bottom side
          newHeight = Math.max(20, dragStart.imageH + deltaY);
          break;
      }

      onUpdate({
        ...image,
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight
      });
    }
  }, [isDragging, isResizing, activeHandle, dragStart, screenToCanvas, image, onUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setActiveHandle(null);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const getHandles = () => {
    const handles = [
      { id: 'nw', x: 0, y: 0, type: 'corner' as const },
      { id: 'ne', x: image.width, y: 0, type: 'corner' as const },
      { id: 'sw', x: 0, y: image.height, type: 'corner' as const },
      { id: 'se', x: image.width, y: image.height, type: 'corner' as const },
      { id: 'n', x: image.width / 2, y: 0, type: 'side' as const },
      { id: 's', x: image.width / 2, y: image.height, type: 'side' as const },
      { id: 'w', x: 0, y: image.height / 2, type: 'side' as const },
      { id: 'e', x: image.width, y: image.height / 2, type: 'side' as const },
    ];

    return handles.map(handle => ({
      ...handle,
      screenX: (image.x + handle.x) * transform.scale + transform.x,
      screenY: (image.y + handle.y) * transform.scale + transform.y,
    }));
  };

  const imageStyle = {
    left: image.x * transform.scale + transform.x,
    top: image.y * transform.scale + transform.y,
    width: image.width * transform.scale,
    height: image.height * transform.scale,
    transform: `rotate(${image.rotation}deg)`,
    transformOrigin: 'center center',
  };

  return (
    <>
      {/* Image */}
      <div
        ref={imageRef}
        className={`absolute cursor-move ${isSelected ? 'z-20' : 'z-10'}`}
        style={imageStyle}
        onMouseDown={handleMouseDown}
        onClick={handleImageClick}
      >
        <img
          src={image.src}
          className="w-full h-full object-contain pointer-events-none"
          alt="Imported"
          draggable={false}
        />
        {/* Download button overlay */}
        {isSelected && (
          <button
            onClick={e => {
              e.stopPropagation();
              const link = document.createElement('a');
              link.href = image.src;
              link.download = `image-${image.id}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="absolute top-2 right-2 bg-black/80 hover:bg-black/90 text-white rounded-full p-1 shadow-lg z-[100] border-2 border-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            title="Download image"
            style={{ cursor: 'pointer', pointerEvents: 'auto' }}
          >
            <DownloadSimple size={22} weight="bold" />
          </button>
        )}
        {/* Selection Border */}
        {isSelected && (
          <div 
            className="absolute inset-0 border-2 border-blue-500 pointer-events-none"
            style={{ margin: '-2px' }}
          />
        )}
      </div>

      {/* Selection Handles */}
      {isSelected && getHandles().map(handle => (
        <div
          key={handle.id}
          className={`absolute z-30 cursor-${handle.id === 'nw' || handle.id === 'se' ? 'nw' : 
            handle.id === 'ne' || handle.id === 'sw' ? 'ne' : 
            handle.id === 'n' || handle.id === 's' ? 'ns' : 'ew'}-resize`}
          style={{
            left: handle.screenX - 6,
            top: handle.screenY - 6,
            width: '12px',
            height: '12px',
          }}
          onMouseDown={(e) => handleHandleMouseDown(e, handle.id)}
        >
          <div 
            className={`w-full h-full rounded-full border-2 ${
              handle.type === 'corner' 
                ? 'bg-white border-blue-500' 
                : 'bg-blue-500 border-blue-600'
            }`}
          />
        </div>
      ))}
    </>
  );
};