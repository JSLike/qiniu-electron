const {app, ipcMain, Menu} = require('electron');
const isDev = require('electron-is-dev');
const menuTemplate = require('./src/menuTemplate')
const AppWindow = require('./src/AppWindow')
const path =require('path')
let mainWindow,settingsWindow;

//主要流程必须再app准备就绪时运行

app.on('ready', () => {
    const urlLocation = isDev ? 'http://localhost:9000' : 'productionUrl';

    const mainWindowConfig={
        width: 1200,
        height: 800,
    };
    mainWindow = new AppWindow(mainWindowConfig,urlLocation)
    mainWindow.on('close',()=>{
        mainWindow=null
    })

    ipcMain.on('open-settings-window',()=>{
        const settingsWindowConfig={
            width: 800  ,
            height: 600,
            parent:mainWindow,
            modal:true
            // autoHideMenuBar:true,
        }
        const settingsFileLocation=`file://${path.join(__dirname,'./settings/settings.html')}`;
        settingsWindow= new AppWindow(settingsWindowConfig,settingsFileLocation)
        settingsWindow.menuBarVisible=false;//通过实例属性设置系统菜单栏是否可见
        settingsWindow.on('close',()=>{
            settingsWindow=null;
            mainWindow.focus()//聚焦窗口
        })
    })

//set Menu
    const menu = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(menu)
})

