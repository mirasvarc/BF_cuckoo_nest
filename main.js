const { app, BrowserWindow, screen, ipcMain } = require('electron')
const path = require('path')


app.whenReady().then(() => {
    createWindow()

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})



function createWindow () {

    const displays = screen.getAllDisplays()
    
    const externalDisplay = displays.find((display) => {
      return display.bounds.x !== 0 || display.bounds.y !== 0
    })

    if (externalDisplay) {
      const win2 = new BrowserWindow({
        x: externalDisplay.bounds.x + 50,
        y: externalDisplay.bounds.y + 50,
        fullscreen: true,
        frame: false,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
        }
      })
      win2.loadFile('cuckoo.html')

      ipcMain.on('request-update-label-in-second-window', (event, arg) => {
        win2.webContents.send('action-update-label', arg);
      });  

      //win2.webContents.openDevTools()
    } 

    const win = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      }
    })

    win.maximize();
    win.show();

    win.loadFile('index.html')

    win.webContents.openDevTools()

    win.on('closed', function () {
      app.quit()
    })
}