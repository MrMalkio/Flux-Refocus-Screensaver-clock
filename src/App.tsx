import { useEffect, useState } from 'react';
import { FlipClock } from './FlipClock';
import { version } from '../package.json';

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
      <div style={{ display: 'flex', height: '100vh', background: '#111', margin: 0, overflow: 'hidden' }}>
        {/* Settings Panel */}
        <div style={{ padding: 40, color: '#fff', fontFamily: 'Inter', flex: 1 }}>
          <h2 style={{ fontSize: '2rem', marginBottom: 4 }}>Flux Screensaver Settings</h2>
          <p style={{ color: '#555', fontSize: '0.85rem', marginBottom: 8, fontFamily: 'monospace' }}>v{version}</p>
          <p style={{ color: '#aaa', marginBottom: 40 }}>Configure your Flux-Screensaver preferences here.</p>

          <div style={{ marginTop: 20, marginBottom: 40 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 15, cursor: 'pointer', fontSize: '1.2rem' }}>
              <input type="checkbox" checked={is24Hour} onChange={toggle24Hour} style={{ width: 24, height: 24, cursor: 'pointer' }}/>
              Use 24-Hour Format
            </label>
          </div>

          <button 
            onClick={closeConfig}
            style={{ padding: '12px 30px', background: '#333', color: '#fff', border: '1px solid #444', borderRadius: 6, cursor: 'pointer', fontSize: '1.1rem', transition: 'background 0.2s', fontWeight: 600 }}
            onMouseOver={(e) => e.currentTarget.style.background = '#444'}
            onMouseOut={(e) => e.currentTarget.style.background = '#333'}
          >
            Save & Exit
          </button>
        </div>

        {/* Live Preview Panel */}
        <div style={{ flex: 1, position: 'relative', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderLeft: '1px solid #333' }}>
            <div style={{ position: 'absolute', top: 20, right: 25, color: '#666', fontFamily: 'Inter', fontSize: '0.9rem', letterSpacing: 1, textTransform: 'uppercase' }}>Live Preview</div>
            <div style={{ transform: 'scale(0.5)', width: '100vw', height: '100vh', position: 'absolute', transformOrigin: 'center center', pointerEvents: 'none' }}>
                <FlipClock key={String(is24Hour)} previewOnly={true} />
            </div>
        </div>
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
