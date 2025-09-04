const { app, BrowserWindow, Tray, Menu, nativeImage, Notification, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let tray = null;
let appIsQuitting = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 600,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false,
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('close', (event) => {
    if (!appIsQuitting) {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
  });
}

function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  const resizedIcon = icon.resize({ width: 16, height: 16 });
  
  tray = new Tray(resizedIcon);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Показать/Скрыть',
      click: () => {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    {
      label: 'Пауза/Продолжить',
      click: () => {
        mainWindow.webContents.send('toggle-timer');
      }
    },
    { type: 'separator' },
    {
      label: 'Выход',
      click: () => {
        appIsQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('FocusTimer - Ваш помодоро таймер');
  tray.setContextMenu(contextMenu);
  
  tray.on('double-click', () => {
    mainWindow.show();
    mainWindow.focus();
  });
}

// Обработчики IPC
ipcMain.on('show-notification', (event, title, body) => {
  new Notification({
    title: title,
    body: body,
    icon: path.join(__dirname, 'assets', 'icon.png')
  }).show();
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('export-stats', async (event, data) => {
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    defaultPath: `focus-timer-stats-${new Date().toISOString().split('T')[0]}.json`,
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  if (filePath) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      throw new Error('Ошибка сохранения файла');
    }
  }
  return false;
});

ipcMain.handle('import-stats', async () => {
  const { filePaths } = await dialog.showOpenDialog(mainWindow, {
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    properties: ['openFile']
  });
  
  if (filePaths && filePaths.length > 0) {
    try {
      const data = fs.readFileSync(filePaths[0], 'utf8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error('Ошибка чтения файла');
    }
  }
  return null;
});

ipcMain.on('restart_app', () => {
  appIsQuitting = true;
  app.relaunch();
  app.exit();
});

ipcMain.on('check_for_updates', () => {
  // Заглушка для будущих обновлений
  mainWindow.webContents.send('update_available');
});

app.whenReady().then(() => {
  createWindow();
  createTray();

  app.setLoginItemSettings({
    openAtLogin: true,
    path: app.getPath('exe')
  });
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  appIsQuitting = true;
});