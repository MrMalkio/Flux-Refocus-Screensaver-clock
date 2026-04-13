import { useEffect, useRef, useState } from 'react';
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
    const currRef = useRef(digit);
    const [prev, setPrev] = useState(digit);
    const [display, setDisplay] = useState(digit);
    const [flipping, setFlipping] = useState(false);

    useEffect(() => {
        if (digit !== currRef.current) {
            // Start flip: old digit → new digit
            setPrev(currRef.current);
            setDisplay(digit);
            currRef.current = digit;
            setFlipping(true);

            const t = setTimeout(() => {
                setFlipping(false);
                setPrev(digit);
            }, 1100);
            return () => clearTimeout(t);
        }
    }, [digit]);

    // At rest (not flipping): both halves show display, flaps hidden via CSS
    // During flip: digital-top=display(new), digital-bottom=prev(old),
    //   flap-top=prev(old, folds down), flap-bottom=display(new, unfolds)
    return (
        <div className={`flip-digit ${flipping ? 'flipping' : ''}`}>
            <div className="digital-top">{display}</div>
            <div className="digital-bottom">{flipping ? prev : display}</div>
            <div className="digital-flap flap-top" data-content={prev}></div>
            <div className="digital-flap flap-bottom" data-content={display}></div>
        </div>
    );
};
