import React, { useState } from 'react';

const UserBar: React.FC = () => {
  const [activeBtn, setActiveBtn] = useState<'share' | 'logout' | null>(null);

  const getTextColor = (btn: 'share' | 'logout') =>
    activeBtn === btn
      ? 'text-[#E1FF00]'
      : 'hover:text-white text-neutral-400';

  return (
    <div className="flex items-center bg-[#1a1a1a] border border-[#373737] rounded-xl h-[45px] px-4 gap-2">
      <button
        className={`font-gilroy font-bold text-sm transition-colors px-2.5 py-2 whitespace-nowrap min-h-[30px] cursor-pointer ${getTextColor('share')}`}
        onMouseDown={() => setActiveBtn('share')}
        onMouseUp={() => setActiveBtn(null)}
        onMouseLeave={() => setActiveBtn(null)}
        type="button"
      >
        Share
      </button>
      <button
        className={`font-gilroy font-bold text-sm transition-colors px-2.5 py-2 whitespace-nowrap min-h-[30px] cursor-pointer ${getTextColor('logout')}`}
        onMouseDown={() => setActiveBtn('logout')}
        onMouseUp={() => setActiveBtn(null)}
        onMouseLeave={() => setActiveBtn(null)}
        type="button"
      >
        Log out
      </button>
      <div className="h-8 w-px bg-[#232323] mx-2" />
      <div className="w-[25px] h-[25px] rounded-full bg-[#EDEDED] flex items-center justify-center">
        <span className="font-gilroy text-sm text-[#232323] font-bold leading-none" style={{fontSize: '14px'}}>U1</span>
      </div>
    </div>
  );
};

export default UserBar; 