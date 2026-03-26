const { app, BrowserWindow, screen, ipcMain } = require('electron');

ipcMain.handle('get-version', () => app.getVersion());
const path = require('path');

app.setName("Cuckoo's Nest Admin");

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
  const displays = screen.getAllDisplays();
  const externalDisplay = displays.find(
    (d) => d.bounds.x !== 0 || d.bounds.y !== 0
  );

  let displayWin;

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
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
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

  ipcMain.on('update-display', (_event, data) => {
    displayWin.webContents.send('update-display', data);
  });

  const adminWin = new BrowserWindow({
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
