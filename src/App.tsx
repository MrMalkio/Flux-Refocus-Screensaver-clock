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

  const pickBackgroundImage = async () => {
    try {
      if ((window as any).require) {
        const { ipcRenderer } = (window as any).require('electron');
        const result = await ipcRenderer.invoke('pick-image');
        if (result) {
          updateSetting('backgroundImage', result);
        }
      }
    } catch { /* ignore in browser dev mode */ }
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
              <SettingSection label="Format">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontSize: '0.95rem' }}>
                    <ToggleSwitch checked={settings.is24Hour} onChange={(v) => updateSetting('is24Hour', v)} />
                    24-Hour Clock
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontSize: '0.95rem' }}>
                    <ToggleSwitch checked={settings.showClockSeconds} onChange={(v) => updateSetting('showClockSeconds', v)} />
                    Show Seconds
                  </label>
                </div>
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
                <SliderLabels left="Small" right="Full Screen" />
              </SettingSection>

              {/* Clock Brightness */}
              <SettingSection label={`Clock Brightness — ${Math.round(settings.clockBrightness * 100)}%`}>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={settings.clockBrightness}
                  onChange={(e) => updateSetting('clockBrightness', parseFloat(e.target.value))}
                  style={sliderStyle}
                />
                <SliderLabels left="Dim" right="Full" />
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
          <SectionHeader label="1440 Countdown" />

          {/* Show Countdown Toggle */}
          <SettingSection label="Visibility">
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontSize: '0.95rem' }}>
              <ToggleSwitch checked={settings.showCountdown} onChange={(v) => updateSetting('showCountdown', v)} />
              1440 Countdown
            </label>
            <div style={{ color: '#555', fontSize: '0.72rem', marginTop: 6, lineHeight: 1.4 }}>
              Counts down from 1440 minutes until 0 remain in the day
            </div>
          </SettingSection>

          {settings.showCountdown && (
            <>
              {/* Countdown Mode */}
              <SettingSection label="Mode">
                <div style={{ display: 'flex', gap: 8 }}>
                  <PositionButton
                    label="Daily (1440)"
                    active={settings.countdownMode === 'daily'}
                    onClick={() => updateSetting('countdownMode', 'daily')}
                  />
                  <PositionButton
                    label="Custom Timer"
                    active={settings.countdownMode === 'custom'}
                    onClick={() => updateSetting('countdownMode', 'custom')}
                  />
                </div>
              </SettingSection>

              {/* Display Format (daily mode only) */}
              {settings.countdownMode === 'daily' && (
                <SettingSection label="Display Format">
                  <div style={{ display: 'flex', gap: 6 }}>
                    <PositionButton
                      label="MMMMss"
                      active={settings.countdownDisplayFormat === 'MMMMss'}
                      onClick={() => updateSetting('countdownDisplayFormat', 'MMMMss')}
                    />
                    <PositionButton
                      label="MMMM:SS"
                      active={settings.countdownDisplayFormat === 'MMMM:SS'}
                      onClick={() => updateSetting('countdownDisplayFormat', 'MMMM:SS')}
                    />
                    <PositionButton
                      label="HH:MM:SS"
                      active={settings.countdownDisplayFormat === 'HH:MM:SS'}
                      onClick={() => updateSetting('countdownDisplayFormat', 'HH:MM:SS')}
                    />
                  </div>
                  <div style={{ color: '#555', fontSize: '0.68rem', marginTop: 6, lineHeight: 1.3 }}>
                    {settings.countdownDisplayFormat === 'MMMMss' && '4-digit minutes with small seconds'}
                    {settings.countdownDisplayFormat === 'MMMM:SS' && '4-digit minutes : seconds'}
                    {settings.countdownDisplayFormat === 'HH:MM:SS' && 'Standard hours : minutes : seconds'}
                  </div>
                </SettingSection>
              )}

              {/* Show Seconds toggle */}
              <SettingSection label="Seconds">
                <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontSize: '0.95rem' }}>
                  <ToggleSwitch checked={settings.showCountdownSeconds} onChange={(v) => updateSetting('showCountdownSeconds', v)} />
                  Show Seconds
                </label>
              </SettingSection>

              {/* Custom target time */}
              {settings.countdownMode === 'custom' && (
                <SettingSection label="Count Down To">
                  <input
                    type="time"
                    value={settings.customCountdownTarget}
                    onChange={(e) => updateSetting('customCountdownTarget', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: 6,
                      color: '#fff',
                      fontSize: '0.9rem',
                      fontFamily: 'monospace',
                    }}
                  />
                  <div style={{ color: '#555', fontSize: '0.72rem', marginTop: 4 }}>
                    Set a target time (24h format) to count down to
                  </div>
                </SettingSection>
              )}

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
                <SliderLabels left="Small" right="Full Screen" />
              </SettingSection>

              {/* Countdown Brightness */}
              <SettingSection label={`Countdown Brightness — ${Math.round(settings.countdownBrightness * 100)}%`}>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={settings.countdownBrightness}
                  onChange={(e) => updateSetting('countdownBrightness', parseFloat(e.target.value))}
                  style={sliderStyle}
                />
                <SliderLabels left="Dim" right="Full" />
              </SettingSection>

              {/* Countdown Color */}
              <SettingSection label="Countdown Color">
                <ColorPicker
                  value={settings.countdownColor}
                  onChange={(c) => updateSetting('countdownColor', c)}
                />
              </SettingSection>
              {/* Zero Pulsing */}
              <SettingSection label="Pulse Effect">
                <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontSize: '0.95rem' }}>
                  <ToggleSwitch checked={settings.enableZeroPulse} onChange={(v) => updateSetting('enableZeroPulse', v)} />
                  Pulse Leading Zeros
                </label>
                <div style={{ color: '#555', fontSize: '0.72rem', marginTop: 6, lineHeight: 1.4 }}>
                  Make digits pulse red once they become zero.
                </div>
              </SettingSection>

              {settings.enableZeroPulse && (
                <SettingSection label={`Pulse Speed — ${settings.zeroPulseSpeed.toFixed(1)}s`}>
                  <input
                    type="range"
                    min="0.5"
                    max="5.0"
                    step="0.5"
                    value={settings.zeroPulseSpeed}
                    onChange={(e) => updateSetting('zeroPulseSpeed', parseFloat(e.target.value))}
                    style={sliderStyle}
                  />
                  <SliderLabels left="Fast" right="Slow" />
                </SettingSection>
              )}
            </>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {/* ── LAYOUT SECTION ── */}
          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <SectionHeader label="Layout" />

          {/* Vertical Position */}
          <SettingSection label={`Vertical Position — ${settings.clockVerticalOffset}%`}>
            <input
              type="range"
              min="10"
              max="90"
              step="1"
              value={settings.clockVerticalOffset}
              onChange={(e) => updateSetting('clockVerticalOffset', parseInt(e.target.value))}
              style={sliderStyle}
            />
            <SliderLabels left="Top" right="Bottom" />
          </SettingSection>

          {/* Element Spacing (only when both visible) */}
          {settings.showClock && settings.showCountdown && (
            <>
              <SettingSection label={`Element Spacing — ${settings.elementSpacing}px`}>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="5"
                  value={settings.elementSpacing}
                  onChange={(e) => updateSetting('elementSpacing', parseInt(e.target.value))}
                  style={sliderStyle}
                />
                <SliderLabels left="None" right="Far Apart" />
              </SettingSection>

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

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {/* ── SESSION INFO SECTION ── */}
          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <SectionHeader label="Session Info" />

          <SettingSection label="Overlays">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontSize: '0.95rem' }}>
                <ToggleSwitch checked={settings.showSessionDuration} onChange={(v) => updateSetting('showSessionDuration', v)} />
                Session Duration
              </label>
              <div style={{ color: '#555', fontSize: '0.7rem', marginLeft: 56, marginTop: -6 }}>
                How long the screensaver has been running
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontSize: '0.95rem' }}>
                <ToggleSwitch checked={settings.showLastActive} onChange={(v) => updateSetting('showLastActive', v)} />
                Last Active
              </label>
              <div style={{ color: '#555', fontSize: '0.7rem', marginLeft: 56, marginTop: -6 }}>
                Time since last screensaver session
              </div>
            </div>
          </SettingSection>

          {(settings.showSessionDuration || settings.showLastActive) && (
            <SettingSection label={`Info Size — ${Math.round(settings.infoScale * 100)}%`}>
              <input
                type="range"
                min="0.3"
                max="1.0"
                step="0.05"
                value={settings.infoScale}
                onChange={(e) => updateSetting('infoScale', parseFloat(e.target.value))}
                style={sliderStyle}
              />
              <SliderLabels left="Tiny" right="Max" />
            </SettingSection>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {/* ── BACKGROUND SECTION ── */}
          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <SectionHeader label="Background" />

          <SettingSection label="Background Image">
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <button
                onClick={pickBackgroundImage}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: '#1a2a4a',
                  color: '#448aff',
                  border: '1px solid #448aff55',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                Choose Image…
              </button>
              {settings.backgroundImage && (
                <button
                  onClick={() => updateSetting('backgroundImage', '')}
                  style={{
                    padding: '8px 12px',
                    background: '#2a1a1a',
                    color: '#ff5252',
                    border: '1px solid #ff525255',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  Clear
                </button>
              )}
            </div>
            {settings.backgroundImage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 40, height: 28,
                  borderRadius: 4,
                  backgroundImage: `url("${settings.backgroundImage}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '1px solid #333',
                }} />
                <span style={{ color: '#555', fontSize: '0.7rem', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
                  {settings.backgroundImage.split(/[\\/]/).pop()}
                </span>
              </div>
            )}
          </SettingSection>

          {settings.backgroundImage && (
            <SettingSection label={`Background Opacity — ${Math.round(settings.backgroundOpacity * 100)}%`}>
              <input
                type="range"
                min="0.05"
                max="1"
                step="0.05"
                value={settings.backgroundOpacity}
                onChange={(e) => updateSetting('backgroundOpacity', parseFloat(e.target.value))}
                style={sliderStyle}
              />
              <SliderLabels left="Subtle" right="Full" />
            </SettingSection>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {/* ── DISPLAY SECTION ── */}
          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <SectionHeader label="Display" />

          <SettingSection label={`Flip Speed — ${settings.flipSpeed.toFixed(1)}s`}>
            <input
              type="range"
              min="0.3"
              max="1.5"
              step="0.1"
              value={settings.flipSpeed}
              onChange={(e) => updateSetting('flipSpeed', parseFloat(e.target.value))}
              style={sliderStyle}
            />
            <SliderLabels left="Snappy" right="Dramatic" />
          </SettingSection>

          {/* Spacer pushes buttons to bottom */}
          <div style={{ flex: 1, minHeight: 16 }} />

          {/* ── Save & Save+Exit ── */}
          <div style={{ display: 'flex', gap: 8 }}>
            <SaveButton />
            <button 
              onClick={closeConfig}
              style={{
                flex: 1,
                padding: '12px 16px', 
                background: '#222', 
                color: '#fff', 
                border: '1px solid #333', 
                borderRadius: 8, 
                cursor: 'pointer', 
                fontSize: '0.9rem', 
                transition: 'all 0.2s', 
                fontWeight: 600,
                letterSpacing: '0.5px',
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#333'; e.currentTarget.style.borderColor = '#555'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = '#222'; e.currentTarget.style.borderColor = '#333'; }}
            >
              Save & Exit
            </button>
          </div>
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

// ── Slider labels ──
function SliderLabels({ left, right }: { left: string; right: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555', fontSize: '0.7rem', marginTop: 4 }}>
      <span>{left}</span>
      <span>{right}</span>
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
// ── Save button with confirmation ──
function SaveButton() {
  const [saved, setSaved] = useState(false);
  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  return (
    <button
      onClick={handleSave}
      style={{
        flex: 1,
        padding: '12px 16px',
        background: saved ? '#1a3a1a' : '#1a2a4a',
        color: saved ? '#69f0ae' : '#448aff',
        border: saved ? '1px solid #69f0ae55' : '1px solid #448aff55',
        borderRadius: 8,
        cursor: 'pointer',
        fontSize: '0.9rem',
        transition: 'all 0.3s',
        fontWeight: 600,
        letterSpacing: '0.5px',
      }}
    >
      {saved ? 'Saved ✓' : 'Save'}
    </button>
  );
}

export default App;
