'use client';

import { useEffect, useState } from 'react';

export default function Topbar({ title, onMenuToggle }) {
  const [nightMode, setNightMode] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('esisa_night_mode') === 'true') {
      document.body.classList.add('night-mode');
      setNightMode(true);
    }
  }, []);

  const toggleNight = () => {
    document.body.classList.toggle('night-mode');
    const isNight = document.body.classList.contains('night-mode');
    localStorage.setItem('esisa_night_mode', isNight);
    setNightMode(isNight);
  };

  return (
    <header className="topbar">
      <button className="menu-toggle" onClick={onMenuToggle} aria-label="Toggle sidebar">
        ☰
      </button>
      <h2 className="topbar-title">{title}</h2>
      <div className="topbar-actions">
        <button
          className="night-toggle"
          onClick={toggleNight}
          aria-label="Toggle night mode"
          title="Night Mode"
        />
      </div>
    </header>
  );
}
