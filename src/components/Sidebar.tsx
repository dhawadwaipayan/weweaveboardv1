import React, { useState, useEffect } from 'react';
import { ArrowsOutCardinal, PaintBrush, Shapes, TextT, RectangleDashed, Hand, DownloadSimple } from '@phosphor-icons/react';

interface SidebarProps {
  onToolSelect?: (toolId: string) => void;
  selectedImageSrc?: string | null;
}
export const Sidebar: React.FC<SidebarProps> = ({
  onToolSelect,
  selectedImageSrc
}) => {
  const [selectedTool, setSelectedTool] = useState<string>('select');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const storedKey = localStorage.getItem('OPENAI_API_KEY') || '';
    setApiKey(storedKey);
  }, []);

  const handleApiKeySave = () => {
    localStorage.setItem('OPENAI_API_KEY', apiKey);
    setShowApiKeyInput(false);
  };

  const tools = [{
    id: 'select',
    icon: ArrowsOutCardinal,
    label: 'Select'
  }, {
    id: 'hand',
    icon: Hand,
    label: 'Hand'
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
    setSelectedTool(toolId);
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
      {/* Download button */}
      <button
        className={`group flex items-center justify-center w-[30px] h-[30px] rounded-lg transition-colors duration-75 ${selectedImageSrc ? '' : 'opacity-50 cursor-not-allowed'}`}
        title="Download selected image"
        disabled={!selectedImageSrc}
        onClick={() => {
          if (!selectedImageSrc) return;
          const link = document.createElement('a');
          link.href = selectedImageSrc;
          link.download = 'selected-image.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }}
      >
        <DownloadSimple size={20} color={selectedImageSrc ? '#fff' : '#A9A9A9'} className="group-hover:!text-white transition-colors duration-75" />
      </button>
      {/* Add API Key button */}
      <button
        className="group flex items-center justify-center w-[30px] h-[30px] rounded-lg transition-colors duration-75"
        title="Set OpenAI API Key"
        onClick={() => setShowApiKeyInput((v) => !v)}
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 17v.01M7 17v.01M17 17v.01M3 21V7a2 2 0 0 1 2-2h4V3a2 2 0 1 1 4 0v2h4a2 2 0 0 1 2 2v14H3Zm2-4h14" stroke="#E1FF00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      {showApiKeyInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#232323] p-6 rounded-xl shadow-lg flex flex-col gap-4 min-w-[320px]">
            <label className="text-white font-medium">Enter OpenAI API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#1a1a1a] text-white border border-[#373737] focus:outline-none"
              placeholder="sk-..."
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowApiKeyInput(false)} className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700">Cancel</button>
              <button onClick={handleApiKeySave} className="px-4 py-2 rounded bg-[#E1FF00] text-black font-bold hover:bg-[#d4e900]">Save</button>
            </div>
          </div>
        </div>
      )}
    </aside>;
};