const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store({
  name: 'gdpi-local-db',
  defaults: {
    records: [],
  },
});

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 980,
    minHeight: 640,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  ipcMain.handle('local-db:get-all', () => store.get('records', []));

  ipcMain.handle('local-db:add', (_event, payload) => {
    const current = store.get('records', []);
    const entry = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...payload,
    };

    store.set('records', [...current, entry]);
    return entry;
  });

  ipcMain.handle('local-db:remove', (_event, id) => {
    const current = store.get('records', []);
    const next = current.filter((item) => item.id !== id);
    store.set('records', next);
    return next;
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
