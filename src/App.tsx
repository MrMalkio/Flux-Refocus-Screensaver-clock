import { useEffect, useState } from 'react';
import { FlipClock } from './FlipClock';

function App() {
  const [isConfig, setIsConfig] = useState(false);
  const [is24Hour, setIs24Hour] = useState(localStorage.getItem('is24Hour') === 'true');

  useEffect(() => {
    // electron sends ?config=true for config window
    if (window.location.search.includes('config=true') || window.location.hash.includes('config')) {
      setIsConfig(true);
    }
  }, []);

  const toggle24Hour = () => {
    const next = !is24Hour;
    setIs24Hour(next);
    localStorage.setItem('is24Hour', next.toString());
  };

  const closeConfig = () => {
    window.close();
  };

  if (isConfig) {
    return (
      <div style={{ padding: 20, color: '#fff', fontFamily: 'Inter' }}>
        <h2>Screensaver Settings</h2>
        <div style={{ marginTop: 20, marginBottom: 20 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={is24Hour} onChange={toggle24Hour} style={{ width: 20, height: 20 }}/>
            Use 24-Hour Format
          </label>
        </div>
        <button 
          onClick={closeConfig}
          style={{ padding: '8px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        >
          Save & Close
        </button>
      </div>
    );
  }

  return (
    <>
      <FlipClock />
    </>
  )
}

export default App
