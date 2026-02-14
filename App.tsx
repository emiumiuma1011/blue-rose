
import React, { useState, useEffect } from 'react';
import RoseVisualizer from './components/RoseVisualizer';
import UIOverlay from './components/UIOverlay';

const App: React.FC = () => {
  const [isAssembled, setIsAssembled] = useState(false);

  useEffect(() => {
    // Start assembly animation after a short delay
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
