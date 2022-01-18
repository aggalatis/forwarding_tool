const electron = require('electron')
const { app, BrowserWindow, Menu, MenuItem, ipcMain, session } = electron
const ipcRenderer = require('electron').ipcRenderer

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

// This method will be called when Electron has finished.
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.on('ready', () => {
    const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize

    win = new BrowserWindow({
        width: width,
        height: height,
        //frame: false, makes the application to have no frame at all
        webPreferences: {
            nodeIntegration: true,
        },
        icon: __dirname + '/assets/icons/diana_icon.png',
    })

    win.loadFile('pages/login.html')
    win.maximize()
    //win.setMenu(null); //disables the menu and all the shortcuts
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    })

    win.on('close', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    })

    ipcMain.on('restart', (event, arg) => {
        //console.log(arg) // prints "ping"
        //event.sender.send('updatePage', 'pong')
        app.relaunch()
        app.quit()
    })

    ipcMain.on('quit', (event, arg) => {
        //console.log(arg) // prints "ping"
        //event.sender.send('updatePage', 'pong')
        app.isQuiting = true
        app.quit()
    })

    ipcMain.on('loadTransfers', (event, arg) => {
        win_transfers = new BrowserWindow({
            //frame: false, makes the application to have no frame at all
            webPreferences: {
                nodeIntegration: true,
            },
        })
        win_transfers.loadFile('pages/individuals.html')
        win_transfers.maximize()
        win_transfers.webContents.on('did-finish-load', () => {
            win_transfers.webContents.send('userData', arg)
            if (win) {
                win.close()
            }
        })
    })
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})
