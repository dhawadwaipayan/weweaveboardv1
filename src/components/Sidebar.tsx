import React, { useState } from 'react';
import { ArrowsOutCardinal, PaintBrush, Shapes, TextT, Palette } from '@phosphor-icons/react';

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
    id: 'color',
    icon: Palette,
    label: 'Color'
  }];
  const handleToolSelect = (toolId: string) => {
    setSelectedTool(selectedTool === toolId ? '' : toolId);
    onToolSelect?.(toolId);
    console.log(`Selected tool: ${toolId}`);
  };
  return <aside className="fixed left-6 top-1/2 transform -translate-y-1/2 z-50 w-[45px] bg-[#1a1a1a] border border-[#373737] rounded-xl p-3 flex flex-col gap-6 items-center shadow-lg">
      {tools.map(tool => {
        const IconComponent = tool.icon;
        const isActive = selectedTool === tool.id;
        const iconColor = isActive ? '#E1FF00' : '#A9A9A9';
        
        return (
          <button 
            key={tool.id} 
            onClick={() => handleToolSelect(tool.id)} 
            className="group flex items-center justify-center w-[30px] h-[30px] rounded-lg hover:bg-[#2a2a2a] transition-colors duration-75" 
            title={tool.label}
          >
            <IconComponent 
              size={20} 
              color={iconColor}
              className="group-hover:text-white transition-colors duration-75"
              style={{ color: isActive ? '#E1FF00' : undefined }}
            />
          </button>
        );
      })}
    </aside>;
};