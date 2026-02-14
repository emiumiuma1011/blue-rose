
import React, { useState, useEffect } from 'react';
import RoseVisualizer from './components/RoseVisualizer.tsx';
import UIOverlay from './components/UIOverlay.tsx';

const App: React.FC = () => {
  const [isAssembled, setIsAssembled] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsAssembled(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-screen h-screen bg-[#050510]">
      <RoseVisualizer assembled={isAssembled} />
      <UIOverlay assembled={isAssembled} onToggle={() => setIsAssembled(!isAssembled)} />
    </div>
  );
};

export default App;
