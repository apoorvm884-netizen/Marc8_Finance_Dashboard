import { useEffect, useCallback } from 'react';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  handler: () => void;
  enabled?: boolean;
}

const MODIFIERS = ['Control', 'Meta', 'Shift', 'Alt'] as const;

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const handler = useCallback(
    (event: KeyboardEvent) => {
      if (MODIFIERS.includes(event.key as typeof MODIFIERS[number])) return;

      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue;
        const ctrlOrMeta = shortcut.ctrl || shortcut.meta;
        const metaMatch = shortcut.meta ? event.metaKey : true;
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey : true;
        const shiftMatch = shortcut.shift ? event.shiftKey : true;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlOrMeta) {
          if ((event.metaKey || event.ctrlKey) && keyMatch && shiftMatch) {
            event.preventDefault();
            shortcut.handler();
            return;
          }
        } else if (metaMatch && ctrlMatch && keyMatch && shiftMatch) {
          event.preventDefault();
          shortcut.handler();
          return;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [handler]);
}
