import { app, BrowserWindow, screen, ipcMain } from 'electron';
import path from 'path';
import url from 'url';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv;
const isDev = process.env.NODE_ENV === 'development';

function createScreensaverWindow() {
  const displays = screen.getAllDisplays();
  
  displays.forEach((display) => {
    let win = new BrowserWindow({
      x: display.bounds.x,
      y: display.bounds.y,
      width: display.bounds.width,
      height: display.bounds.height,
      fullscreen: true,
      frame: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      backgroundColor: '#0b0b0b',
      show: false, // Don't show until content is ready
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    const startUrl = isDev 
      ? 'http://localhost:5173' 
      : url.format({
          pathname: path.join(__dirname, '../dist/index.html'),
          protocol: 'file:',
          slashes: true
        });

    win.loadURL(startUrl);

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

function createConfigWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 500,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
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

ipcMain.on('quit-screensaver', () => {
    app.quit();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
