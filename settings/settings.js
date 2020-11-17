const {remote} = require('electron');
const Store =require('electron-store');
const settingsStore=new Store({name:'Settings'})

const $ = (id) => {
    return document.getElementById(id);
}

document.addEventListener('DOMContentLoaded', () => {
    let savedLocation=settingsStore.get('savedFileLocation') ||  '';
    if (savedLocation){
        $('saved-file-location').value=savedLocation;
    }
    $('select-new-location').addEventListener('click', () => {
        remote.dialog.showOpenDialog({
            properties:['openDirectory','createDirectory '],
            message:'选择文件的储存路径',
            securityScopedBookmarks:true
        }).then(res=>{
            console.log(res)
            let {canceled,filePaths}=res
            if (!canceled){
                $('saved-file-location').value=filePaths[0];
                savedLocation=filePaths[0];
            }
        })
    })
    //表单提交
    $('settings-form').addEventListener('submit',()=>{
        settingsStore.set('savedFileLocation',savedLocation)
        // remote.getCurrentWindow().close()
        console.log(remote.app.getPath('userData'))

    })
})


// window.addEventListener('beforeunload',()=> {
//
// })
