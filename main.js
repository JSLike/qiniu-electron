const {app,BrowserWindow}=require('electron');
const isDev=require('electron-is-dev');

app.on('ready',()=>{

    const mainWindow=new BrowserWindow({
        width:1200,
        height:800,
        webPreferences:{
            nodeIntegration:true
        }
    })
    const urlLocation=isDev? 'http://localhost:3000':'productionUrl'
    mainWindow.loadURL(urlLocation)

})
