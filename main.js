const electron = require('electron');
const {app, BrowserWindow} = electron;

let serverProc = require('child_process').fork(require.resolve('./bin/dungeon-mapper.js'))

let win;

app.on('ready', () => {
  const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
  win = new BrowserWindow({width, height});
  win.loadURL('http://localhost:3000');
})