import React, { useState } from 'react';
import { ArrowsOutCardinal, PaintBrush, Shapes, TextT, RectangleDashed } from '@phosphor-icons/react';

interface SidebarProps {
  onToolSelect?: (toolId: string) => void;
}
export const Sidebar: React.FC<SidebarProps> = ({
  onToolSelect
}) => {
  const [selectedTool, setSelectedTool] = useState<string>('');
  const tools = [{
    id: 'move',
    icon: ArrowsOutCardinal,
    label: 'Move'
  }, {
    id: 'draw',
    icon: PaintBrush,
    label: 'Draw'
  }, {
    id: 'shape',
    icon: Shapes,
    label: 'Shape'
  }, {
    id: 'text',
    icon: TextT,
    label: 'Text'
  }, {
    id: 'frame',
    icon: RectangleDashed,
    label: 'Frame'
  }];
  const handleToolSelect = (toolId: string) => {
    setSelectedTool(selectedTool === toolId ? '' : toolId);
    onToolSelect?.(toolId);
    console.log(`Selected tool: ${toolId}`);
  };
  return <aside className="fixed left-6 top-1/2 transform -translate-y-1/2 z-50 w-[45px] bg-[#1a1a1a] border border-[#373737] rounded-xl py-4 px-3 flex flex-col gap-3 items-center shadow-lg">
      {tools.map(tool => {
        const IconComponent = tool.icon;
        const isActive = selectedTool === tool.id;
        const iconColor = isActive ? '#E1FF00' : '#A9A9A9';
        
        return (
          <button 
            key={tool.id} 
            onClick={() => handleToolSelect(tool.id)} 
            className="group flex items-center justify-center w-[30px] h-[30px] rounded-lg transition-colors duration-75" 
            title={tool.label}
          >
            <IconComponent 
              size={20} 
              color={isActive ? '#E1FF00' : '#A9A9A9'}
              className="group-hover:!text-white transition-colors duration-75"
            />
          </button>
        );
      })}
    </aside>;
};