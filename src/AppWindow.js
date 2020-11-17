
const {BrowserWindow} =require('electron')
class AppWindow extends BrowserWindow {
    constructor(config,urlLocation) {
        const basicConfig={
            width:1200,
            height:800,
            webPreferences:{
                nodeIntegration:true,
                enableRemoteModule:true,
            },
            show:false,
            backgroundColor:"#EFEFEF"
        }
        const finalConfig = {...basicConfig,...config};
        super(finalConfig);
        this.loadURL(urlLocation);
        this.once('ready-to-show',()=>{
            this.show()
        })


    }


}

module.exports= AppWindow
