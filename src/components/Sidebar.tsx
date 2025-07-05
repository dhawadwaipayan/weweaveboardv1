import React, { useState } from 'react';

import moveDefault from '@/assets/move-default.svg';
import moveHover from '@/assets/move-hover.svg';
import moveActive from '@/assets/move-active.svg';
import drawDefault from '@/assets/draw-default.svg';
import drawHover from '@/assets/draw-hover.svg';
import drawActive from '@/assets/draw-active.svg';
import shapeDefault from '@/assets/shape-default.svg';
import shapeHover from '@/assets/shape-hover.svg';
import shapeActive from '@/assets/shape-active.svg';
import textDefault from '@/assets/text-default.svg';
import textHover from '@/assets/text-hover.svg';
import textActive from '@/assets/text-active.svg';
import colorDefault from '@/assets/color-default.svg';
import colorHover from '@/assets/color-hover.svg';
import colorActive from '@/assets/color-active.svg';

interface SidebarProps {
  onToolSelect?: (toolId: string) => void;
}
export const Sidebar: React.FC<SidebarProps> = ({
  onToolSelect
}) => {
  const [selectedTool, setSelectedTool] = useState<string>('');
  const tools = [{
    id: 'move',
    defaultIcon: moveDefault,
    hoverIcon: moveHover,
    activeIcon: moveActive,
    label: 'Move'
  }, {
    id: 'draw',
    defaultIcon: drawDefault,
    hoverIcon: drawHover,
    activeIcon: drawActive,
    label: 'Draw'
  }, {
    id: 'shape',
    defaultIcon: shapeDefault,
    hoverIcon: shapeHover,
    activeIcon: shapeActive,
    label: 'Shape'
  }, {
    id: 'text',
    defaultIcon: textDefault,
    hoverIcon: textHover,
    activeIcon: textActive,
    label: 'Text'
  }, {
    id: 'color',
    defaultIcon: colorDefault,
    hoverIcon: colorHover,
    activeIcon: colorActive,
    label: 'Color'
  }];
  const handleToolSelect = (toolId: string) => {
    setSelectedTool(selectedTool === toolId ? '' : toolId);
    onToolSelect?.(toolId);
    console.log(`Selected tool: ${toolId}`);
  };
  const getIconSrc = (tool: typeof tools[0], isHovered: boolean) => {
    if (selectedTool === tool.id) return tool.activeIcon;
    if (isHovered) return tool.hoverIcon;
    return tool.defaultIcon;
  };
  return <aside className="fixed left-6 top-1/2 transform -translate-y-1/2 z-20 bg-[#1a1a1a] border border-[#373737] rounded-xl p-3 flex flex-col gap-2 px-[3px]">
      {tools.map(tool => <button key={tool.id} onClick={() => handleToolSelect(tool.id)} className="group flex items-center justify-center w-[45px] h-[45px] rounded-lg" title={tool.label}>
          <img 
            src={getIconSrc(tool, false)} 
            alt={tool.label} 
            width="30" 
            height="30" 
            className="w-[30px] h-[30px] group-hover:opacity-0 transition-opacity duration-75"
            onError={(e) => {
              console.error(`Failed to load icon: ${getIconSrc(tool, false)}`);
              e.currentTarget.style.display = 'none';
            }}
            onLoad={() => console.log(`Loaded icon: ${getIconSrc(tool, false)}`)}
          />
          <img 
            src={getIconSrc(tool, true)} 
            alt={tool.label} 
            width="30" 
            height="30" 
            className="w-[30px] h-[30px] absolute opacity-0 group-hover:opacity-100 transition-opacity duration-75"
            onError={(e) => {
              console.error(`Failed to load hover icon: ${getIconSrc(tool, true)}`);
              e.currentTarget.style.display = 'none';
            }}
            onLoad={() => console.log(`Loaded hover icon: ${getIconSrc(tool, true)}`)}
          />
        </button>)}
    </aside>;
};