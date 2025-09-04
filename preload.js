const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');

contextBridge.exposeInMainWorld('electronAPI', {
  // Уведомления
  showNotification: (title, body) => ipcRenderer.send('show-notification', title, body),
  
  // Таймер
  onToggleTimer: (callback) => ipcRenderer.on('toggle-timer', callback),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  
  // Версия приложения
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Статистика
  exportStats: (data) => ipcRenderer.invoke('export-stats', data),
  importStats: () => ipcRenderer.invoke('import-stats'),
  
  // Обновления
  restartApp: () => ipcRenderer.send('restart_app'),
  checkForUpdates: () => ipcRenderer.send('check_for_updates'),
  onUpdateAvailable: (callback) => ipcRenderer.on('update_available', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update_downloaded', callback),
  
  // Звуки - НОВОЕ!
  playSound: (soundName) => ipcRenderer.invoke('play-sound', soundName),
  getAssetsPath: () => ipcRenderer.invoke('get-assets-path')
});