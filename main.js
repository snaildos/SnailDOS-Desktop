const { autoUpdater } = require("electron-updater");
const { SSL_OP_EPHEMERAL_RSA } = require("constants");
const { app, BrowserWindow, ipcMain, protocol, ipcRenderer, dialog } = require("electron");
const { watchFile } = require("fs");
const { trackEvent } = require("./lib/analytics.js");
const {TitlebarRespect} = require('electron-titlebar-respect')
const glasstron = require('glasstron-clarity');
const electron = require("electron");
const isOnline = require('is-online');
const Store = require("electron-store");
const store = new Store();
const axios = require('axios');
token = store.get('token')
store.set('createonlogin', false)
// Notify
const { Notification } = require("electron");
electron.app.commandLine.appendSwitch("enable-transparent-visuals");

// Start the libaries
require("./lib/rpc.js");
console.log("RPC lib init.");

// Loading screen
/// create a global var, wich will keep a reference to out loadingScreen window
let loadingScreen;
const createLoadingScreen = () => {
  loadingScreen = new BrowserWindow(
    Object.assign({
      width: 700,
      height: 120,
      alwaysOnTop: true,
      frame: false,
      fullscreen: false,
      show: true,
      transparent: true,
      webPreferences: {
        sandbox: true,
        nodeIntergration: false,
        contextIsolation: true
      }
    })
  );
  loadingScreen.setResizable(false);
  loadingScreen.loadFile("./assets/pages/splash.html");
  loadingScreen.on("closed", () => (loadingScreen = null));
  loadingScreen.webContents.on("did-finish-load", () => {
    loadingScreen.show();
  });
};
console.log("Loading screen ready.");

// Convert boolean to string

// Start the main program
let mainWindow;

function createWindow() {
  mainWindow = new glasstron.BrowserWindow({
    width: 900,
    height: 800,
    show: false,
    frame: global.frame,
    titleBarStyle: global.titleBarStyle,
    fullscreen: false,
    blur: true,
    blurType: global.blurType,
    modal: true,
    icon: "snailfm.ico",
    trafficLightPosition: { x: 24, y: 25 },
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true,
      nativeWindowOpen: true,
      contextIsolation: false,
    },
  });
  mainWindow.setMenuBarVisibility(false);
  mainWindow.setResizable(false);
  mainWindow.loadFile("index.html");
  mainWindow.on("maximize", () => mainWindow.unmaximize());
  ipcMain.on("main_show", () => mainWindow.show());
  ipcMain.on('main_hide', () => {mainWindow.hide();})
  ipcMain.on("load_acc", () => mainWindow.loadFile('index.html'))
  mainWindow.webContents.on("did-finish-load", () => {
    if (loadingScreen) {
      loadingScreen.close();
      trackEvent("app.started", "SnailDOS Desktop has just loaded up!");
    }
    var isDev = require("isdev");

    if (isDev) {
      console.log("In Development!");
    } else {
      console.log("Not in Development!");
    }


    (async () => {
      if ((await isOnline() === false)) {
        console.log("No internet");
        const notification3 = {
          title: "SnailDOS-Desktop",
          body: "No valid network connection! Please reconnect!",
        };        
      mainWindow.loadFile("./assets/pages/nonet.html");
      new Notification(notification3).show();
      }
    })();
    
    mainWindow.show();
    console.log("Ok! Window init, let's check for updates...");
    autoUpdater.checkForUpdatesAndNotify();
    console.log("Update checked. Let's see what happens!");
  });

  mainWindow.on("closed", function () {
    ipcMain.emit('login_exit');
  });
}

console.log("Main screen ready.");
console.log("Setup login function...");
var loginclose = 0
function createloginWindow() {
  const loginWindow = (new BrowserWindow({ 
    width: 1200,
    height: 700,
    minWidth: 800,
    minHeight: 400,
    center: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  }));
  loginWindow.hide()
  loginWindow.on('close', function (event) {
    event.preventDefault();
    const notification4 = {
      title: "SnailDOS",
      body: "This window won't close unless you login! If you want to exit the app, press the close button 3 times!",
    };        
    loginclose = loginclose + 1;
    if (loginclose === 3) {
      store.set('logged_in', false)
      console.log("App quitting...")
      ipcMain.emit('appquit')
    } else {
      if (loginclose === 1) {
        new Notification(notification4).show();
      }
    }
  
  });
  loginWindow.setMenuBarVisibility(false) 
  ipcMain.on('login_sar', () => {loginWindow.show(); loginWindow.loadURL("https://login.snaildos.com?redir=snaildos://login"); loginWindow.maximize(); ipcMain.emit('main_hide')})
  ipcMain.on('login_show', () => {loginWindow.show(); loginWindow.maximize(); loginWindow.restore()})
  ipcMain.on('login_hide', () => {loginWindow.hide();})
  ipcMain.on('login_exit', () => {loginWindow.destroy();})
  loginWindow.loadURL("https://login.snaildos.com?redir=snaildos://login");
}
app.whenReady().then(() => {
  ipcMain.on('token_verify', function() {
    if ((store.get('logged_in') === false)) {
      console.log("All good! Login is disabled...");
      createWindow()
    } else {
  if (token != null) {
    console.log("Verifying Identity..")
    async function verify() {
      await axios.get('https://api.snaildos.com/users/@me', {
      headers: {
      Authorization: token
      }}
      )
        .then(function (response) {
          // handle success
          if (( response.data.status ) === "false") {
            config.set('token', null)
            console.log("Token failure!")
            ipcMain.emit("login_sar")
            loadingScreen.close();
            store.set('createonlogin', true)
          } else {
            console.log("Sucess!")
            createWindow();
          }
        })
        .catch(function (error) {
          // handle error
          console.log(error);
          ipcMain.emit("login_sar")
          console.log("Token failure!")
          loadingScreen.close();
          store.set('createonlogin', true)
        })
        .then(function () {
        });
      }
      verify()
  } else {
    if ((store.get('logged_in') === false)) {
      console.log("All good! Login is disabled...");
      createWindow()
    } else {
      if ((store.get('setup') != undefined)) {
      console.log("User has login enabled but is not logged in, showing login screen...");
      ipcMain.emit("login_sar")
      console.log("Token failure!")
      loadingScreen.close();
      } else {
        createWindow()
      }
    }
  }
}
})
  
  app.setAsDefaultProtocolClient("snaildos");
  protocol.registerHttpProtocol('snaildos', (req, cb) => {
    const url = req.url.substr(23)
      console.log("Logging in: "+url);
      console.log("Token data: "+url)
      store.set('token', url);
      ipcMain.emit('load_acc');
      ipcMain.emit('login_hide')
      ipcMain.emit('main_show')
      store.set('logged_in', true)
      if ((store.get('createonlogin')) === true) {
        createWindow()
        store.set('createonlogin', false);
      }
  })
  app.on("open-url", (event, url) => {
    const url2 = req.url.substr(23)
    console.log("Logging in: "+url2);
    console.log("Token data: "+url2)
    store.set('token', url2);
    ipcMain.emit('load_acc');
    ipcMain.emit('login_hide')
    ipcMain.emit('main_show')
    store.set('logged_in', true);
    if ((store.get('createonlogin')) === true) {
      createWindow()
      store.set('createonlogin', false);
    }
  });
});

let myWindow = null
    
const gotTheLock = app.requestSingleInstanceLock()
    
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
  app.quit()
  })
    
  app.on("ready", () => {
    createLoadingScreen();
    console.log("Send check for updates signal...");
    console.log("Alright, lets go!");
    setTimeout(() => {
      createloginWindow()
      ipcMain.emit('token_verify');
    }, 3000);
  });
  
}
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on("app_version", (event) => {
  event.sender.send("app_version", { version: app.getVersion() });
});

autoUpdater.on("update-available", () => {
  mainWindow.webContents.send("update_available");
});

autoUpdater.on("update-downloaded", () => {
  mainWindow.webContents.send("update_downloaded");
});

ipcMain.on("relaunch", () => {
  ipcMain.emit("close")
});

ipcMain.on("restart_app", () => {
  autoUpdater.quitAndInstall();
});

ipcMain.on('appquit', () => {app.exit()})
ipcMain.on('minimize', () => {mainWindow.minimize()})
ipcMain.on('maximize', () => {mainWindow.maximize()})
ipcMain.on('restore', () => {mainWindow.restore()})
ipcMain.on('close', () => {mainWindow.close(); ipcMain.emit('login_exit');})
