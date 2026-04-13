import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import '@fontsource/bebas-neue';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import './FlipClock.css';

export interface ClockSettings {
    is24Hour: boolean;
    scale: number;       // 0.5 – 3.0 (1.5 = default)
    brightness: number;  // 0.2 – 1.0 (1.0 = full brightness)
    textColor: string;   // hex color
}

const DEFAULT_SETTINGS: ClockSettings = {
    is24Hour: false,
    scale: 1.5,
    brightness: 1.0,
    textColor: '#e0e0e0'
};

export function loadSettings(): ClockSettings {
    try {
        const saved = localStorage.getItem('fluxSettings');
        if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch { /* ignore */ }
    return DEFAULT_SETTINGS;
}

export function saveSettings(settings: ClockSettings) {
    localStorage.setItem('fluxSettings', JSON.stringify(settings));
    // Keep legacy key in sync for backward compatibility
    localStorage.setItem('is24Hour', settings.is24Hour.toString());
}

interface FlipClockProps {
    previewOnly?: boolean;
    settings?: ClockSettings;
}

export const FlipClock = ({ previewOnly = false, settings }: FlipClockProps) => {
    const [time, setTime] = useState(new Date());
    const config = settings || loadSettings();

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    let hours = time.getHours();
    const isPM = hours >= 12;
    if (!config.is24Hour) {
        hours = hours % 12 || 12; 
    }
    const hString = hours < 10 ? `0${hours}` : `${hours}`;
    const mString = time.getMinutes() < 10 ? `0${time.getMinutes()}` : `${time.getMinutes()}`;

    // Apply CSS custom properties for settings
    const cssVars: CSSProperties & Record<string, string> = {
        '--clock-scale': String(config.scale),
        '--clock-brightness': String(config.brightness),
        '--clock-text-color': config.textColor,
    };

    // Exit detection — mouse movement + keyboard + mouse click
    useEffect(() => {
      if (previewOnly) return;

      let cleanup: (() => void) | undefined;

      // Delay exit detection to avoid false triggers during startup
      const startupDelay = setTimeout(() => {
        const quitScreensaver = () => {
          if ((window as any).require) {
            const { ipcRenderer } = (window as any).require('electron');
            ipcRenderer.send('quit-screensaver');
          }
        };

        let lastX: number | null = null;
        let lastY: number | null = null;

        const handleMouseMove = (e: MouseEvent) => {
          if (lastX === null || lastY === null) {
             lastX = e.clientX;
             lastY = e.clientY;
             return;
          }
          const deltaX = Math.abs(e.clientX - lastX);
          const deltaY = Math.abs(e.clientY - lastY);
          if (deltaX > 10 || deltaY > 10) {
              quitScreensaver();
          }
        };

        const handleKeyDown = () => quitScreensaver();
        const handleMouseDown = () => quitScreensaver();

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('mousedown', handleMouseDown);

        cleanup = () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('keydown', handleKeyDown);
          window.removeEventListener('mousedown', handleMouseDown);
        };
      }, 3000);

      return () => {
        clearTimeout(startupDelay);
        cleanup?.();
      };
    }, [previewOnly]);

    return (
        <div className="clock-container" style={cssVars}>
            <div className="flip-group">
                <FlipDigit digit={hString.charAt(0)} />
                <FlipDigit digit={hString.charAt(1)} />
            </div>
            <div className="clock-colon">:</div>
            <div className="flip-group">
                <FlipDigit digit={mString.charAt(0)} />
                <FlipDigit digit={mString.charAt(1)} />
            </div>
            {!config.is24Hour && <div className="am-pm">{isPM ? 'PM' : 'AM'}</div>}
        </div>
    );
};

// Flip digit with dramatic 3D animation
const FlipDigit = ({ digit }: { digit: string }) => {
    const [prev, setPrev] = useState(digit);
    const [curr, setCurr] = useState(digit);
    const [flipping, setFlipping] = useState(false);

    useEffect(() => {
        if (digit !== curr) {
            setPrev(curr);
            setCurr(digit);
            setFlipping(true);
            // 0.5s top + 0.4s bottom + 0.5s delay = ~1.0s total
            const t = setTimeout(() => setFlipping(false), 1100);
            return () => clearTimeout(t);
        }
    }, [digit, curr]);

    return (
        <div className={`flip-digit ${flipping ? 'flipping' : ''}`}>
            <div className="digital-top">{curr}</div>
            <div className="digital-bottom">{prev}</div>
            <div className="digital-flap flap-top" data-content={prev}></div>
            <div className="digital-flap flap-bottom" data-content={curr}></div>
        </div>
    );
};
