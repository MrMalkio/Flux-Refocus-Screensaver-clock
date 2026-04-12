import { useEffect, useState } from 'react';
import '@fontsource/bebas-neue';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import './FlipClock.css';

export const FlipClock = ({ previewOnly = false }: { previewOnly?: boolean }) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const [is24Hour] = useState(localStorage.getItem('is24Hour') === 'true');
    let hours = time.getHours();
    const isPM = hours >= 12;
    if (!is24Hour) {
        hours = hours % 12 || 12; 
    }
    const hString = hours < 10 ? `0${hours}` : `${hours}`;
    const mString = time.getMinutes() < 10 ? `0${time.getMinutes()}` : `${time.getMinutes()}`;

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

        // Mouse: quit after significant movement
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

        // Keyboard: any key press quits
        const handleKeyDown = () => quitScreensaver();

        // Mouse click: any click quits
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
        <div className="clock-container">
            <div className="flip-group">
                <FlipDigit digit={hString.charAt(0)} />
                <FlipDigit digit={hString.charAt(1)} />
            </div>
            <div className="flip-group">
                <FlipDigit digit={mString.charAt(0)} />
                <FlipDigit digit={mString.charAt(1)} />
            </div>
            {!is24Hour && <div className="am-pm">{isPM ? 'PM' : 'AM'}</div>}
        </div>
    );
};

// Flip digit with dramatic animation
const FlipDigit = ({ digit }: { digit: string }) => {
    const [prev, setPrev] = useState(digit);
    const [curr, setCurr] = useState(digit);
    const [flipping, setFlipping] = useState(false);

    useEffect(() => {
        if (digit !== curr) {
            setPrev(curr);
            setCurr(digit);
            setFlipping(true);
            // Match total CSS animation duration: 0.6s top + 0.5s bottom = 1.1s
            const t = setTimeout(() => setFlipping(false), 1200);
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
