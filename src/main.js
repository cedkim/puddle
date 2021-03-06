const {app, BrowserWindow, protocol, ipcMain, autoUpdater} = require("electron");
const path = require("path");
const url = require("url")
const https = require("https");
const vm = require("vm");
let win;
function createWindow() {
  win = new BrowserWindow({width: 800, height: 600});
  win.loadFile(url.format({pathname: path.join(__dirname, "index.html"), protocol: 'file:', slashes: true, webPreferences: {webSecurity: false}}));
  win.on("closed", () => {
    win = null;
  });
  win.webContents.on('crashed', () => {
    win.destroy();
    createWindow();
  });
}
app.on("ready", function() {
  createWindow();
  protocol.registerFileProtocol("puddle", function(request, callback) {
    const url = request.url.substr(7);
    https.get(url, function(res) {
      res.on("data", function(data) {
        vm.runInNewContext(data);
      });
    });
    callback({path: "${__dirname}/opening.html"});
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});
require("update-electron-app")();
