import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = !app.isPackaged;
const devServerUrl = process.env.ELECTRON_RENDERER_URL;
function createWindow() {
    const win = new BrowserWindow({
        width: 1440,
        height: 900,
        minWidth: 1100,
        minHeight: 700,
        backgroundColor: '#08111f',
        title: 'Stonks',
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    if (isDev && devServerUrl) {
        void win.loadURL(devServerUrl);
        win.webContents.openDevTools({ mode: 'detach' });
        return;
    }
    void win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
}
app.whenReady().then(() => {
    ipcMain.handle('game:app-info', () => ({
        name: app.getName(),
        version: app.getVersion(),
        platform: process.platform,
    }));
    ipcMain.handle('game:toggle-fullscreen', () => {
        const win = BrowserWindow.getFocusedWindow();
        if (!win) {
            return false;
        }
        const nextValue = !win.isFullScreen();
        win.setFullScreen(nextValue);
        return nextValue;
    });
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
//# sourceMappingURL=main.js.map