import { useEffect, useState } from 'react';
import './FlipClock.css';





// Simplified approach above requires exact state mgmt. Let's do a more bulletproof version.
// Instead of multiple cards, we'll build a simpler, highly aesthetically pleasing FlipCard.

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

    // Mouse movement exit detection for the screensaver
    useEffect(() => {
      if (previewOnly) return; // Disable exit loop inside config preview

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

        if (deltaX > 20 || deltaY > 20) {
            // Signal main process to quit
            if ((window as any).require) {
                const { ipcRenderer } = (window as any).require('electron');
                ipcRenderer.send('quit-screensaver');
            } else {
                // If not in electron, ignore
            }
        }
      };

      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [previewOnly]);

    return (
        <div className="clock-container">
            {!is24Hour && <div className="am-pm">{isPM ? 'PM' : 'AM'}</div>}
            <div className="flip-group">
                <FlipDigit digit={hString.charAt(0)} />
                <FlipDigit digit={hString.charAt(1)} />
            </div>
            <div className="flip-group">
                <FlipDigit digit={mString.charAt(0)} />
                <FlipDigit digit={mString.charAt(1)} />
            </div>
        </div>
    );
};

// A simpler, very beautiful CSS-only flip digit
const FlipDigit = ({ digit }: { digit: string }) => {
    const [prev, setPrev] = useState(digit);
    const [curr, setCurr] = useState(digit);
    const [flipping, setFlipping] = useState(false);

    useEffect(() => {
        if (digit !== curr) {
            setPrev(curr);
            setCurr(digit);
            setFlipping(true);
            const t = setTimeout(() => setFlipping(false), 900);
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
