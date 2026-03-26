const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');

app.setName("Cuckoo's Nest Admin");

// Module-level refs so IPC handlers outside createWindows() can reach them
let displayWin = null;
let adminWin = null;

// Cache last known time + text so we can replay them when the display (re)loads
const lastState = { time: null, text: null };

// ── IPC handlers (registered once, not inside createWindows) ──────────────
ipcMain.handle('get-version', () => app.getVersion());

ipcMain.on('update-display', (_event, data) => {
  if (data.type === 'time') lastState.time = data;
  if (data.type === 'text') lastState.text = data;
  if (displayWin) displayWin.webContents.send('update-display', data);
});

// Display renderer signals it is ready — replay cached state, or ask admin to resend
ipcMain.on('display-ready', () => {
  if (lastState.time) displayWin.webContents.send('update-display', lastState.time);
  if (lastState.text) displayWin.webContents.send('update-display', lastState.text);
  // No cached state yet (fresh startup race) — ask admin to push its current values
  if (!lastState.time && adminWin) adminWin.webContents.send('sync-request');
});

// ── App lifecycle ─────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createWindows();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindows();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

function createWindows() {
  const primary = screen.getPrimaryDisplay();
  const externalDisplay = screen.getAllDisplays().find(d => d.id !== primary.id);

  if (externalDisplay) {
    displayWin = new BrowserWindow({
      x: externalDisplay.bounds.x,
      y: externalDisplay.bounds.y,
      fullscreen: true,
      frame: false,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        backgroundThrottling: false,
        preload: path.join(__dirname, 'preload-display.js'),
      },
    });
  } else {
    // No external monitor — open as a moveable preview window
    const { width, height } = primary.workAreaSize;
    displayWin = new BrowserWindow({
      width: Math.round(width * 0.55),
      height: Math.round(height * 0.55),
      x: Math.round(width * 0.42),
      y: Math.round(height * 0.06),
      title: "Cuckoo's Nest – Display preview",
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        backgroundThrottling: false,
        preload: path.join(__dirname, 'preload-display.js'),
      },
    });
  }

  displayWin.loadFile('cuckoo.html');
  displayWin.on('closed', () => app.quit());

  adminWin = new BrowserWindow({
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
      preload: path.join(__dirname, 'preload-admin.js'),
    },
  });

  adminWin.maximize();
  adminWin.show();
  adminWin.loadFile('index.html');
  adminWin.on('closed', () => app.quit());
}
