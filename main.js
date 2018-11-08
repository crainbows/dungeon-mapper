const electron = require('electron');
const {app, BrowserWindow} = electron;

let serverProc = require('child_process').fork(require.resolve('./bin/dungeon-mapper.js'))

let win;

app.on('ready', () => {
  const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
  win = new BrowserWindow({width, height});
  win.loadURL('http://localhost:3000/dm');

  let win2 = new BrowserWindow({ frame: false })
  win2.on('close', () => { win2 = null });
  win2.loadURL('http://localhost:3000');
  win2.show();
})

app.on('exit', () => {
  serverProc.exit();
  win2.exit();
})