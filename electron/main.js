// electron/main.js (ESM)
import { app, BrowserWindow } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const VITE_DEV_SERVER_URL = 'http://localhost:5173';
const DIST_INDEX = join(__dirname, '../dist/index.html');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    fullscreen: false,
    kiosk: false,
    frame: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const distExists = fs.existsSync(DIST_INDEX);

  if (!distExists) {
    // нет сборки → предполагаем dev (vite)
    console.log('[electron] dist not found, loading Vite dev server:', VITE_DEV_SERVER_URL);
    win.loadURL(VITE_DEV_SERVER_URL).catch((err) => {
      console.error('[electron] failed to load dev url:', err);
      win.loadFile(join(__dirname, '../dist/index.html')).catch(e => console.error(e));
    });
    // полезно открыть DevTools в dev
    win.webContents.openDevTools();
  } else {
    // production build найден — грузим локально
    console.log('[electron] loading dist index:', DIST_INDEX);
    win.loadFile(DIST_INDEX).catch((err) => {
      console.error('[electron] failed to load file:', err);
      // покажем DevTools, чтобы увидеть ошибку рендер-процесса
      win.webContents.openDevTools();
    });
  }

  // отлавливаем неудачные загрузки (полезно для диагностики 404 на ассеты)
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('[electron] did-fail-load', { errorCode, errorDescription, validatedURL });
    // открыть DevTools чтобы видеть стек
    win.webContents.openDevTools();
  });
}
app.commandLine.appendSwitch('enable-accelerated-video-decode');
app.commandLine.appendSwitch('enable-accelerated-mjpeg-decode');
app.commandLine.appendSwitch('enable-accelerated-vpx-decode'); // для webm
app.commandLine.appendSwitch('ignore-gpu-blocklist');

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
