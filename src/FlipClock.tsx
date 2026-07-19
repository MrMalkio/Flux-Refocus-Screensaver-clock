import { useEffect, useRef, useState, useCallback } from 'react';
import type { CSSProperties } from 'react';
import '@fontsource/bebas-neue';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import './FlipClock.css';

// ════════════════════════════════════════════
// Settings Interface
// ════════════════════════════════════════════

export interface ClockSettings {
    // Clock
    showClock: boolean;
    is24Hour: boolean;
    showClockSeconds: boolean;
    scale: number;                // 0.5 – 3.5
    clockBrightness: number;      // 0.1 – 1.0
    textColor: string;            // hex color

    // Countdown
    showCountdown: boolean;
    showCountdownSeconds: boolean;
    countdownMode: 'daily' | 'custom';
    countdownDisplayFormat: 'MMMMss' | 'MMMM:SS' | 'HH:MM:SS';
    customCountdownTarget: string; // HH:MM (24h format)
    countdownScale: number;        // 0.5 – 3.5
    countdownBrightness: number;   // 0.1 – 1.0
    countdownColor: string;        // hex color
    enableZeroPulse: boolean;
    zeroPulseSpeed: number;        // 0.5 - 5.0

    // Layout
    clockPosition: 'top' | 'bottom';
    clockVerticalOffset: number;  // 0–100
    elementSpacing: number;       // 0–200 px

    // Session info
    showSessionDuration: boolean;
    showLastActive: boolean;
    infoScale: number;            // 0.3 – 1.0

    // Background
    backgroundImage: string;      // file path or empty
    backgroundOpacity: number;    // 0.0 – 1.0

    // Animation
    flipSpeed: number;            // 0.3 – 1.5 (seconds, base duration)

    // Tabatha
    enableTabathaContextView: boolean; // show the live Tabatha Context View on the primary display instead of the flip clock
}

const DEFAULT_SETTINGS: ClockSettings = {
    showClock: true,
    is24Hour: false,
    showClockSeconds: false,
    scale: 1.5,
    clockBrightness: 1.0,
    textColor: '#e0e0e0',

    showCountdown: false,
    showCountdownSeconds: true,
    countdownMode: 'daily',
    countdownDisplayFormat: 'MMMMss',
    customCountdownTarget: '17:00',
    countdownScale: 1.0,
    countdownBrightness: 1.0,
    countdownColor: '#448aff',
    enableZeroPulse: true,
    zeroPulseSpeed: 2.0,

    clockPosition: 'top',
    clockVerticalOffset: 50,
    elementSpacing: 30,

    showSessionDuration: false,
    showLastActive: false,
    infoScale: 0.6,

    backgroundImage: '',
    backgroundOpacity: 0.3,

    flipSpeed: 0.6,

    enableTabathaContextView: false,
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

// ════════════════════════════════════════════
// Session tracking helpers
// ════════════════════════════════════════════

function getLastExitTimestamp(): number | null {
    try {
        const val = localStorage.getItem('fluxLastExit');
        return val ? parseInt(val, 10) : null;
    } catch { return null; }
}

function saveExitTimestamp() {
    localStorage.setItem('fluxLastExit', String(Date.now()));
}

function formatDuration(ms: number): string {
    const totalSec = Math.floor(ms / 1000);
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
}

function pad(n: number, len: number = 2): string {
    return String(n).padStart(len, '0');
}

// ════════════════════════════════════════════
// FlipClock Component
// ════════════════════════════════════════════

interface FlipClockProps {
    previewOnly?: boolean;
    settings?: ClockSettings;
}

export const FlipClock = ({ previewOnly = false, settings }: FlipClockProps) => {
    const [time, setTime] = useState(new Date());
    const config = settings || loadSettings();
    const startTimeRef = useRef(Date.now());
    const [sessionMs, setSessionMs] = useState(0);
    const [lastActiveMs] = useState<number | null>(() => {
        const lastExit = getLastExitTimestamp();
        return lastExit ? Date.now() - lastExit : null;
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
            setSessionMs(Date.now() - startTimeRef.current);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Save exit timestamp on unmount (screensaver closing)
    useEffect(() => {
        if (previewOnly) return;
        const handleUnload = () => saveExitTimestamp();
        window.addEventListener('beforeunload', handleUnload);
        return () => {
            saveExitTimestamp();
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, [previewOnly]);

    // ── Time calculation ──
    let hours = time.getHours();
    const isPM = hours >= 12;
    if (!config.is24Hour) {
        hours = hours % 12 || 12;
    }
    const hStr = pad(hours);
    const mStr = pad(time.getMinutes());
    const sStr = pad(time.getSeconds());

    // ── Countdown calculation ──
    let countdownTotalSec = 0;
    let countdownLabel = '1440 COUNTDOWN';
    let countdownSubtext = 'Minutes remaining until midnight';

    if (config.countdownMode === 'daily') {
        const secsPassed = time.getHours() * 3600 + time.getMinutes() * 60 + time.getSeconds();
        countdownTotalSec = Math.max(0, 86400 - secsPassed);
    } else {
        const [targetH, targetM] = config.customCountdownTarget.split(':').map(Number);
        const targetSec = (targetH || 0) * 3600 + (targetM || 0) * 60;
        const nowSec = time.getHours() * 3600 + time.getMinutes() * 60 + time.getSeconds();
        countdownTotalSec = Math.max(0, targetSec - nowSec);
        countdownLabel = 'CUSTOM COUNTDOWN';
        countdownSubtext = `Counting down to ${config.customCountdownTarget}`;
    }

    const cdTotalMin = Math.floor(countdownTotalSec / 60);
    const cdS = countdownTotalSec % 60;

    // ── Determine the flip speed CSS variable ──
    const flipSpeedVar = { '--flip-speed': `${config.flipSpeed}s` } as CSSProperties & Record<string, string>;
    const secSpeed = Math.min(config.flipSpeed, 0.9);

    // ── Clock element ──
    const clockElement = config.showClock ? (
        <div
            className="clock-row"
            style={{
                '--clock-scale': String(config.scale),
                '--clock-brightness': String(config.clockBrightness),
                '--clock-text-color': config.textColor,
                ...flipSpeedVar,
            } as CSSProperties & Record<string, string>}
        >
            <div className="flip-group">
                <FlipDigit digit={hStr.charAt(0)} speed={config.flipSpeed} />
                <FlipDigit digit={hStr.charAt(1)} speed={config.flipSpeed} />
            </div>
            <div className="clock-colon">:</div>
            <div className="flip-group">
                <FlipDigit digit={mStr.charAt(0)} speed={config.flipSpeed} />
                <FlipDigit digit={mStr.charAt(1)} speed={config.flipSpeed} />
            </div>
            {config.showClockSeconds && (
                <>
                    <div className="clock-colon">:</div>
                    <div className="flip-group">
                        <FlipDigit digit={sStr.charAt(0)} speed={secSpeed} />
                        <FlipDigit digit={sStr.charAt(1)} speed={secSpeed} />
                    </div>
                </>
            )}
            {!config.is24Hour && <div className="am-pm">{isPM ? 'PM' : 'AM'}</div>}
        </div>
    ) : null;

    // ── Countdown element ──
    const countdownElement = config.showCountdown ? (
        <CountdownDisplay
            config={config}
            totalSec={countdownTotalSec}
            totalMin={cdTotalMin}
            seconds={cdS}
            label={countdownLabel}
            subtext={countdownSubtext}
            flipSpeedVar={flipSpeedVar}
        />
    ) : null;

    // ── Order based on position ──
    const topEl = config.clockPosition === 'top' ? clockElement : countdownElement;
    const bottomEl = config.clockPosition === 'top' ? countdownElement : clockElement;

    // ── Exit detection ──
    useEffect(() => {
      if (previewOnly) return;
      let cleanup: (() => void) | undefined;
      const startupDelay = setTimeout(() => {
        const quitScreensaver = () => {
          saveExitTimestamp();
          if ((window as any).require) {
            const { ipcRenderer } = (window as any).require('electron');
            ipcRenderer.send('quit-screensaver');
          }
        };
        let lastX: number | null = null;
        let lastY: number | null = null;
        const handleMouseMove = (e: MouseEvent) => {
          if (lastX === null || lastY === null) {
             lastX = e.clientX; lastY = e.clientY; return;
          }
          if (Math.abs(e.clientX - lastX) > 10 || Math.abs(e.clientY - lastY) > 10) {
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
      return () => { clearTimeout(startupDelay); cleanup?.(); };
    }, [previewOnly]);

    const layoutStyle: CSSProperties = {
        top: `${config.clockVerticalOffset}%`,
    };

    return (
        <div className="screensaver-root">
            {/* Background image */}
            {config.backgroundImage && (
                <div
                    className="bg-image"
                    style={{
                        backgroundImage: `url("${config.backgroundImage}")`,
                        opacity: config.backgroundOpacity,
                    }}
                />
            )}

            {/* Main clock layout */}
            <div className="screensaver-layout" style={layoutStyle}>
                {topEl}
                {topEl && bottomEl && (
                    <div className="layout-spacer" style={{ height: config.elementSpacing }} />
                )}
                {bottomEl}
            </div>

            {/* Session info overlays */}
            {(config.showSessionDuration || config.showLastActive) && (
                <div
                    className="session-info-bar"
                    style={{ '--info-scale': String(config.infoScale) } as CSSProperties & Record<string, string>}
                >
                    {config.showSessionDuration && (
                        <div className="session-info session-left">
                            Session: {formatDuration(sessionMs)}
                        </div>
                    )}
                    {config.showLastActive && lastActiveMs !== null && (
                        <div className="session-info session-right">
                            Last active: {formatDuration(lastActiveMs)} ago
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

function getLeadingZerosMask(digits: string[], enabled: boolean): boolean[] {
    if (!enabled) return digits.map(() => false);
    let stillZero = true;
    return digits.map(d => {
        if (d !== '0') stillZero = false;
        return stillZero;
    });
}

function CountdownDisplay({
    config, totalSec, totalMin, seconds, label, subtext, flipSpeedVar,
}: {
    config: ClockSettings;
    totalSec: number;
    totalMin: number;
    seconds: number;
    label: string;
    subtext: string;
    flipSpeedVar: CSSProperties & Record<string, string>;
}) {
    const fmt = config.countdownMode === 'daily' ? config.countdownDisplayFormat : 'HH:MM:SS';
    const secSpeed = Math.min(config.flipSpeed, 0.9);

    let digitElements: React.ReactNode;

    if (fmt === 'HH:MM:SS') {
        const h = pad(Math.floor(totalSec / 3600));
        const m = pad(Math.floor((totalSec % 3600) / 60));
        const s = pad(totalSec % 60);
        const digits = [h[0], h[1], m[0], m[1], s[0], s[1]];
        const pulse = getLeadingZerosMask(digits, config.enableZeroPulse);
        const [ps] = [config.zeroPulseSpeed];

        digitElements = (
            <>
                <div className="flip-group">
                    <FlipDigit digit={digits[0]} speed={config.flipSpeed} pulse={pulse[0]} pulseSpeed={ps} />
                    <FlipDigit digit={digits[1]} speed={config.flipSpeed} pulse={pulse[1]} pulseSpeed={ps} />
                </div>
                <div className="clock-colon">:</div>
                <div className="flip-group">
                    <FlipDigit digit={digits[2]} speed={config.flipSpeed} pulse={pulse[2]} pulseSpeed={ps} />
                    <FlipDigit digit={digits[3]} speed={config.flipSpeed} pulse={pulse[3]} pulseSpeed={ps} />
                </div>
                {config.showCountdownSeconds && (
                    <>
                        <div className="clock-colon">:</div>
                        <div className="flip-group">
                            <FlipDigit digit={digits[4]} speed={secSpeed} pulse={pulse[4]} pulseSpeed={ps} />
                            <FlipDigit digit={digits[5]} speed={secSpeed} pulse={pulse[5]} pulseSpeed={ps} />
                        </div>
                    </>
                )}
            </>
        );
    } else {
        const minStr = pad(totalMin, 4);
        const sStr = pad(seconds);
        const digits = [minStr[0], minStr[1], minStr[2], minStr[3], sStr[0], sStr[1]];
        const pulse = getLeadingZerosMask(digits, config.enableZeroPulse);
        const [ps] = [config.zeroPulseSpeed];

        if (fmt === 'MMMM:SS') {
            digitElements = (
                <>
                    <div className="flip-group">
                        <FlipDigit digit={digits[0]} speed={config.flipSpeed} pulse={pulse[0]} pulseSpeed={ps} />
                        <FlipDigit digit={digits[1]} speed={config.flipSpeed} pulse={pulse[1]} pulseSpeed={ps} />
                    </div>
                    <div className="flip-group">
                        <FlipDigit digit={digits[2]} speed={config.flipSpeed} pulse={pulse[2]} pulseSpeed={ps} />
                        <FlipDigit digit={digits[3]} speed={config.flipSpeed} pulse={pulse[3]} pulseSpeed={ps} />
                    </div>
                    {config.showCountdownSeconds && (
                        <>
                            <div className="clock-colon">:</div>
                            <div className="flip-group">
                                <FlipDigit digit={digits[4]} speed={secSpeed} pulse={pulse[4]} pulseSpeed={ps} />
                                <FlipDigit digit={digits[5]} speed={secSpeed} pulse={pulse[5]} pulseSpeed={ps} />
                            </div>
                        </>
                    )}
                </>
            );
        } else {
            digitElements = (
                <>
                    <div className="flip-group">
                        <FlipDigit digit={digits[0]} speed={config.flipSpeed} pulse={pulse[0]} pulseSpeed={ps} />
                        <FlipDigit digit={digits[1]} speed={config.flipSpeed} pulse={pulse[1]} pulseSpeed={ps} />
                    </div>
                    <div className="flip-group">
                        <FlipDigit digit={digits[2]} speed={config.flipSpeed} pulse={pulse[2]} pulseSpeed={ps} />
                        <FlipDigit digit={digits[3]} speed={config.flipSpeed} pulse={pulse[3]} pulseSpeed={ps} />
                    </div>
                    {config.showCountdownSeconds && (
                        <div className="countdown-small-seconds">
                            <FlipDigit digit={digits[4]} speed={secSpeed} small pulse={pulse[4]} pulseSpeed={ps} />
                            <FlipDigit digit={digits[5]} speed={secSpeed} small pulse={pulse[5]} pulseSpeed={ps} />
                        </div>
                    )}
                </>
            );
        }
    }

    return (
        <div
            className="clock-row countdown-row"
            style={{
                '--clock-scale': String(config.countdownScale),
                '--clock-brightness': String(config.countdownBrightness),
                '--clock-text-color': config.countdownColor,
                ...flipSpeedVar,
            } as CSSProperties & Record<string, string>}
        >
            <div className="countdown-header">
                <div className="countdown-label">{label}</div>
                <div className="countdown-subtext">{subtext}</div>
            </div>
            <div className="countdown-digits">
                {digitElements}
            </div>
        </div>
    );
}

// ════════════════════════════════════════════
// FlipDigit — 3D split-flap animation (FIXED)
//
// Architecture:
//   Layer stack (bottom to top):
//     1. .digital-bottom  — static bottom half, shows OLD digit (prev) during flip, then NEW digit
//     2. .digital-top     — static top half, ALWAYS shows NEW digit
//     3. .flap-top        — animated: top half of OLD digit, folds down 0→-90° (0% to 50%)
//     4. .flap-bottom     — animated: bottom half of NEW digit, unfolds 90°→0° (50% to 100%)
//
//   This 4-piece design is completely bulletproof against Z-fighting and opacity bugs,
//   as there are no 180° backfaces.
// ════════════════════════════════════════════

const FlipDigit = ({ digit, speed = 0.6, small = false, pulse = false, pulseSpeed = 2 }: { digit: string; speed?: number; small?: boolean, pulse?: boolean, pulseSpeed?: number }) => {
    const currRef = useRef(digit);
    const [prev, setPrev] = useState(digit);
    const [display, setDisplay] = useState(digit);
    const [flipping, setFlipping] = useState(false);

    const startFlip = useCallback((newDigit: string) => {
        setPrev(currRef.current);  
        setDisplay(newDigit);      
        currRef.current = newDigit;
        setFlipping(true);
    }, []);

    useEffect(() => {
        if (digit !== currRef.current) {
            startFlip(digit);

            const totalMs = (speed * 1000) + 50;
            const t = setTimeout(() => {
                setFlipping(false);
                setPrev(digit); // Sync after animation completes
            }, totalMs);
            return () => clearTimeout(t);
        }
    }, [digit, startFlip, speed]);

    const sizeClass = small ? 'flip-digit-small' : '';
    const pulseClass = pulse ? 'pulse-red' : '';
    const animStyle = {
        '--flip-speed': `${speed}s`,
        '--pulse-speed': `${pulseSpeed}s`,
    } as CSSProperties & Record<string, string>;

    return (
        <div className={`flip-digit ${sizeClass} ${pulseClass} ${flipping ? 'flipping' : ''}`} style={animStyle}>
            {/* Static halves */}
            <div className="digital-top" data-content={display}></div>
            <div className="digital-bottom" data-content={flipping ? prev : display}></div>

            {/* Animated flaps */}
            <div className="flap-top" data-content={prev}></div>
            <div className="flap-bottom" data-content={display}></div>
        </div>
    );
};
