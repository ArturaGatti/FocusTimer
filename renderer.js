const { ipcRenderer } = require('electron');

// Экспортируем API для использования в основном коде
window.electronAPI = {
    showNotification: (title, body) => {
        ipcRenderer.invoke('show-notification', title, body);
    },
    
    selectFile: (filters) => {
        return ipcRenderer.invoke('select-file', { filters });
    },
    
    saveFile: (content, defaultName) => {
        return ipcRenderer.invoke('save-file', content, defaultName);
    }
};