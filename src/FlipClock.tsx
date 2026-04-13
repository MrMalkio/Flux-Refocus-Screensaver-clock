import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import '@fontsource/bebas-neue';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import './FlipClock.css';

export interface ClockSettings {
    is24Hour: boolean;
    scale: number;          // 0.5 – 3.5
    brightness: number;     // 0.1 – 1.0
    textColor: string;      // hex color
    // Visibility
    showClock: boolean;
    showCountdown: boolean;
    // Countdown-specific
    countdownScale: number;   // 0.5 – 3.5
    countdownColor: string;   // hex color
    // Layout
    clockPosition: 'top' | 'bottom'; // where the time clock sits relative to countdown
}

const DEFAULT_SETTINGS: ClockSettings = {
    is24Hour: false,
    scale: 1.5,
    brightness: 1.0,
    textColor: '#e0e0e0',
    showClock: true,
    showCountdown: false,
    countdownScale: 1.0,
    countdownColor: '#448aff',
    clockPosition: 'top',
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

    // ── Time calculation ──
    let hours = time.getHours();
    const isPM = hours >= 12;
    if (!config.is24Hour) {
        hours = hours % 12 || 12;
    }
    const hString = hours < 10 ? `0${hours}` : `${hours}`;
    const mString = time.getMinutes() < 10 ? `0${time.getMinutes()}` : `${time.getMinutes()}`;

    // ── Countdown calculation: minutes remaining in the day ──
    const minutesPassed = time.getHours() * 60 + time.getMinutes();
    const minutesRemaining = 1440 - minutesPassed;
    const countdownStr = String(minutesRemaining).padStart(4, '0');

    // ── Build the two display elements ──
    const clockElement = config.showClock ? (
        <div
            className="clock-container"
            style={{
                '--clock-scale': String(config.scale),
                '--clock-brightness': String(config.brightness),
                '--clock-text-color': config.textColor,
            } as CSSProperties & Record<string, string>}
        >
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
    ) : null;

    const countdownElement = config.showCountdown ? (
        <div
            className="clock-container countdown-container"
            style={{
                '--clock-scale': String(config.countdownScale),
                '--clock-brightness': String(config.brightness),
                '--clock-text-color': config.countdownColor,
            } as CSSProperties & Record<string, string>}
        >
            <div className="countdown-label">MINUTES LEFT TODAY</div>
            <div className="flip-group">
                {/* Only show leading digits if needed */}
                {minutesRemaining >= 1000 && <FlipDigit digit={countdownStr.charAt(0)} />}
                {minutesRemaining >= 100 && <FlipDigit digit={countdownStr.charAt(1)} />}
                {minutesRemaining >= 10 && <FlipDigit digit={countdownStr.charAt(2)} />}
                <FlipDigit digit={countdownStr.charAt(3)} />
            </div>
        </div>
    ) : null;

    // ── Order based on clockPosition ──
    const topElement = config.clockPosition === 'top' ? clockElement : countdownElement;
    const bottomElement = config.clockPosition === 'top' ? countdownElement : clockElement;

    // Exit detection — mouse movement + keyboard + mouse click
    useEffect(() => {
      if (previewOnly) return;

      let cleanup: (() => void) | undefined;

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
        <div className="screensaver-layout">
            {topElement}
            {topElement && bottomElement && <div className="layout-spacer" />}
            {bottomElement}
        </div>
    );
};

// ── Flip digit with dramatic 3D animation ──
const FlipDigit = ({ digit }: { digit: string }) => {
    const currRef = useRef(digit);
    const [prev, setPrev] = useState(digit);
    const [display, setDisplay] = useState(digit);
    const [flipping, setFlipping] = useState(false);

    useEffect(() => {
        if (digit !== currRef.current) {
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

    return (
        <div className={`flip-digit ${flipping ? 'flipping' : ''}`}>
            <div className="digital-top">{display}</div>
            <div className="digital-bottom">{flipping ? prev : display}</div>
            <div className="digital-flap flap-top" data-content={prev}></div>
            <div className="digital-flap flap-bottom" data-content={display}></div>
        </div>
    );
};
