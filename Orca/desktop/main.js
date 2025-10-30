const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  handleMenuClick: (command) => ipcRenderer.send('menu-click', command),
  injectMenu: (menuTemplate) => ipcRenderer.send('inject-menu', menuTemplate),
  toggleFullscreen: () => ipcRenderer.send('toggle-fullscreen'),
  toggleVisible: () => ipcRenderer.send('toggle-visible'),
  toggleMenubar: () => ipcRenderer.send('toggle-menubar'),
  inspect: () => ipcRenderer.send('inspect')
})
app.injectMenu = function (menu) {
  try { Menu.setApplicationMenu(Menu.buildFromTemplate(menu)) }
  catch (err) { console.warn('Cannot inject menu.') }  // Your culprit log
};
// دریافت پاسخ‌ها (اختیاری)
ipcRenderer.on('menu-response', (event, arg) => {
  console.log('Menu response:', arg)
})