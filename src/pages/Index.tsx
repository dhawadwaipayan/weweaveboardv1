
import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { GenerationPanel } from '@/components/GenerationPanel';
import { ModePanel } from '@/components/ModePanel';
import { Canvas } from '@/components/Canvas';

const Index = () => {
  const handleToolSelect = (toolId: string) => {
    console.log(`Tool selected: ${toolId}`);
  };

  return (
    <main className="bg-[rgba(33,33,33,1)] flex flex-col overflow-hidden min-h-screen relative">
      {/* Canvas Background - behind everything */}
      <Canvas />
      
      {/* Sidebar - positioned center left */}
      <Sidebar onToolSelect={handleToolSelect} />
      
      {/* UI Overlay - above canvas */}
      <div className="relative z-10 flex flex-col pl-[37px] pr-20 py-[34px] min-h-screen max-md:px-5 pointer-events-none">        
        <div className="flex flex-1 relative">
          <div className="flex-1" />
          
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2.5 pointer-events-auto">
            <GenerationPanel />
            <ModePanel />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Index;
