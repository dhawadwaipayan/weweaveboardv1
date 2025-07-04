import React, { useState, useRef } from 'react';

interface ButtonProps {
  defaultIcon: string;
  hoverIcon: string;
  clickedIcon: string;
  label: string;
  onClick: () => void;
}

const TopBarButton: React.FC<ButtonProps> = ({ 
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
      className="flex items-center gap-2.5 justify-center px-2.5 py-2 text-sm whitespace-nowrap min-h-[30px] cursor-pointer transition-colors text-neutral-400 hover:text-white"
      aria-label={label}
    >
      <img 
        src={getCurrentIcon()} 
        alt={label}
        className="w-[30px] h-[30px] object-contain"
      />
      <span className="self-stretch my-auto">{label}</span>
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
    <div className="flex items-center gap-4 bg-[#1a1a1a] border border-[#373737] rounded-xl px-4 py-2 h-[45px] pointer-events-auto">
      {/* Hidden file input */}
      <input 
        ref={fileInputRef} 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange} 
        className="hidden" 
      />
      
      {/* Logo */}
      <div className="flex items-center">
        <img 
          src="/BRANDLOGO.svg" 
          alt="wwb Logo" 
          className="h-[15px] w-[38px] object-contain" 
        />
      </div>
      
      {/* Divider */}
      <div className="bg-[#373737] w-px h-[21px]" />
      
      {/* Board Name */}
      <span className="text-white text-sm font-normal">Board 1</span>
      
      {/* Divider */}
      <div className="bg-[#373737] w-px h-[21px]" />
      
      {/* Action Buttons */}
      <div className="flex items-center gap-2">
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