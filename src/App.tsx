import { useEffect, useState } from 'react';
import { FlipClock, loadSettings, saveSettings } from './FlipClock';
import type { ClockSettings } from './FlipClock';
import { version } from '../package.json';

// ── Preset color palette ──
const COLOR_PRESETS = [
  { label: 'Silver',  hex: '#e0e0e0' },
  { label: 'White',   hex: '#ffffff' },
  { label: 'Gold',    hex: '#ffd700' },
  { label: 'Amber',   hex: '#ffb347' },
  { label: 'Cyan',    hex: '#00e5ff' },
  { label: 'Mint',    hex: '#69f0ae' },
  { label: 'Rose',    hex: '#ff6b9d' },
  { label: 'Violet',  hex: '#b388ff' },
  { label: 'Blue',    hex: '#448aff' },
  { label: 'Coral',   hex: '#ff7043' },
];

function App() {
  const [isConfig, setIsConfig] = useState(false);
  const [settings, setSettings] = useState<ClockSettings>(loadSettings);

  useEffect(() => {
    if (window.location.search.includes('config=true') || window.location.hash.includes('config')) {
      setIsConfig(true);
    }
  }, []);

  const updateSetting = <K extends keyof ClockSettings>(key: K, value: ClockSettings[K]) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveSettings(next);
  };

  const closeConfig = () => {
    window.close();
  };

  // ── Settings / Config mode ──
  if (isConfig) {
    return (
      <div style={{ display: 'flex', height: '100vh', background: '#111', margin: 0, overflow: 'hidden' }}>

        {/* ── Settings Panel ── */}
        <div style={{ padding: '32px 36px', color: '#fff', fontFamily: 'Inter, sans-serif', width: 360, minWidth: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: '1.6rem', marginBottom: 2, fontWeight: 600, letterSpacing: '-0.5px' }}>Flux Screensaver</h2>
            <span style={{ color: '#444', fontSize: '0.78rem', fontFamily: 'monospace' }}>v{version}</span>
          </div>

          {/* ── Time Format ── */}
          <SettingSection label="Time Format">
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontSize: '0.95rem' }}>
              <ToggleSwitch checked={settings.is24Hour} onChange={(v) => updateSetting('is24Hour', v)} />
              24-Hour Clock
            </label>
          </SettingSection>

          {/* ── Clock Size ── */}
          <SettingSection label={`Clock Size — ${Math.round((settings.scale / 1.5) * 100)}%`}>
            <input
              type="range"
              min="0.5"
              max="3.5"
              step="0.05"
              value={settings.scale}
              onChange={(e) => updateSetting('scale', parseFloat(e.target.value))}
              style={sliderStyle}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555', fontSize: '0.7rem', marginTop: 4 }}>
              <span>Small</span>
              <span>Full Screen</span>
            </div>
          </SettingSection>

          {/* ── Brightness ── */}
          <SettingSection label={`Brightness — ${Math.round(settings.brightness * 100)}%`}>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={settings.brightness}
              onChange={(e) => updateSetting('brightness', parseFloat(e.target.value))}
              style={sliderStyle}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555', fontSize: '0.7rem', marginTop: 4 }}>
              <span>Dim</span>
              <span>Full</span>
            </div>
          </SettingSection>

          {/* ── Text Color ── */}
          <SettingSection label="Text Color">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c.hex}
                  title={c.label}
                  onClick={() => updateSetting('textColor', c.hex)}
                  style={{
                    width: 32, height: 32,
                    borderRadius: '50%',
                    border: settings.textColor.toLowerCase() === c.hex.toLowerCase() ? '2px solid #fff' : '2px solid #333',
                    background: c.hex,
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, transform 0.15s',
                    transform: settings.textColor.toLowerCase() === c.hex.toLowerCase() ? 'scale(1.15)' : 'scale(1)',
                    boxShadow: settings.textColor.toLowerCase() === c.hex.toLowerCase() ? `0 0 10px ${c.hex}44` : 'none',
                  }}
                />
              ))}
            </div>
            {/* Custom hex input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="color"
                value={settings.textColor}
                onChange={(e) => updateSetting('textColor', e.target.value)}
                style={{ width: 36, height: 28, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
              />
              <span style={{ color: '#666', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                {settings.textColor}
              </span>
            </div>
          </SettingSection>

          {/* Spacer pushes button to bottom */}
          <div style={{ flex: 1 }} />

          {/* ── Save & Exit ── */}
          <button 
            onClick={closeConfig}
            style={{
              padding: '12px 30px', 
              background: '#222', 
              color: '#fff', 
              border: '1px solid #333', 
              borderRadius: 8, 
              cursor: 'pointer', 
              fontSize: '1rem', 
              transition: 'all 0.2s', 
              fontWeight: 600,
              width: '100%',
              letterSpacing: '0.5px',
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#333'; e.currentTarget.style.borderColor = '#555'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = '#222'; e.currentTarget.style.borderColor = '#333'; }}
          >
            Save & Exit
          </button>
        </div>

        {/* ── Live Preview Panel ── */}
        <div style={{ 
          flex: 1, 
          position: 'relative', 
          background: '#0b0b0b', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          overflow: 'hidden', 
          borderLeft: '1px solid #222' 
        }}>
          <div style={{ position: 'absolute', top: 16, right: 20, color: '#444', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', letterSpacing: 2, textTransform: 'uppercase' }}>
            Live Preview
          </div>
          <div style={{ 
            transform: 'scale(0.42)', 
            width: '100vw', 
            height: '100vh', 
            position: 'absolute', 
            transformOrigin: 'center center', 
            pointerEvents: 'none' 
          }}>
            <FlipClock previewOnly={true} settings={settings} />
          </div>
        </div>
      </div>
    );
  }

  // ── Screensaver mode ──
  return <FlipClock settings={settings} />;
}

// ── Reusable setting section wrapper ──
function SettingSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: '0.78rem', color: '#777', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10, fontWeight: 600 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

// ── Custom toggle switch ──
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div 
      onClick={() => onChange(!checked)}
      style={{
        width: 44, height: 24,
        borderRadius: 12,
        background: checked ? '#448aff' : '#333',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background 0.2s',
        flexShrink: 0,
      }}
    >
      <div style={{
        width: 18, height: 18,
        borderRadius: '50%',
        background: '#fff',
        position: 'absolute',
        top: 3,
        left: checked ? 23 : 3,
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
      }} />
    </div>
  );
}

// ── Slider styling ──
const sliderStyle: React.CSSProperties = {
  width: '100%',
  height: 6,
  appearance: 'none' as const,
  background: '#333',
  borderRadius: 3,
  outline: 'none',
  cursor: 'pointer',
};

export default App;
