const {app, ipcMain, Menu, dialog} = require('electron');
const isDev = require('electron-is-dev');
const menuTemplate = require('./src/menuTemplate')
const AppWindow = require('./src/AppWindow')
const path = require('path')
const Store = require('electron-store');
const settingsStore = new Store({name: 'Settings'})
const fileStore =new Store({name: 'File Data'})
const QiNiuManager = require('./src/utils/QiniuManager');
let mainWindow, settingsWindow;

const createManger = () => {
    const accessKey = settingsStore.get('accessKey');
    const secretKey = settingsStore.get('secretKey');
    const bucketName = settingsStore.get('bucketName');
    return new QiNiuManager(accessKey, secretKey, bucketName);
}


app.on('ready', () => {
    const urlLocation = isDev ? 'http://localhost:9000' : 'productionUrl';

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
    ipcMain.on('upload-all-to-qiniu',()=>{
        mainWindow.webContents.send('loading-status',true)
        setTimeout(()=>{
            mainWindow.webContents.send('loading-status',false)
        },2000)
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
        const filesObj=fileStore.get('files');
        const {key,id,path}=data;

        console.log('data.key---', data.key)
        manager.getStat(data.key).then(res => {
            console.log('res---', res.respBody.putTime);
            console.log('res---',filesObj[data.id].createdAt);
            const {statusCode,respBody}=res;
            const serverUpdatedTime=Math.round(respBody.putTime/10000);
            const localUpdatedTime=filesObj[data.id].createdAt;

            if (serverUpdatedTime>localUpdatedTime||!localUpdatedTime){
                console.log('has new File')
                manager.downloadFile(key,path).then(()=>{
                    mainWindow.webContents.send('file-downloaded',{status:'download-success',id});
                })
            }else{
                console.log('no new File')
                mainWindow.webContents.send('file-downloaded',{status:'no-new-success',id});
            }
        }).catch(err => {
            if (err.statusCode===612){
                console.log('no-file')
                mainWindow.webContents.send('file-downloaded',{status:'no-file',id});
            }
        })
    })
})


app.on('window-all-closed', () => {
    app.quit()
})
