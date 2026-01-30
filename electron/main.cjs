const { app, BrowserWindow, screen, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';

let loadURL;
if (!isDev) {
    const serve = require('electron-serve');
    loadURL = serve({ directory: path.join(__dirname, '../dist') });
}

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    const mainWindow = new BrowserWindow({
        width: Math.min(1280, width),
        height: Math.min(800, height),
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
        },
        title: 'HexaResume',
        show: false,
    });

    if (isDev) {
        const baseUrl = 'http://localhost:5173';
        const url = process.env.ADMIN_MODE === 'true' ? `${baseUrl}/admin` : baseUrl;
        mainWindow.loadURL(url);
        mainWindow.webContents.openDevTools();
    } else {
        loadURL(mainWindow);
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.maximize();
        mainWindow.show();
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('download-pdf', async (event, html) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const { filePath } = await dialog.showSaveDialog(win, {
        title: 'Save Resume',
        defaultPath: 'resume.pdf',
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
    });

    if (filePath) {
        // Create a hidden window to render the PDF
        const workerWindow = new BrowserWindow({
            show: false,
            webPreferences: {
                nodeIntegration: false
            }
        });

        // Add A4 styles
        const a4Style = `
            <style>
                @page { size: A4; margin: 0; }
                body { margin: 0; padding: 0; }
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            </style>
        `;
        const fullHtml = html.includes('<style>') ? html.replace('</head>', `${a4Style}</head>`) : `${a4Style}${html}`;

        await workerWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(fullHtml)}`);

        try {
            const data = await workerWindow.webContents.printToPDF({
                printBackground: true,
                marginsType: 0, // No margins
                pageSize: 'A4'
            });
            fs.writeFileSync(filePath, data);
        } catch (error) {
            console.error('Failed to generate PDF:', error);
        } finally {
            workerWindow.close();
        }
    }
});
