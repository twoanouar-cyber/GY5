const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  query: (sql, params) => ipcRenderer.invoke('database-query', sql, params),
  run: (sql, params) => ipcRenderer.invoke('database-run', sql, params),
  
  // Authentication
  login: (username, password) => ipcRenderer.invoke('login', username, password),
  
  // User management
  createUser: (userData) => ipcRenderer.invoke('create-user', userData),
  updateUser: (userId, userData) => ipcRenderer.invoke('update-user', userId, userData),
  
  // Database management
  backupDatabase: () => ipcRenderer.invoke('backup-database'),
  restoreDatabase: () => ipcRenderer.invoke('restore-database'),
  repairDatabase: () => ipcRenderer.invoke('repair-database'),
  
  // Debug
  debugUsers: () => ipcRenderer.invoke('debug-users'),
  debugPasswords: () => ipcRenderer.invoke('debug-passwords'),
  debugLogin: (username, password) => ipcRenderer.invoke('debug-login', username, password),
  
  // System info
  platform: process.platform,
  appVersion: () => ipcRenderer.invoke('app-version'),
  
  // Window controls
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  
  // Dialog
  showMessage: (options) => ipcRenderer.invoke('show-message', options),
  showError: (title, message) => ipcRenderer.invoke('show-error', title, message),
  showConfirm: (options) => ipcRenderer.invoke('show-confirm', options)
});