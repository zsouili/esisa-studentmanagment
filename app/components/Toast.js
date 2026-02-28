'use client';

import { useEffect, useState, useCallback } from 'react';

let toastTimer;

export function showToast(msg, duration = 3000) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('esisa-toast', { detail: { msg, duration } }));
}

export default function Toast() {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  const handleToast = useCallback((e) => {
    const { msg, duration } = e.detail;
    setMessage(msg);
    setVisible(true);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => setVisible(false), duration || 3000);
  }, []);

  useEffect(() => {
    window.addEventListener('esisa-toast', handleToast);
    return () => window.removeEventListener('esisa-toast', handleToast);
  }, [handleToast]);

  return (
    <div className={`toast ${visible ? 'visible' : ''}`}>
      {message}
    </div>
  );
}
