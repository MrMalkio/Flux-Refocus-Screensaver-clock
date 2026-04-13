import { useState, useEffect } from 'react';
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
        <div style={{ padding: '28px 32px', color: '#fff', fontFamily: 'Inter, sans-serif', width: 370, minWidth: 370, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 2, fontWeight: 600, letterSpacing: '-0.5px' }}>Flux Screensaver</h2>
            <span style={{ color: '#444', fontSize: '0.78rem', fontFamily: 'monospace' }}>v{version}</span>
          </div>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {/* ── CLOCK SECTION ── */}
          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <SectionHeader label="Clock" />

          {/* Show Clock Toggle */}
          <SettingSection label="Visibility">
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontSize: '0.95rem' }}>
              <ToggleSwitch checked={settings.showClock} onChange={(v) => updateSetting('showClock', v)} />
              Show Clock
            </label>
          </SettingSection>

          {settings.showClock && (
            <>
              {/* Time Format */}
              <SettingSection label="Time Format">
                <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontSize: '0.95rem' }}>
                  <ToggleSwitch checked={settings.is24Hour} onChange={(v) => updateSetting('is24Hour', v)} />
                  24-Hour Clock
                </label>
              </SettingSection>

              {/* Clock Size */}
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

              {/* Clock Color */}
              <SettingSection label="Clock Color">
                <ColorPicker
                  value={settings.textColor}
                  onChange={(c) => updateSetting('textColor', c)}
                />
              </SettingSection>
            </>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {/* ── COUNTDOWN SECTION ── */}
          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <SectionHeader label="Countdown" />

          {/* Show Countdown Toggle */}
          <SettingSection label="Visibility">
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontSize: '0.95rem' }}>
              <ToggleSwitch checked={settings.showCountdown} onChange={(v) => updateSetting('showCountdown', v)} />
              Show Minutes Remaining
            </label>
          </SettingSection>

          {settings.showCountdown && (
            <>
              {/* Countdown Size */}
              <SettingSection label={`Countdown Size — ${Math.round((settings.countdownScale / 1.5) * 100)}%`}>
                <input
                  type="range"
                  min="0.5"
                  max="3.5"
                  step="0.05"
                  value={settings.countdownScale}
                  onChange={(e) => updateSetting('countdownScale', parseFloat(e.target.value))}
                  style={sliderStyle}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555', fontSize: '0.7rem', marginTop: 4 }}>
                  <span>Small</span>
                  <span>Full Screen</span>
                </div>
              </SettingSection>

              {/* Countdown Color */}
              <SettingSection label="Countdown Color">
                <ColorPicker
                  value={settings.countdownColor}
                  onChange={(c) => updateSetting('countdownColor', c)}
                />
              </SettingSection>
            </>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {/* ── DISPLAY SECTION ── */}
          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {settings.showClock && settings.showCountdown && (
            <>
              <SectionHeader label="Layout" />

              <SettingSection label="Position Order">
                <div style={{ display: 'flex', gap: 8 }}>
                  <PositionButton
                    label="Clock on Top"
                    active={settings.clockPosition === 'top'}
                    onClick={() => updateSetting('clockPosition', 'top')}
                  />
                  <PositionButton
                    label="Countdown on Top"
                    active={settings.clockPosition === 'bottom'}
                    onClick={() => updateSetting('clockPosition', 'bottom')}
                  />
                </div>
              </SettingSection>
            </>
          )}

          {/* ── Brightness (shared) ── */}
          <SectionHeader label="Display" />
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

          {/* Spacer pushes button to bottom */}
          <div style={{ flex: 1, minHeight: 16 }} />

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
            transform: 'scale(0.35)', 
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

// ── Section header with divider ──
function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, marginTop: 8 }}>
      <span style={{ fontSize: '0.72rem', color: '#555', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: '#282828' }} />
    </div>
  );
}

// ── Reusable setting section wrapper ──
function SettingSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: '0.75rem', color: '#777', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8, fontWeight: 600 }}>
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

// ── Color picker with presets + custom ──
function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {COLOR_PRESETS.map((c) => (
          <button
            key={c.hex}
            title={c.label}
            onClick={() => onChange(c.hex)}
            style={{
              width: 28, height: 28,
              borderRadius: '50%',
              border: value.toLowerCase() === c.hex.toLowerCase() ? '2px solid #fff' : '2px solid #333',
              background: c.hex,
              cursor: 'pointer',
              transition: 'border-color 0.15s, transform 0.15s',
              transform: value.toLowerCase() === c.hex.toLowerCase() ? 'scale(1.15)' : 'scale(1)',
              boxShadow: value.toLowerCase() === c.hex.toLowerCase() ? `0 0 10px ${c.hex}44` : 'none',
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 32, height: 24, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
        />
        <span style={{ color: '#666', fontSize: '0.78rem', fontFamily: 'monospace' }}>
          {value}
        </span>
      </div>
    </>
  );
}

// ── Position toggle button ──
function PositionButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '10px 8px',
        background: active ? '#1a2a4a' : '#1a1a1a',
        color: active ? '#448aff' : '#666',
        border: active ? '1px solid #448aff55' : '1px solid #2a2a2a',
        borderRadius: 8,
        cursor: 'pointer',
        fontSize: '0.8rem',
        fontWeight: 600,
        transition: 'all 0.2s',
        letterSpacing: '0.3px',
      }}
    >
      {label}
    </button>
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
