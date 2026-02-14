
import React from 'react';

interface UIOverlayProps {
  assembled: boolean;
  onToggle: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ assembled, onToggle }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between pointer-events-none p-10 z-10 select-none">
      <div className={`transition-all duration-1000 transform ${assembled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
        <h1 className="text-4xl md:text-6xl font-serif text-blue-200 tracking-widest text-center filter drop-shadow-[0_0_15px_rgba(147,197,253,0.5)]">
          Happy
        </h1>
        <p className="mt-4 text-xl md:text-2xl text-blue-400 font-light tracking-[0.4em] text-center uppercase">
          Valentine's Day
        </p>
      </div>

      <div className="flex flex-col items-center gap-6 pointer-events-auto">
        <button
          onClick={onToggle}
          className="px-8 py-3 rounded-full border border-blue-400/30 bg-blue-900/10 backdrop-blur-md text-blue-200 text-sm tracking-widest hover:bg-blue-400/20 transition-all duration-500 hover:scale-105 active:scale-95 filter drop-shadow-md"
        >
          {assembled ? "SCATTER STARS" : "BLOOM ROSE"}
        </button>

        <div className="text-lg text-blue-300/70 tracking-[0.8em] text-center font-light uppercase">
          TO LV
        </div>
      </div>
      
      {/* Decorative gradient corners */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-900/10 blur-[100px] -z-10 rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-900/10 blur-[100px] -z-10 rounded-full"></div>
    </div>
  );
};

export default UIOverlay;
