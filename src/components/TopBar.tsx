import React, { useRef, useState } from 'react';

interface TopBarButtonProps {
  defaultIcon: string;
  hoverIcon: string;
  clickedIcon: string;
  label: string;
  onClick: () => void;
}

const TopBarButton: React.FC<TopBarButtonProps> = ({ 
  defaultIcon, 
  hoverIcon, 
  clickedIcon, 
  label, 
  onClick 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    onClick();
    setTimeout(() => setIsClicked(false), 150);
  };

  const getCurrentIcon = () => {
    if (isClicked) return clickedIcon;
    if (isHovered) return hoverIcon;
    return defaultIcon;
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex items-center justify-center w-[30px] h-[30px] transition-all duration-150"
      aria-label={label}
    >
      <img 
        src={getCurrentIcon()} 
        alt={label}
        className="w-full h-full object-contain"
      />
    </button>
  );
};

export const TopBar: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImport = () => {
    console.log('TopBar: Import button clicked');
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('TopBar: File selected:', file?.name, file?.type);
    if (file && file.type.startsWith('image/')) {
      console.log('TopBar: Valid image file, calling canvas import handler');
      if ((window as any).handleCanvasImageImport) {
        (window as any).handleCanvasImageImport(file);
        console.log('TopBar: Canvas import handler called successfully');
      } else {
        console.error('TopBar: Canvas import handler not found on window object');
      }
    } else {
      console.log('TopBar: Invalid file type or no file selected');
    }
    event.target.value = '';
  };
  
  const handleExport = () => {
    console.log('Export clicked');
  };
  
  const handleUndo = () => {
    console.log('Undo clicked');
  };
  
  const handleRedo = () => {
    console.log('Redo clicked');
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-[rgba(26,26,26,1)] shadow-[5px_4px_30px_rgba(0,0,0,0.25)] border rounded-xl border-[rgba(255,255,255,0.1)] border-solid p-2">
      {/* Hidden file input */}
      <input 
        ref={fileInputRef} 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange} 
        className="hidden" 
      />
      
      <div className="flex items-center gap-[15px]">
        <TopBarButton
          defaultIcon="/Property 1=Import_Default.svg"
          hoverIcon="/Property 1=Import_Hover.svg"
          clickedIcon="/Property 1=Import_Clicked.svg"
          label="Import"
          onClick={handleImport}
        />
        
        <TopBarButton
          defaultIcon="/Property 1=Export_Default.svg"
          hoverIcon="/Property 1=Export_Hover.svg"
          clickedIcon="/Property 1=Export_Clicked.svg"
          label="Export"
          onClick={handleExport}
        />
        
        <TopBarButton
          defaultIcon="/Property 1=Undo_Default.svg"
          hoverIcon="/Property 1=Undo_Hover.svg"
          clickedIcon="/Property 1=Undo_Clicked.svg"
          label="Undo"
          onClick={handleUndo}
        />
        
        <TopBarButton
          defaultIcon="/Property 1=Redo_Default.svg"
          hoverIcon="/Property 1=Redo_Hover.svg"
          clickedIcon="/Property 1=Redo_Clicked.svg"
          label="Redo"
          onClick={handleRedo}
        />
      </div>
    </div>
  );
};