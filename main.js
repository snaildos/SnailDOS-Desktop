const { autoUpdater } = require('electron-updater');
const { SSL_OP_EPHEMERAL_RSA } = require('constants');
const { app, BrowserWindow, ipcMain, ipcRenderer } = require('electron');
const { watchFile } = require('fs');
// Notify
const { Notification } = require('electron')


function neterr() {
  const notification = {
    title: 'SnailPortal',
    body: 'No valid network connection! Please reconnect!'
  }
  new Notification(notification).show()
}

const Store = require('electron-store');

const security = new Store();

// Start the libaries
require('./libs/rpc.js');
// wait function
function wait(ms)
{
    var d = new Date();
    var d2 = null;
    do { d2 = new Date(); }
    while(d2-d < ms);
}
// Loading screen
/// Start a init
const createLoadingScreen = () => {
  loadingScreen = new BrowserWindow(
    Object.assign({
      width: 800,
      height: 368,
      alwaysOnTop: true,
      frame: false,
      fullscreen: false,
      show: false
    })
  );
  loadingScreen.setResizable(false);
  loadingScreen.loadFile('splash.html');
  security.set('loading', 'true');
  loadingScreen.on('closed', () => (loadingScreen = null));
  loadingScreen.webContents.on('did-finish-load', () => {
    loadingScreen.show();
  });
};
console.log("Loading screen ready.");


function securitycreate() {
  securitywin = new BrowserWindow({
    width: 500,
    height: 600,
    show: false,
    alwaysOnTop: false,
    frame: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: false
    }
  });
}


function createWindow () {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    show: false,
    fullscreen: false,
    modal: true,
    icon: 'snailfm.ico',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  mainWindow.setMenuBarVisibility(false)
  mainWindow.setResizable(false)
  mainWindow.loadFile('index.html');
  security.set('loading', false);
  mainWindow.on('maximize', () => mainWindow.unmaximize());
  setTimeout(() => {
    if (loadingScreen) {
      loadingScreen.close();
    }
    var isDev = require('isdev')

if(isDev) {
  console.log("In Development!")
} else {
  console.log("Not in Development!")
}
    mainWindow.show();
        //security
        if (security.get('loading')) {
console.log("Security error!")
mainWindow.close()
          } else {
            console.log("Security check sucess.")
          }
    console.log("Ok! Window init, let's check for updates...")
    security.set('loading', 'false')
    autoUpdater.checkForUpdatesAndNotify();
    console.log("Update checked. Let's see what happens!");
}, 4000);

  
  
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

function eulacreate() {
  eula = new BrowserWindow({
    width: 500,
    height: 400,
    show: false,
    alwaysOnTop: true,
    frame: false,
    modal: true,
    webPreferences: {
      nodeIntegration: true,
    }
  });
}

function freehost() {
  freehost = new BrowserWindow({
    width: 500,
    height: 400,
    show: false,
    alwaysOnTop: true,
    frame: true,
    modal: true,
    webPreferences: {
      nodeIntegration: true,
    }
  });
}



console.log("Main screen ready.");

app.on('ready', () => {
  // Start the main program
if (security.get('pin')) {
  console.log("Pin detected. Cancel load process.")
  wait('100')
  securitycreate();
  securitywin.setMenuBarVisibility(false)
  securitywin.setResizable(false)
  securitywin.show();
  securitywin.loadFile('login.html')
  return;
}
  createLoadingScreen();
  console.log("Send check for updates signal...");
  console.log("Alright, lets go!");
  createWindow()
  setTimeout(() => {
    console.log("Update check suc.")
  }, 5000);
})

var internetAvailable = require("internet-available");

// Set a timeout and a limit of attempts to check for connection
internetAvailable({
    timeout: 2000,
    retries: 7,
}).then(function(){
    console.log("Internet available");
}).catch(function(){
    console.log("No internet");
    neterr()
    mainWindow.loadFile('nonet.html');
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});

autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update_available');
});

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update_downloaded');
});

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});

ipcMain.on('relaunch', () => {
  app.relaunch()
  app.exit()
});

ipcMain.on('eula', () => {
  eulacreate();
  eula.show();
  eula.loadFile('eula.html')
});

ipcMain.on('freehost', () => {
  freehost();
  freehost.show();
  freehost.loadFile('./ui/index.html')
});

ipcMain.on('loginsucess', () => {
  console.log('Logged in')
  createLoadingScreen();
  console.log("Send check for updates signal...");
  console.log("Alright, lets go!");
  createWindow()
  securitywin.close();
  setTimeout(() => {
    console.log("Update check suc.")
  }, 5000);
});