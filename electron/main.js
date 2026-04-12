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
  
  displays.forEach((display, index) => {
    let window = new BrowserWindow({
      x: display.bounds.x,
      y: display.bounds.y,
      width: display.bounds.width,
      height: display.bounds.height,
      fullscreen: true,
      frame: false,
      alwaysOnTop: !isDev,
      kiosk: !isDev,
      skipTaskbar: true,
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

    window.loadURL(startUrl);

    // Screensaver exit logic block
    window.webContents.on('before-input-event', (event, input) => {
      app.quit();
    });
  });
}

function createConfigWindow() {
  const window = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const startUrl = isDev 
      ? 'http://localhost:5173?config=true' 
      : url.format({
          pathname: path.join(__dirname, '../dist/index.html'),
          hash: '/config',
          protocol: 'file:',
          slashes: true
        });
  window.loadURL(startUrl);
}

app.whenReady().then(() => {
  // Parse Windows screensaver arguments
  if (args.includes('/c') || args.includes('-c')) {
    createConfigWindow();
  } else if (args.some(arg => arg.startsWith('/p') || arg.startsWith('-p'))) {
    // Preview mode - exiting for MVP
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
