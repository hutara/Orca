const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  handleMenuClick: (command) => ipcRenderer.send('menu-click', command),
  injectMenu: (menuTemplate) => ipcRenderer.send('inject-menu', menuTemplate),
  toggleFullscreen: () => ipcRenderer.send('toggle-fullscreen'),
  toggleVisible: () => ipcRenderer.send('toggle-visible'),
  toggleMenubar: () => ipcRenderer.send('toggle-menubar'),
  inspect: () => ipcRenderer.send('inspect')
})

// دریافت پاسخ‌ها (اختیاری)
ipcRenderer.on('menu-response', (event, arg) => {
  console.log('Menu response:', arg)
})

// FIX: Add injectMenu handler if missing
if (!electronAPI.injectMenu) {
  electronAPI.injectMenu = (template) => {
    try {
      const { Menu } = require('electron');
      Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    } catch (err) {
      console.warn('Inject menu failed:', err);
    }
  };
}