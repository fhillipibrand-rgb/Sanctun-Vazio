import { useState, useEffect } from 'react';

export interface ActiveFocusState {
  id: 'deep-work' | 'creative' | 'routine';
  name: string;
  color: string;
  isRunning: boolean;
  isBreak: boolean;
  timeLeft: number;
  targetEndTime: number | null;
}

export const useActiveFocus = () => {
  const [focusState, setFocusState] = useState<ActiveFocusState | null>(() => {
    const raw = localStorage.getItem('sanctum_active_focus');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return null;
  });

  useEffect(() => {
    const sync = () => {
      const raw = localStorage.getItem('sanctum_active_focus');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          setFocusState(parsed);
        } catch {}
      } else {
        setFocusState(null);
      }
    };
    
    // Escuta eventos de storage para sincronização entre abas/janelas
    window.addEventListener('storage', sync);
    // Intervalo de 1s para atualizações na mesma aba
    const interval = setInterval(sync, 1000);
    
    return () => {
      window.removeEventListener('storage', sync);
      clearInterval(interval);
    };
  }, []);

  return focusState;
};
