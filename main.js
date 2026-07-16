const {
    app,
    BrowserWindow,
    Menu,
    ipcMain,
    dialog,
    shell,
} = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');

const store = new Store();

let saveFolder = null;

// Выбор папки (1 раз)
ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
    });

    if (!result.canceled) {
        saveFolder = result.filePaths[0];
    }

    return saveFolder;
});

ipcMain.handle('save-file', async (event, filePath, data) => {
    fs.writeFileSync(filePath, data);
    return true;
});

// Сохранение PDF
ipcMain.handle('save-pdf', async (event, { fileName, data }) => {
    if (!saveFolder) return false;

    const filePath = path.join(saveFolder, fileName);
    fs.writeFileSync(filePath, Buffer.from(data));

    return true;
});

let win;

function createWindow() {
    win = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    win.loadFile('index.html');

    // Загрузка DevTools при npm star открыт build закрыт
    if (process.env.NODE_ENV === 'development') {
        win.webContents.openDevTools();
    }

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Копировать', role: 'copy' },
        { label: 'Вырезать', role: 'cut' },
        { label: 'Вставить', role: 'paste' },
    ]);

    win.webContents.on('context-menu', (e, params) => {
        contextMenu.popup(win, params.x, params.y);
    });
}

ipcMain.handle('save-all-kp', (event, kpList) => {
    store.set('allKP', kpList);
    return true;
});

ipcMain.handle('load-all-kp', () => {
    return store.get('allKP') || [];
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
