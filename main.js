const {app, ipcMain, Menu, dialog} = require('electron');
const {autoUpdater} = require("electron-updater")
const isDev = require('electron-is-dev');
const menuTemplate = require('./src/menuTemplate')
const AppWindow = require('./src/AppWindow')
const path = require('path')
const Store = require('electron-store');
const settingsStore = new Store({name: 'Settings'})
const fileStore = new Store({name: 'File Data'})
const QiNiuManager = require('./src/utils/QiniuManager');
let mainWindow, settingsWindow;

const createManger = () => {
    const accessKey = settingsStore.get('accessKey');
    const secretKey = settingsStore.get('secretKey');
    const bucketName = settingsStore.get('bucketName');
    return new QiNiuManager(accessKey, secretKey, bucketName);
}
let productionUrl = `file://${path.join(__dirname, './index.html')}`;

app.on('ready', () => {
    if (isDev) {
        // autoUpdater.updateConfigPath = path.join(__dirname, 'dev-app-update.yml')
    }
    autoUpdater.setFeedURL({
        provider:'github',
        repo:'qiniu-electron',
        token:"9fe8dd80097dca404014024c2dccc2f67cdff465",
        private:true,
    })
    autoUpdater.autoDownload = false
    autoUpdater.checkForUpdates()
    autoUpdater.on('error', (error) => {
        dialog.showErrorBox('Error: ', error == null ? "unknown" : (error.stack || error).toString())
    })
    autoUpdater.on('checking-for-update', () => {
        console.log('Checking for update...');
    })
    autoUpdater.on('update-available', () => {
        dialog.showMessageBox({
            type: 'info',
            title: '应用有新的版本',
            message: '发现新版本，是否现在更新?',
            buttons: ['是', '否']
        }).then(res => {
            console.log(res)
            //     if (buttonIndex === 0) {
            //         autoUpdater.downloadUpdate()
            //     }
        })
    })

    autoUpdater.on('update-not-available', () => {
        dialog.showMessageBox({
            title: '没有新版本',
            message: '当前已经是最新版本'
        })
    })
    const urlLocation = isDev ? 'http://localhost:9000' : productionUrl;
    const mainWindowConfig = {
        width: 1200,
        height: 800,
        // useContentSize:true
    };
    mainWindow = new AppWindow(mainWindowConfig, urlLocation)
    mainWindow.on('close', () => {
        mainWindow = null
    })
//set Menu
    const menu = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(menu)

    ipcMain.on('open-settings-window', () => {
        const settingsWindowConfig = {
            width: 800,
            height: 600,
            parent: mainWindow,
            modal: true,
            // autoHideMenuBar:true,
        }
        const settingsFileLocation = `file://${path.join(__dirname, './settings/settings.html')}`;
        settingsWindow = new AppWindow(settingsWindowConfig, settingsFileLocation)
        // settingsWindow.menuBarVisible=false;//通过实例属性设置系统菜单栏是否可见
        // settingsWindow.removeMenu()//通过实例方法移除系统菜单栏
        settingsWindow.on('close', () => {
            settingsWindow = null;
            mainWindow.focus()//聚焦窗口
        })
    })
    ipcMain.on('upload-all-to-qiniu', () => {
        mainWindow.webContents.send('loading-status', true);
        const manager = createManger();
        const filesObj = fileStore.get('files') || {};
        const uploadPromiseArr = Object.keys(filesObj).map(key => {
            const file = filesObj[key];
            return manager.uploadFile(`${file.title}.md`, file.path);
        })
        Promise.all(uploadPromiseArr).then(result => {
            console.log(result)
            dialog.showMessageBoxSync({
                type: 'info',
                title: `成功上传了${result.length}个文件`,
                message: `成功上传了${result.length}个文件`
            })

            mainWindow.webContents.send('files-uploaded')
        }).catch(err => {
            dialog.showErrorBox('同步失败', '请检查参数')
        }).finally(() => {
            mainWindow.webContents.send('loading-status', false);
        })


        setTimeout(() => {
            mainWindow.webContents.send('loading-status', false)
        }, 2000)
    })

    ipcMain.on('config-is-saved', (event) => {
        //watch out menu items index for mac and windows
        let qiniuMenu = process.platform === 'darwin' ? menu.items[3] : menu.items[2];
        const switchItems = (toggle) => {
            [1, 2, 3].forEach(num => {
                let menuItems = qiniuMenu.submenu.items;
                menuItems[num].enabled = toggle
            })
        }
        const qiniuIsConfiged = ['accessKey', 'secretKey', 'bucketName'].every(key => !!settingsStore.get(key))

        switchItems(!!qiniuIsConfiged)
    })

    ipcMain.on('upload-file', (event, data) => {
        console.log('upload-file----', data)
        const manager = createManger();
        console.log(data.path)
        manager.uploadFile(data.key, data.path).then(data => {
            console.log('上传成功', data)
            mainWindow.webContents.send('active-file-uploaded')
        }).catch(err => {
            dialog.showErrorBox('同步失败', '请检查七牛云参数是否正确')
        })
    })

    ipcMain.on('download-file', (event, data) => {
        const manager = createManger();
        const filesObj = fileStore.get('files');
        const {key, id, path} = data;

        console.log('data.key---', data.key)
        manager.getStat(data.key).then(res => {
            console.log('res---', res.respBody.putTime);
            console.log('res---', filesObj[data.id].createdAt);
            const {statusCode, respBody} = res;
            const serverUpdatedTime = Math.round(respBody.putTime / 10000);
            const localUpdatedTime = filesObj[data.id].createdAt;

            if (serverUpdatedTime > localUpdatedTime || !localUpdatedTime) {
                console.log('has new File')
                manager.downloadFile(key, path).then(() => {
                    mainWindow.webContents.send('file-downloaded', {status: 'download-success', id});
                })
            } else {
                console.log('no new File')
                mainWindow.webContents.send('file-downloaded', {status: 'no-new-success', id});
            }
        }).catch(err => {
            if (err.statusCode === 612) {
                console.log('no-file')
                mainWindow.webContents.send('file-downloaded', {status: 'no-file', id});
            }
        })
    })
})


app.on('window-all-closed', () => {
    app.quit()
})
