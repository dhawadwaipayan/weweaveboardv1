import React, { useState } from 'react';
interface SidebarProps {
  onToolSelect?: (toolId: string) => void;
}
export const Sidebar: React.FC<SidebarProps> = ({
  onToolSelect
}) => {
  const [selectedTool, setSelectedTool] = useState<string>('');
  const tools = [{
    id: 'move',
    defaultIcon: encodeURI('/Property 1=Move_Default.svg'),
    hoverIcon: encodeURI('/Property 1=Variant48.svg'),
    activeIcon: encodeURI('/Property 1=Variant52.svg'),
    label: 'Move'
  }, {
    id: 'draw',
    defaultIcon: encodeURI('/Property 1=Draw_Default.svg'),
    hoverIcon: encodeURI('/Property 1=Variant47.svg'),
    activeIcon: encodeURI('/Property 1=Variant51.svg'),
    label: 'Draw'
  }, {
    id: 'shape',
    defaultIcon: encodeURI('/Property 1=Shape_Default.svg'),
    hoverIcon: encodeURI('/Property 1=Variant46.svg'),
    activeIcon: encodeURI('/Property 1=Variant50.svg'),
    label: 'Shape'
  }, {
    id: 'text',
    defaultIcon: encodeURI('/Property 1=Text_Default.svg'),
    hoverIcon: encodeURI('/Property 1=Variant45.svg'),
    activeIcon: encodeURI('/Property 1=Variant49.svg'),
    label: 'Text'
  }, {
    id: 'color',
    defaultIcon: encodeURI('/Property 1=Variant53.svg'),
    hoverIcon: encodeURI('/Property 1=Variant54.svg'),
    activeIcon: encodeURI('/Property 1=Variant55.svg'),
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