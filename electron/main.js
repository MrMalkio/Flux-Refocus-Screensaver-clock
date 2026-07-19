import { app, BrowserWindow, screen, ipcMain, dialog } from 'electron';
import path from 'path';
import url from 'url';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv;
const isDev = process.env.NODE_ENV === 'development';

// Dev-only test aids (never enabled in a shipped build unless the env var is set):
//   FLUX_TABATHA_TEST_URL  — override the Context View URL, e.g. an unreachable host,
//                             to exercise the offline fallback path.
//   FLUX_SAVER_TEST_MODE=1 — open screensaver windows as small, non-fullscreen,
//                             non-always-on-top windows so testing doesn't take over the screen.
const TABATHA_CONTEXT_URL = process.env.FLUX_TABATHA_TEST_URL || 'https://tabatha.pondocean.co/sidecar/?embed=desk';
const TABATHA_SIGNIN_URL = 'https://tabatha.pondocean.co/sidecar/';
const isSaverTestMode = process.env.FLUX_SAVER_TEST_MODE === '1';

// ── Settings bridge (renderer localStorage isn't readable from main) ──
// The config window pushes `fluxSettings` to main over IPC whenever it changes;
// main persists the subset it cares about to disk so it's available at startup,
// before any renderer/window exists to ask.
function settingsFilePath() {
  return path.join(app.getPath('userData'), 'flux-settings.json');
}

function readPersistedSettings() {
  try {
    const raw = fs.readFileSync(settingsFilePath(), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writePersistedSettings(settings) {
  try {
    fs.writeFileSync(settingsFilePath(), JSON.stringify(settings), 'utf-8');
  } catch (err) {
    console.error('[flux] failed to persist settings:', err);
  }
}

function getLocalFlipClockUrl() {
  return isDev
    ? 'http://localhost:5173'
    : url.format({
        pathname: path.join(__dirname, '../dist/index.html'),
        protocol: 'file:',
        slashes: true
      });
}

function createScreensaverWindow() {
  const displays = screen.getAllDisplays();
  const primaryDisplay = screen.getPrimaryDisplay();
  const persistedSettings = readPersistedSettings();
  const contextViewEnabled = !!persistedSettings.enableTabathaContextView;

  displays.forEach((display) => {
    // Only the primary display gets the Tabatha Context View — secondary displays
    // always keep the flip clock. (Configurable per-display could be a future setting.)
    const isPrimary = display.id === primaryDisplay.id;
    const useContextView = contextViewEnabled && isPrimary;

    let win = new BrowserWindow({
      x: display.bounds.x,
      y: display.bounds.y,
      width: isSaverTestMode ? 960 : display.bounds.width,
      height: isSaverTestMode ? 600 : display.bounds.height,
      fullscreen: !isSaverTestMode,
      frame: isSaverTestMode,
      alwaysOnTop: !isSaverTestMode,
      skipTaskbar: !isSaverTestMode,
      backgroundColor: '#0b0b0b',
      show: false, // Don't show until content is ready
      webPreferences: useContextView
        ? {
            // Remote-URL window: hardened. No Node access, no preload exposure,
            // real web security. Shares the signed-in session with the sign-in window.
            partition: 'persist:tabatha',
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true
          }
        : {
            // Local flip-clock window: unchanged from before (trusted local content only).
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false
          }
    });

    if (useContextView) {
      let fellBack = false;
      win.webContents.on('did-fail-load', (_event, errorCode, errorDescription, _validatedURL, isMainFrame) => {
        if (!isMainFrame || fellBack) return;
        fellBack = true;
        console.warn(`[flux] Tabatha Context View failed to load (${errorCode} ${errorDescription}) — falling back to flip clock.`);
        win.loadURL(getLocalFlipClockUrl());
      });
      win.loadURL(TABATHA_CONTEXT_URL);
    } else {
      win.loadURL(getLocalFlipClockUrl());
    }

    // Only show the window after content has finished rendering
    win.webContents.on('did-finish-load', () => {
      win.show();
    });

    // Delay exit detection by 2 seconds to avoid false triggers during startup
    setTimeout(() => {
      // Keyboard input exits screensaver
      win.webContents.on('before-input-event', () => {
        app.quit();
      });
    }, 2000);
  });
}

// One-time interactive sign-in window. It's a normal (non-fullscreen, non-kiosk)
// window on the same persistent partition as the Context View screensaver window,
// so completing Google/magic-link sign-in here is reused there. No credential
// handling happens in this app — the hosted Tabatha page owns its own auth.
function createSignInWindow() {
  const win = new BrowserWindow({
    width: 480,
    height: 720,
    title: 'Sign in to Tabatha',
    webPreferences: {
      partition: 'persist:tabatha',
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    }
  });
  win.loadURL(TABATHA_SIGNIN_URL);
}

function createConfigWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 650,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  });

  const startUrl = isDev 
      ? 'http://localhost:5173?config=true' 
      : url.format({
          pathname: path.join(__dirname, '../dist/index.html'),
          protocol: 'file:',
          slashes: true,
          search: '?config=true'
        });
  win.loadURL(startUrl);
}

app.whenReady().then(() => {
  // Parse Windows screensaver arguments
  // Windows passes arguments in varying formats, e.g. /c, /c:123456, /s, /p:123456
  const isSettings = args.some(arg => arg.toLowerCase().startsWith('/c') || arg.toLowerCase().startsWith('-c'));
  const isPreview  = args.some(arg => arg.toLowerCase().startsWith('/p') || arg.toLowerCase().startsWith('-p'));

  if (isSettings) {
    createConfigWindow();
  } else if (isPreview) {
    // Native preview requires SetParent FFI into the mini-window HWND — skip for now.
    // Just quit cleanly so the preview area stays black (standard behavior for many screensavers).
    app.quit();
  } else {
    // /s or no arguments: Start screensaver
    createScreensaverWindow();
  }
});

// ── IPC: Image picker for background ──
ipcMain.handle('pick-image', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Choose Background Image',
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif'] }
    ],
    properties: ['openFile']
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  // Format as a valid file URL for rendering in the background image
  return 'file:///' + result.filePaths[0].replace(/\\/g, '/');
});

ipcMain.on('quit-screensaver', () => {
    app.quit();
});

// ── IPC: Settings bridge from the config window ──
ipcMain.on('flux-settings-updated', (_event, settings) => {
  writePersistedSettings(settings);
});

// ── IPC: One-time Tabatha sign-in window ──
ipcMain.on('open-tabatha-signin', () => {
  createSignInWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
