import React, { useState, useRef } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { GenerationPanel } from '@/components/GenerationPanel';
import { ModePanel } from '@/components/ModePanel';
import { Canvas, CanvasHandle } from '@/components/Canvas';
import { TopBar } from '@/components/TopBar';

const Index = () => {
  const [selectedTool, setSelectedTool] = useState('select');
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const canvasRef = useRef<CanvasHandle>(null);
  
  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
    console.log(`Tool selected: ${toolId}`);
  };

  // Handler to be called when Sketch mode is activated
  const handleSketchModeActivated = () => {
    setSelectedTool('select');
  };

  return (
    <main className="bg-[rgba(33,33,33,1)] flex flex-col overflow-hidden min-h-screen relative">
      {/* Canvas Background - behind everything */}
      <Canvas ref={canvasRef} selectedTool={selectedTool} onSelectedImageSrcChange={setSelectedImageSrc} />
      
      {/* Sidebar - positioned center left */}
      <Sidebar onToolSelect={handleToolSelect} selectedImageSrc={selectedImageSrc} selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
      
      {/* UI Overlay - above canvas */}
      <div className="relative z-10 flex flex-col pl-[37px] pr-20 py-[34px] min-h-screen max-md:px-5 pointer-events-none">
        {/* Top Bar - positioned top left */}
        <div className="absolute top-[34px] left-6 pointer-events-auto">
          <TopBar />
        </div>
        
        <div className="flex flex-1 relative">
          <div className="flex-1" />
          
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2.5 pointer-events-auto">
            <GenerationPanel />
            <ModePanel canvasRef={canvasRef} onSketchModeActivated={handleSketchModeActivated} />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Index;
